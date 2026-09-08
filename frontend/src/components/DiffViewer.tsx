import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

interface DiffViewerProps {
  original: string;
  modified: string;
  language: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ original, modified, language }) => {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border-default bg-bg-secondary">
      <DiffEditor
        height="100%"
        language={language.toLowerCase()}
        theme="vs-dark"
        original={original}
        modified={modified}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          automaticLayout: true,
          renderSideBySide: true,
          padding: { top: 16, bottom: 16 },
        }}
        loading={
          <div className="h-full w-full flex items-center justify-center bg-bg-secondary text-text-muted">
            <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      />
    </div>
  );
};

export default DiffViewer;
