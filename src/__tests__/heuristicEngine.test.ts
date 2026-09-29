import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { HeuristicEngine } from '../lib/ai/heuristicEngine';

describe('HeuristicEngine', () => {
  test('diagnoses null pointer property access and patches with optional chaining', () => {
    const errorTrace = `TypeError: Cannot read properties of undefined (reading 'avatar')
    at renderUserProfile (/app/src/UserProfile.tsx:24:28)`;
    const code = `const avatarUrl = user.profile.avatar;`;

    const result = HeuristicEngine.diagnose({ errorTrace, code });

    assert.equal(result.providerUsed, 'heuristic');
    assert.equal(result.parsedTrace.category, 'NULL_POINTER');
    assert.ok(result.explanation.rootCause.includes('undefined'));
    assert.ok(result.suggestedFix?.patchedCode.includes('profile?.avatar'));
    assert.ok(result.suggestedFix?.unifiedDiff.includes('+'));
  });

  test('diagnoses React hydration mismatch with SSR mounted guard patch', () => {
    const errorTrace = `Error: Hydration failed because the initial UI does not match what was rendered on the server.`;
    const code = `const time = new Date().toLocaleTimeString();`;

    const result = HeuristicEngine.diagnose({ errorTrace, code });

    assert.equal(result.parsedTrace.category, 'HYDRATION_MISMATCH');
    assert.ok(result.explanation.summary.includes('Hydration Mismatch'));
    assert.ok(result.suggestedFix?.patchedCode.includes('isMounted'));
  });

  test('generates architectural explanation and complexity metrics', () => {
    const code = `function bubbleSort(arr: number[]) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
          if (arr[i] > arr[j]) {
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
          }
        }
      }
      return arr;
    }`;

    const result = HeuristicEngine.explain({ code, language: 'typescript' });

    assert.equal(result.complexity.estimatedTimeComplexity, 'O(n²)');
    assert.ok(result.complexity.maintainabilityScore > 0);
    assert.ok(result.architectureOverview.length > 10);
    assert.ok(result.bestPractices.length > 0);
  });

  test('generates unit tests using specified framework', () => {
    const code = `export function add(a: number, b: number) { return a + b; }`;
    const result = HeuristicEngine.generateTests({ code, language: 'typescript', framework: 'vitest' });

    assert.ok(result.testCode.includes('describe('));
    assert.ok(result.testCode.includes('expect('));
    assert.ok(result.testSuites.length > 0);
  });
});
