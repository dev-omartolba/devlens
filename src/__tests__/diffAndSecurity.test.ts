import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateUnifiedDiff } from '../lib/analyzer/diffGenerator';
import { auditCodeSecurity } from '../lib/analyzer/securityRules';

describe('DiffGenerator', () => {
  test('returns hasChanges false when inputs are identical', () => {
    const code = 'const x = 10;';
    const diff = generateUnifiedDiff(code, code);

    assert.equal(diff.hasChanges, false);
    assert.equal(diff.additions, 0);
    assert.equal(diff.deletions, 0);
  });

  test('computes correct additions and deletions for unified diff', () => {
    const original = 'const x = user.profile.avatar;';
    const patched = 'const x = user?.profile?.avatar;';
    const diff = generateUnifiedDiff(original, patched, 'user.ts');

    assert.equal(diff.hasChanges, true);
    assert.ok(diff.additions >= 1);
    assert.ok(diff.deletions >= 1);
    assert.ok(diff.unifiedDiff.includes('--- a/user.ts'));
    assert.ok(diff.unifiedDiff.includes('+++ b/user.ts'));
    assert.ok(diff.unifiedDiff.includes('+const x = user?.profile?.avatar;'));
  });
});

describe('SecurityRules', () => {
  test('flags SQL injection vulnerability', () => {
    const code = `const q = "SELECT * FROM users WHERE id = '" + req.params.id + "'";`;
    const findings = auditCodeSecurity(code);

    assert.ok(findings.some(f => f.ruleId === 'SEC-001'));
    assert.equal(findings[0].severity, 'critical');
    assert.equal(findings[0].cwe, 'CWE-89');
  });

  test('flags dangerous eval execution', () => {
    const code = `const res = eval(userCode);`;
    const findings = auditCodeSecurity(code);

    assert.ok(findings.some(f => f.ruleId === 'SEC-002'));
    assert.equal(findings[0].severity, 'critical');
  });

  test('flags XSS dangerouslySetInnerHTML', () => {
    const code = `<div dangerouslySetInnerHTML={{ __html: rawInput }} />`;
    const findings = auditCodeSecurity(code);

    assert.ok(findings.some(f => f.ruleId === 'SEC-003'));
    assert.equal(findings[0].severity, 'high');
  });
});
