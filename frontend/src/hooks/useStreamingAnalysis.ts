import { useState, useRef, useCallback } from 'react';

export function useStreamingAnalysis() {
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (code: string, language: string, provider: string = 'gemini') => {
      setIsStreaming(true);
      setOutput('');
      setError(null);

      abortControllerRef.current = new AbortController();
      const token = localStorage.getItem('token');

      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${apiBaseUrl}/audit/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ code, language, provider }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Server error ${response.status}: ${text}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('ReadableStream not supported');

        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Spring WebFlux SSE lines end with \n\n; split and process each
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('data:')) {
              const dataStr = trimmed.slice(5).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                const chunk =
                  parsed.content ?? parsed.text ?? parsed.delta?.content ?? dataStr;
                setOutput((prev) => prev + chunk);
              } catch {
                setOutput((prev) => prev + dataStr);
              }
            } else {
              // Raw text token (no SSE prefix)
              setOutput((prev) => prev + trimmed);
            }
          }
        }
      } catch (err: unknown) {
        const e = err as Error;
        if (e.name !== 'AbortError') {
          setError(e.message || 'An error occurred during streaming');
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  return { output, isStreaming, error, startStream, stopStream };
}
