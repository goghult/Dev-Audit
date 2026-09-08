import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AlertTriangle, CheckCircle, ShieldAlert, Zap, Activity, Info, FileCode2, GitPullRequest } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import CodeEditor from './CodeEditor';

interface SecurityIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  line?: number;
}

interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
}

interface AuditResult {
  score: number;
  summary: string;
  securityIssues: SecurityIssue[];
  complexity: ComplexityAnalysis;
  codeSmells: string[];
  refactoredCode: string;
  prDescription: string;
}

interface ResultsPanelProps {
  isStreaming: boolean;
  result: AuditResult | null;
  rawStreamOutput: string;
  error?: string | null;
  providerName?: string;
  providerBadge?: string;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  isStreaming,
  result,
  rawStreamOutput,
  error,
  providerName = 'Gemini 2.0 Flash',
  providerBadge = 'Google AI',
}) => {
  if (!isStreaming && !result && !rawStreamOutput) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-text-muted p-8 text-center animate-fade-in">
        <div className="w-24 h-24 mb-6 rounded-full bg-bg-elevated flex items-center justify-center shadow-inner">
          <Activity className="h-12 w-12 text-accent-primary opacity-50" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">Ready to Audit</h3>
        <p className="max-w-md">
          Paste your code in the editor and click <strong>Analyze</strong> to detect security
          issues, analyse complexity, and generate a PR description.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-text-muted">
          <span>Choose a free AI provider above:</span>
          <span className="bg-blue-500/15 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded font-semibold">Google AI</span>
          <span className="text-text-muted">or</span>
          <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded font-semibold">Ollama</span>
        </div>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <span className="bg-danger/20 text-danger border border-danger/30 px-2 py-0.5 rounded text-xs font-bold">CRITICAL</span>;
      case 'HIGH': return <span className="bg-warning/20 text-warning border border-warning/30 px-2 py-0.5 rounded text-xs font-bold">HIGH</span>;
      case 'MEDIUM': return <span className="bg-info/20 text-info border border-info/30 px-2 py-0.5 rounded text-xs font-bold">MEDIUM</span>;
      default: return <span className="bg-text-muted/20 text-text-secondary border border-text-muted/30 px-2 py-0.5 rounded text-xs font-bold">LOW</span>;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
      {isStreaming && (
        <div className="glass-card p-4 flex items-center gap-4 border-accent-primary/30">
          <div className="w-4 h-4 rounded-full bg-accent-primary animate-pulse" />
          <div>
            <span className="text-accent-glow font-semibold">{providerBadge} is analysing your code…</span>
            <p className="text-xs text-text-muted mt-0.5">{providerName}</p>
          </div>
        </div>
      )}

      {!isStreaming && error && !result && (
        <div className="glass-card p-4 border-danger/30 bg-danger/10 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Raw Stream Output fallback during streaming if structured data isn't ready */}
      {isStreaming && !result && rawStreamOutput && (
        <div className="glass-card p-6 flex flex-col gap-4 animate-fade-in">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent-primary" />
            Live Analysis
          </h3>
          <div className="bg-bg-primary rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-text-secondary border border-border-default overflow-x-auto">
            {rawStreamOutput}
            <span className="inline-block w-2 h-4 bg-accent-primary animate-pulse ml-1 align-middle"></span>
          </div>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-6 animate-slide-up">
          {/* Header Card with Score */}
          <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex-1 z-10">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-gradient">
                <CheckCircle className="h-6 w-6 text-success" />
                1. Audit Summary
              </h2>
              <p className="text-text-secondary mb-4">
                We found {result.securityIssues.length} security issues and {result.codeSmells.length} code smells.
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-bg-primary px-4 py-2 rounded-lg border border-border-default">
                  <Zap className="h-5 w-5 text-warning" />
                  <span className="text-sm font-medium text-text-muted">Findings:</span>
                  <span className="font-mono font-bold text-text-primary">{result.securityIssues.length + result.codeSmells.length}</span>
                </div>
              </div>
            </div>
            
            <div className="z-10 bg-bg-primary/50 p-4 rounded-2xl border border-border-default backdrop-blur-sm">
              <ScoreGauge score={result.score} />
            </div>
          </div>

          {/* Plain-language summary and complexity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="glass-card p-6 delay-100 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-info" />
                <h3 className="text-lg font-semibold">What the audit found</h3>
              </div>
              <p className="text-sm leading-6 text-text-secondary">
                {result.summary || 'The audit did not provide a summary.'}
              </p>
            </div>

            <div className="glass-card p-6 delay-100 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-warning" />
                <h3 className="text-lg font-semibold">Performance at a glance</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-bg-primary border border-border-default rounded-lg p-3">
                  <span className="block text-xs uppercase tracking-wide text-text-muted mb-1">Time</span>
                  <span className="font-mono font-semibold text-text-primary">{result.complexity.timeComplexity}</span>
                </div>
                <div className="bg-bg-primary border border-border-default rounded-lg p-3">
                  <span className="block text-xs uppercase tracking-wide text-text-muted mb-1">Space</span>
                  <span className="font-mono font-semibold text-text-primary">{result.complexity.spaceComplexity}</span>
                </div>
              </div>
              {result.complexity.explanation && (
                <p className="text-sm leading-6 text-text-secondary">{result.complexity.explanation}</p>
              )}
            </div>
          </div>

          {/* Security Issues */}
          {result.securityIssues.length > 0 && (
            <div className="glass-card p-6 delay-100 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-danger">
                <ShieldAlert className="h-5 w-5" />
                2. Security Issues
              </h3>
              <div className="flex flex-col gap-3">
                {result.securityIssues.map((issue, idx) => (
                  <div key={idx} className="bg-bg-primary rounded-lg p-4 border border-border-default flex items-start gap-4 hover:border-danger/30 transition-colors">
                    <div className="mt-0.5">{getSeverityBadge(issue.severity)}</div>
                    <div className="flex-1">
                      <p className="text-text-primary text-sm">{issue.description}</p>
                      {issue.line && (
                        <span className="text-xs text-text-muted mt-2 inline-block font-mono bg-bg-secondary px-2 py-1 rounded">
                          Line {issue.line}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Smells */}
          {result.codeSmells.length > 0 && (
            <div className="glass-card p-6 delay-200 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                3. Code Smells & Quality
              </h3>
              <ul className="flex flex-col gap-2">
                {result.codeSmells.map((smell, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-bg-primary p-3 rounded-lg border border-border-default">
                    <Info className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-text-primary">{smell}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Refactored Code */}
          {result.refactoredCode && (
            <div className="glass-card p-0 overflow-hidden flex flex-col delay-300 animate-slide-up h-[400px]">
              <div className="p-4 border-b border-border-default bg-bg-elevated/50 flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-accent-primary" />
                <h3 className="text-lg font-semibold">4. Suggested Refactoring</h3>
              </div>
              <div className="flex-1">
                <CodeEditor value={result.refactoredCode} language="typescript" readOnly />
              </div>
            </div>
          )}

          {/* PR Description */}
          {result.prDescription && (
            <div className="glass-card p-6 delay-300 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-success">
                <GitPullRequest className="h-5 w-5" />
                5. Generated PR Description
              </h3>
              <div className="bg-bg-primary rounded-lg p-5 border border-border-default prose prose-invert prose-sm max-w-none prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-border-default">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result.prDescription}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
