import api from './api';

export interface SecurityIssue {
  type?: string;
  owaspCategory?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  lineNumber?: number;
  suggestion?: string;
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  explanation?: string;
}

export interface CodeSmell {
  name?: string;
  description: string;
  lineNumber?: number;
  suggestion?: string;
}

export interface AuditResult {
  summary?: string;
  securityIssues: SecurityIssue[];
  complexity: ComplexityAnalysis | string;
  codeSmells: CodeSmell[] | string[];
  refactoredCode?: string;
  prDescription?: string;
  overallScore: number;
  // UI normalised
  score?: number;
}

export interface ProviderInfo {
  id: string;
  name: string;
  model: string;
  badge: string;
  color: string;
  free: boolean;
  description: string;
}

export const analyzeCode = async (
  code: string,
  language: string,
  provider: string = 'gemini'
) => {
  const response = await api.post<AuditResult>('/audit/analyze', {
    code,
    language,
    provider,
  });
  return response.data;
};

export const getHistory = async (page: number = 0, size: number = 10) => {
  const response = await api.get(`/audit/history?page=${page}&size=${size}`);
  return response.data;
};

export const getAuditById = async (id: string) => {
  const response = await api.get<AuditResult>(`/audit/${id}`);
  return response.data;
};

export const generatePrDescription = async (
  code: string,
  diff: string,
  provider: string = 'gemini'
) => {
  const response = await api.post('/audit/pr-description', { code, diff, provider });
  return response.data;
};

export const getProviders = async (): Promise<ProviderInfo[]> => {
  const response = await api.get<{ providers: ProviderInfo[] }>('/audit/providers');
  return response.data.providers;
};
