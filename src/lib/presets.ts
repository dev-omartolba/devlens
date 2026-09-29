export interface SamplePreset {
  id: string;
  title: string;
  category: string;
  language: string;
  errorTrace: string;
  code: string;
  description: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'null-pointer-js',
    title: 'Cannot read properties of undefined (reading "avatar")',
    category: 'Runtime TypeError',
    language: 'typescript',
    errorTrace: `TypeError: Cannot read properties of undefined (reading 'avatar')
    at renderUserProfile (/app/src/components/UserProfile.tsx:24:28)
    at renderWithHooks (/app/node_modules/react-dom/cjs/react-dom.development.js:16305:18)
    at mountIndeterminateComponent (/app/node_modules/react-dom/cjs/react-dom.development.js:20074:13)
    at beginWork (/app/node_modules/react-dom/cjs/react-dom.development.js:21587:16)`,
    code: `interface User {
  id: string;
  name: string;
  profile?: {
    avatar: string;
    bio: string;
  };
}

export function renderUserProfile(user: User) {
  // Bug: Direct access when profile is undefined or loading
  const avatarUrl = user.profile.avatar;
  const bio = user.profile.bio;

  return {
    avatar: avatarUrl,
    bio: bio,
  };
}`,
    description: 'Classic nested property access error occurring when optional nested records are not populated.'
  },
  {
    id: 'react-hydration-ssr',
    title: 'React Hydration Mismatch (SSR)',
    category: 'React / Next.js',
    language: 'typescript',
    errorTrace: `Error: Hydration failed because the initial UI does not match what was rendered on the server.
Warning: Expected server HTML to contain a matching <span> in <div>.
    at span
    at UserClock (/app/src/components/UserClock.tsx:12:10)
    at div
    at DashboardLayout (/app/src/app/dashboard/layout.tsx:45:12)`,
    code: `export function UserClock() {
  // Bug: dynamic client timestamp mismatch with SSR output
  const time = new Date().toLocaleTimeString();
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

  return (
    <div className="clock-badge">
      <span>Current Time: {time}</span>
      <span>Viewport: {screenWidth}px</span>
    </div>
  );
}`,
    description: 'Server vs client DOM divergence caused by non-deterministic Date and window measurements.'
  },
  {
    id: 'python-index-error',
    title: 'Python IndexError: list index out of range',
    category: 'Python Runtime',
    language: 'python',
    errorTrace: `Traceback (most recent call last):
  File "/srv/etl/pipeline.py", line 42, in process_batch
    primary_metric = records[target_index]
IndexError: list index out of range`,
    code: `def process_batch(records: list, target_index: int):
    # Attempting direct subscript access without bounds verification
    primary_metric = records[target_index]
    return {
        "status": "success",
        "metric": primary_metric * 1.5
    }`,
    description: 'Unchecked index subscript access on variable-length list batch.'
  },
  {
    id: 'sql-injection-sec',
    title: 'OWASP SQL Injection Vulnerability',
    category: 'Security Smell',
    language: 'typescript',
    errorTrace: `Diagnostic Warning: CWE-89 Potential SQL Injection risk identified in query composition.`,
    code: `import { db } from './database';

export async function getUserProfile(userId: string) {
  // Severe vulnerability: Raw string concatenation in query
  const query = "SELECT id, email, role FROM users WHERE id = '" + userId + "'";
  const results = await db.query(query);
  return results[0];
}`,
    description: 'Raw string concatenation vulnerable to malicious input escape and schema exfiltration.'
  },
  {
    id: 'ts-type-mismatch',
    title: 'TypeScript TS2322: Type Mismatch',
    category: 'Compiler Diagnostic',
    language: 'typescript',
    errorTrace: `src/services/auth.ts(18,5): error TS2322: Type 'string | null' is not assignable to type 'string'.
  Type 'null' is not assignable to type 'string'.`,
    code: `interface AuthSession {
  token: string;
  refreshToken: string;
}

export function saveSession(rawToken: string | null): AuthSession {
  // Bug: rawToken can be null, violating AuthSession.token contract
  return {
    token: rawToken,
    refreshToken: "active-refresh",
  };
}`,
    description: 'Strict null check compiler failure when nullable argument is passed to non-nullable type.'
  }
];
