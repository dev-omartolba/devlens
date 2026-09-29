export type AIProvider = 'heuristic' | 'gemini' | 'openai' | 'claude';

export interface ProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
}

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface StackFrame {
  functionName?: string;
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
  isInternal: boolean;
}

export interface ParsedStackTrace {
  language: 'typescript' | 'javascript' | 'python' | 'go' | 'sql' | 'generic';
  errorType: string;
  errorMessage: string;
  rawTrace: string;
  frames: StackFrame[];
  primaryLocation?: {
    fileName: string;
    lineNumber: number;
    columnNumber?: number;
  };
  category: 
    | 'NULL_POINTER'
    | 'TYPE_ERROR'
    | 'SYNTAX_ERROR'
    | 'INDEX_OUT_OF_BOUNDS'
    | 'UNHANDLED_REJECTION'
    | 'HYDRATION_MISMATCH'
    | 'NETWORK_ERROR'
    | 'SECURITY_RISK'
    | 'LOGIC_ERROR'
    | 'UNKNOWN';
}

export interface SecurityFinding {
  ruleId: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  cwe?: string;
  lineNumber?: number;
  recommendation: string;
}

export interface CodeComplexity {
  estimatedTimeComplexity: string;
  estimatedSpaceComplexity: string;
  cyclomaticRisk: 'low' | 'moderate' | 'high';
  maintainabilityScore: number; // 0 - 100
  notes: string[];
}

export interface DiagnosticRequest {
  code?: string;
  errorTrace: string;
  language?: string;
  context?: string;
  providerConfig?: ProviderConfig;
}

export interface DiagnosticResult {
  parsedTrace: ParsedStackTrace;
  explanation: {
    summary: string;
    rootCause: string;
    consequences: string;
    preventativeTips: string[];
  };
  suggestedFix?: {
    description: string;
    patchedCode: string;
    unifiedDiff: string;
  };
  securityFindings: SecurityFinding[];
  providerUsed: AIProvider;
  latencyMs: number;
}

export interface ExplanationRequest {
  code: string;
  language: string;
  detailLevel?: 'high-level' | 'in-depth' | 'line-by-line';
  providerConfig?: ProviderConfig;
}

export interface ExplanationResult {
  architectureOverview: string;
  keyComponents: Array<{
    name: string;
    purpose: string;
    logicFlow: string;
  }>;
  complexity: CodeComplexity;
  securityFindings: SecurityFinding[];
  bestPractices: string[];
  providerUsed: AIProvider;
}

export interface DocumentationRequest {
  code: string;
  language: string;
  format: 'tsdoc' | 'jsdoc' | 'python-docstring' | 'markdown-spec';
  providerConfig?: ProviderConfig;
}

export interface DocumentationResult {
  documentedCode: string;
  apiSummary: Array<{
    identifier: string;
    kind: 'function' | 'class' | 'interface' | 'variable';
    description: string;
    parameters: Array<{ name: string; type: string; description: string }>;
    returns: { type: string; description: string };
  }>;
  markdownDoc: string;
  providerUsed: AIProvider;
}

export interface TestGenRequest {
  code: string;
  language: string;
  framework: 'vitest' | 'jest' | 'pytest' | 'testing';
  providerConfig?: ProviderConfig;
}

export interface TestGenResult {
  testCode: string;
  testSuites: Array<{
    name: string;
    cases: Array<{
      description: string;
      category: 'happy-path' | 'edge-case' | 'error-handling';
    }>;
  }>;
  coverageEstimate: string;
  providerUsed: AIProvider;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: 'diagnostic' | 'explanation' | 'documentation' | 'tests';
  title: string;
  snippet: string;
  language: string;
  tags: string[];
  resultSummary: string;
}
