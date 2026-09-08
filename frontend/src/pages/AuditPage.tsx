import React, { useState, useEffect } from 'react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { Play, Square, Code, FileText, ChevronDown, Sparkles } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import ResultsPanel from '../components/ResultsPanel';
import { useStreamingAnalysis } from '../hooks/useStreamingAnalysis';
import { generatePrDescription } from '../services/auditService';

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java',
  'C++', 'Go', 'Rust', 'C#', 'PHP', 'Ruby',
];

// ─── Provider definitions (mirrors /api/audit/providers) ─────────────────────
const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Gemini 2.0 Flash',
    badge: 'Google AI',
    icon: Sparkles,
    tagline: 'Multimodal · 1M context',
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-500/40',
    activeBg: 'bg-blue-500/15 border-blue-500/40 text-blue-300',
    inactiveBg: 'bg-bg-elevated border-border-default text-text-secondary hover:border-blue-500/30 hover:text-blue-300',
  },
] as const;

type ProviderId = (typeof PROVIDERS)[number]['id'];

// ─── Component ────────────────────────────────────────────────────────────────
const AuditPage: React.FC = () => {
  const [code, setCode] = useState(
    '// Paste your code here to analyze\n\nfunction calculateTotal(items) {\n  let total = 0;\n  for(let i=0; i<items.length; i++) {\n    total += items[i].price * items[i].qty;\n  }\n  return total;\n}'
  );
  const [language, setLanguage] = useState('JavaScript');
  const [provider, setProvider] = useState<ProviderId>('gemini');
  const [result, setResult] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const { output, isStreaming, error, startStream, stopStream } = useStreamingAnalysis();

  // Try to parse completed stream output as JSON
  useEffect(() => {
    if (!isStreaming && output && output.includes('{') && output.includes('}')) {
      try {
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.overallScore !== undefined || parsed.score !== undefined) {
            setResult(normalise(parsed));
          }
        }
      } catch {
        // Stream output wasn't JSON — it's raw text, shown by ResultsPanel directly
      }
    }
  }, [isStreaming, output]);

  useEffect(() => {
    if (error) {
      setAnalysisError(error);
    }
  }, [error]);

  const normalise = (raw: any) => ({
    ...raw,
    score: raw.overallScore ?? raw.score ?? 0,
    summary: raw.summary ?? '',
    securityIssues: raw.securityIssues ?? [],
    codeSmells: raw.codeSmells ?? [],
    complexity:
      typeof raw.complexity === 'object'
        ? {
            timeComplexity: raw.complexity.timeComplexity ?? 'N/A',
            spaceComplexity: raw.complexity.spaceComplexity ?? 'N/A',
            explanation: raw.complexity.explanation ?? '',
          }
        : {
            timeComplexity: raw.complexity ?? 'N/A',
            spaceComplexity: 'N/A',
            explanation: '',
          },
  });

  const handleAnalyze = async () => {
    setResult(null);
    setAnalysisError(null);
    try {
      // Stream local-model output so slow Ollama inference does not hit the blocking request timeout.
      await startStream(code, language, provider);
    } catch (err) {
      console.error('Analysis failed:', err);
      const responseMessage = (err as any)?.response?.data?.message;
      setAnalysisError(responseMessage || `${activeProvider.badge} analysis failed. Check the backend provider configuration.`);
    }
  };

  const handleGeneratePr = async () => {
    if (!result) return;
    try {
      const data = await generatePrDescription(code, result.refactoredCode ?? '', provider);
      setResult({ ...result, prDescription: (data as any).prDescription ?? data });
    } catch (err) {
      console.error(err);
    }
  };

  const activeProvider = PROVIDERS.find((p) => p.id === provider) ?? PROVIDERS[0];

  return (
    <div className="h-full flex flex-col bg-bg-primary overflow-hidden">
      {/* ── Top Action Bar ──────────────────────────────────────────────── */}
      <div className="h-auto min-h-16 flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-bg-secondary border-b border-border-default z-10 flex-shrink-0">

        {/* Left: language selector + provider switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Language */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-bg-elevated border border-border-default text-text-primary rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all cursor-pointer font-medium"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <Code className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary pointer-events-none" />
          </div>

          {/* Provider Switcher Pills */}
          <div className="flex items-center gap-1 bg-bg-primary/60 p-1 rounded-xl border border-border-default">
            {PROVIDERS.map((p) => {
              const Icon = p.icon;
              const isActive = provider === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  title={p.tagline}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                    isActive ? p.activeBg + ' shadow-sm' : p.inactiveBg
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{p.badge}</span>
                  {isActive && (
                    <span className="hidden sm:inline opacity-70 font-normal">
                      · {p.name}
                    </span>
                  )}
                  <span className="bg-success/20 text-success border border-success/30 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    FREE
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active provider tagline */}
          <span className="hidden lg:inline text-xs text-text-muted font-mono">
            {activeProvider.tagline}
          </span>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-3">
          {(error || analysisError) && (
            <span className="text-xs text-danger bg-danger/10 border border-danger/20 px-3 py-1.5 rounded-lg">
              {analysisError || error}
            </span>
          )}

          {isStreaming ? (
            <button
              onClick={stopStream}
              className="bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
            >
              <Square className="h-4 w-4 fill-current" />
              Stop
            </button>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={!code.trim()}
              className={`text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${activeProvider.gradient} hover:opacity-90 shadow-accent-primary/20`}
            >
              <Sparkles className="h-4 w-4" />
              Analyze with {activeProvider.badge}
            </button>
          )}

          {result && !result.prDescription && (
            <button
              onClick={handleGeneratePr}
              className="bg-bg-elevated hover:bg-bg-card border border-border-default hover:border-accent-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all text-text-primary"
            >
              <FileText className="h-4 w-4" />
              PR Description
            </button>
          )}
        </div>
      </div>

      {/* ── Split-Pane Workspace ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup orientation="horizontal">
          {/* Left: Editor */}
          <Panel defaultSize={50} minSize={30} className="relative flex flex-col bg-bg-secondary">
            {/* Tab bar */}
            <div className="h-10 bg-bg-elevated border-b border-border-default flex items-center px-4 gap-2 flex-shrink-0">
              <span className="text-xs font-mono text-text-muted">
                source.{language.toLowerCase().replace(/[^a-z0-9]/g, '')}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${activeProvider.gradient}`} />
                <span className="text-[10px] text-text-muted">{activeProvider.badge}</span>
              </div>
            </div>
            <div className="flex-1">
              <CodeEditor
                value={code}
                language={language}
                onChange={(val) => setCode(val || '')}
              />
            </div>
          </Panel>

          {/* Resize handle */}
          <PanelResizeHandle className="w-1.5 bg-bg-primary hover:bg-accent-primary/50 transition-colors cursor-col-resize flex flex-col justify-center items-center group">
            <div className="h-10 w-0.5 rounded-full bg-border-default group-hover:bg-accent-glow transition-colors" />
          </PanelResizeHandle>

          {/* Right: Results */}
          <Panel defaultSize={50} minSize={30} className="bg-bg-primary">
            <ResultsPanel
              isStreaming={isStreaming}
              result={result}
              rawStreamOutput={output}
              error={analysisError || error}
              providerName={activeProvider.name}
              providerBadge={activeProvider.badge}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default AuditPage;
