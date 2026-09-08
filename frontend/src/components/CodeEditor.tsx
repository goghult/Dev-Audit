import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, language, onChange, readOnly = false }) => {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border-default bg-bg-secondary shadow-inner">
      <Editor
        height="100%"
        language={language.toLowerCase()}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          readOnly,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          bracketPairColorization: { enabled: true, independentColorPoolPerBracketType: true },
          formatOnPaste: true,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
        }}
        loading={
          <div className="h-full w-full flex items-center justify-center bg-bg-secondary text-text-muted">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Initializing Editor...</span>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;
