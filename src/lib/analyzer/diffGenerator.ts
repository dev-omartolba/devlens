import * as Diff from 'diff';

export interface DiffResult {
  unifiedDiff: string;
  additions: number;
  deletions: number;
  hasChanges: boolean;
}

/**
 * Computes a standardized unified diff formatted like `git diff`
 */
export function generateUnifiedDiff(
  originalCode: string,
  patchedCode: string,
  fileName: string = 'snippet.ts'
): DiffResult {
  if (originalCode === patchedCode) {
    return {
      unifiedDiff: '',
      additions: 0,
      deletions: 0,
      hasChanges: false,
    };
  }

  const patch = Diff.createTwoFilesPatch(
    `a/${fileName}`,
    `b/${fileName}`,
    originalCode,
    patchedCode,
    'original',
    'patched',
    { context: 3 }
  );

  let additions = 0;
  let deletions = 0;

  const lines = patch.split('\n');
  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
    }
  }

  return {
    unifiedDiff: patch,
    additions,
    deletions,
    hasChanges: additions > 0 || deletions > 0,
  };
}
