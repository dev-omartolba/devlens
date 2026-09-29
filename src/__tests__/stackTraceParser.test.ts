import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseStackTrace } from '../lib/analyzer/stackTraceParser';

describe('StackTraceParser', () => {
  test('parses Node.js V8 TypeError stack trace', () => {
    const trace = `TypeError: Cannot read properties of undefined (reading 'avatar')
    at renderUserProfile (/app/src/UserProfile.tsx:24:28)
    at renderWithHooks (/app/node_modules/react-dom/cjs/react-dom.js:16305:18)`;

    const result = parseStackTrace(trace);

    assert.equal(result.language, 'javascript');
    assert.equal(result.errorType, 'TypeError');
    assert.equal(result.category, 'NULL_POINTER');
    assert.equal(result.primaryLocation?.fileName, '/app/src/UserProfile.tsx');
    assert.equal(result.primaryLocation?.lineNumber, 24);
    assert.equal(result.primaryLocation?.columnNumber, 28);
  });

  test('parses Python traceback correctly', () => {
    const trace = `Traceback (most recent call last):
  File "/srv/etl/pipeline.py", line 42, in process_batch
    primary_metric = records[target_index]
IndexError: list index out of range`;

    const result = parseStackTrace(trace);

    assert.equal(result.language, 'python');
    assert.equal(result.errorType, 'IndexError');
    assert.equal(result.category, 'INDEX_OUT_OF_BOUNDS');
    assert.equal(result.primaryLocation?.fileName, '/srv/etl/pipeline.py');
    assert.equal(result.primaryLocation?.lineNumber, 42);
  });

  test('parses TypeScript compiler diagnostic error', () => {
    const trace = `src/auth.ts(18,5): error TS2322: Type 'string | null' is not assignable to type 'string'.`;

    const result = parseStackTrace(trace);

    assert.equal(result.language, 'typescript');
    assert.equal(result.category, 'TYPE_ERROR');
    assert.equal(result.primaryLocation?.fileName, 'src/auth.ts');
    assert.equal(result.primaryLocation?.lineNumber, 18);
    assert.equal(result.primaryLocation?.columnNumber, 5);
  });

  test('parses Go panic stack trace', () => {
    const trace = `panic: runtime error: invalid memory address or nil pointer dereference
main.go:34 +0x45`;

    const result = parseStackTrace(trace);

    assert.equal(result.language, 'go');
    assert.equal(result.category, 'NULL_POINTER');
    assert.equal(result.primaryLocation?.fileName, 'main.go');
    assert.equal(result.primaryLocation?.lineNumber, 34);
  });
});
