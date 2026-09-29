import { SecurityFinding } from '../ai/types';

interface Rule {
  id: string;
  title: string;
  severity: SecurityFinding['severity'];
  cwe: string;
  description: string;
  recommendation: string;
  pattern: RegExp;
}

const SECURITY_RULES: Rule[] = [
  {
    id: 'SEC-001',
    title: 'Potential SQL Injection via Raw Concatenation',
    severity: 'critical',
    cwe: 'CWE-89',
    description: 'Direct string interpolation or concatenation detected inside SQL query string.',
    recommendation: 'Use parameterized queries or prepared statements (e.g. `db.query("SELECT * FROM users WHERE id = $1", [id])`).',
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE|DROP)\s+.*?\+\s*[\w\.\$]+|`SELECT.*?(\${.*?})/i,
  },
  {
    id: 'SEC-002',
    title: 'Arbitrary Code Execution via eval() or Function constructor',
    severity: 'critical',
    cwe: 'CWE-95',
    description: 'Dynamic execution of untrusted code using `eval()` or `new Function()` can lead to Remote Code Execution.',
    recommendation: 'Eliminate `eval()`. Use structured data formats (JSON.parse) or isolated safe expression evaluators.',
    pattern: /\beval\s*\(|new\s+Function\s*\(/,
  },
  {
    id: 'SEC-003',
    title: 'Cross-Site Scripting (XSS) via dangerouslySetInnerHTML or innerHTML',
    severity: 'high',
    cwe: 'CWE-79',
    description: 'Directly injecting unsanitized HTML into the DOM permits arbitrary script execution in victim browsers.',
    recommendation: 'Sanitize untrusted content using DOMPurify before rendering, or rely on standard React text node escaping.',
    pattern: /dangerouslySetInnerHTML\s*=|(?:\.innerHTML\s*=)/,
  },
  {
    id: 'SEC-004',
    title: 'Hardcoded Secret / API Credential Pattern Detected',
    severity: 'high',
    cwe: 'CWE-798',
    description: 'A literal API key, private token, or secret string appears hardcoded directly in source code.',
    recommendation: 'Extract secrets to environment variables accessed via `process.env` or a secure secrets manager.',
    pattern: /(?:api_?key|secret|password|token|bearer)\s*[:=]\s*["'][A-Za-z0-9_\-]{20,}["']/i,
  },
  {
    id: 'SEC-005',
    title: 'Potential Path Traversal in File Operations',
    severity: 'high',
    cwe: 'CWE-22',
    description: 'File path construction with raw user-controlled variables without path canonicalization.',
    recommendation: 'Validate paths with `path.normalize()` and assert that the resolved path resides strictly within the target root directory.',
    pattern: /fs\.(?:readFile|writeFile|readFileSync|createReadStream)\s*\([^)]*\+/,
  },
  {
    id: 'SEC-006',
    title: 'Insecure Direct Object Reference / Unchecked Parameter in Query',
    severity: 'medium',
    cwe: 'CWE-639',
    description: 'Resource queried directly by client-supplied ID without verifying ownership or workspace tenancy.',
    recommendation: 'Ensure multi-tenant authorization guards inspect session user identity against resource owner ID.',
    pattern: /where\s*:\s*\{\s*id\s*:\s*req\.params\.id\s*\}/i,
  }
];

export function auditCodeSecurity(code: string): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const lines = code.split('\n');

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    for (const rule of SECURITY_RULES) {
      if (rule.pattern.test(line)) {
        findings.push({
          ruleId: rule.id,
          title: rule.title,
          severity: rule.severity,
          description: rule.description,
          cwe: rule.cwe,
          lineNumber: idx + 1,
          recommendation: rule.recommendation,
        });
      }
    }
  }

  return findings;
}
