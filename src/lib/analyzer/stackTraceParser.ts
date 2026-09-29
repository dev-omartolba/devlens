import { ParsedStackTrace, StackFrame } from '../ai/types';

/**
 * Intelligent Multi-Runtime Stack Trace & Diagnostic Parser
 */
export function parseStackTrace(rawTrace: string, codeSnippet?: string): ParsedStackTrace {
  const trimmed = rawTrace.trim();

  // Detect runtime language
  if (trimmed.includes('Traceback (most recent call last):') || trimmed.includes('File "') && trimmed.includes('line ')) {
    return parsePythonTraceback(trimmed);
  }

  if (trimmed.includes('panic:') || trimmed.includes('.go:') || trimmed.includes('goroutine ')) {
    return parseGoPanic(trimmed);
  }

  if (trimmed.includes('error TS') || /TS\d{4}:/.test(trimmed)) {
    return parseTypeScriptError(trimmed);
  }

  // Default to JavaScript / V8 / Node / React format
  return parseV8StackTrace(trimmed, codeSnippet);
}

function parseV8StackTrace(trace: string, codeSnippet?: string): ParsedStackTrace {
  const lines = trace.split('\n').map(l => l.trim());
  const firstLine = lines[0] || 'Error';
  
  let errorType = 'Error';
  let errorMessage = firstLine;

  const colonIdx = firstLine.indexOf(':');
  if (colonIdx > -1) {
    errorType = firstLine.slice(0, colonIdx).trim();
    errorMessage = firstLine.slice(colonIdx + 1).trim();
  }

  const frames: StackFrame[] = [];
  const v8Regex = /^at\s+(?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+)\)?|(.+?):(\d+):(\d+))$/;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(v8Regex);
    if (match) {
      const functionName = match[1] || '<anonymous>';
      const fileName = match[2] || match[5] || 'unknown';
      const lineNumber = parseInt(match[3] || match[6] || '0', 10);
      const columnNumber = parseInt(match[4] || match[7] || '0', 10);

      const isInternal = fileName.includes('node_modules') || 
                         fileName.includes('node:') || 
                         fileName.startsWith('internal/');

      frames.push({
        functionName,
        fileName,
        lineNumber,
        columnNumber,
        isInternal,
      });
    }
  }

  const primaryFrame = frames.find(f => !f.isInternal) || frames[0];
  const category = categorizeError(errorType, errorMessage, trace);

  return {
    language: 'javascript',
    errorType,
    errorMessage,
    rawTrace: trace,
    frames,
    primaryLocation: primaryFrame ? {
      fileName: primaryFrame.fileName,
      lineNumber: primaryFrame.lineNumber,
      columnNumber: primaryFrame.columnNumber,
    } : undefined,
    category,
  };
}

function parsePythonTraceback(trace: string): ParsedStackTrace {
  const lines = trace.split('\n').map(l => l.trim()).filter(Boolean);
  const lastLine = lines[lines.length - 1] || 'Error';

  let errorType = 'Exception';
  let errorMessage = lastLine;
  const colonIdx = lastLine.indexOf(':');
  if (colonIdx > -1) {
    errorType = lastLine.slice(0, colonIdx).trim();
    errorMessage = lastLine.slice(colonIdx + 1).trim();
  }

  const frames: StackFrame[] = [];
  const pyRegex = /File\s+"([^"]+)",\s+line\s+(\d+)(?:,\s+in\s+(.+))?/;

  for (const line of lines) {
    const match = line.match(pyRegex);
    if (match) {
      const fileName = match[1];
      const lineNumber = parseInt(match[2], 10);
      const functionName = match[3] || '<module>';
      const isInternal = fileName.includes('site-packages') || fileName.includes('lib/python');

      frames.push({
        fileName,
        lineNumber,
        functionName,
        isInternal,
      });
    }
  }

  const primaryFrame = frames.slice().reverse().find(f => !f.isInternal) || frames[frames.length - 1];
  const category = categorizeError(errorType, errorMessage, trace);

  return {
    language: 'python',
    errorType,
    errorMessage,
    rawTrace: trace,
    frames,
    primaryLocation: primaryFrame ? {
      fileName: primaryFrame.fileName,
      lineNumber: primaryFrame.lineNumber,
    } : undefined,
    category,
  };
}

function parseTypeScriptError(trace: string): ParsedStackTrace {
  const lines = trace.split('\n').map(l => l.trim()).filter(Boolean);
  const tsRegex = /^(.+?)\((\d+),(\d+)\):\s*error\s*(TS\d+):\s*(.+)$/;

  const firstMatch = lines[0]?.match(tsRegex);
  if (firstMatch) {
    const fileName = firstMatch[1];
    const lineNumber = parseInt(firstMatch[2], 10);
    const columnNumber = parseInt(firstMatch[3], 10);
    const errorCode = firstMatch[4];
    const message = firstMatch[5];

    return {
      language: 'typescript',
      errorType: `TypeScript ${errorCode}`,
      errorMessage: message,
      rawTrace: trace,
      frames: [{
        fileName,
        lineNumber,
        columnNumber,
        isInternal: false,
      }],
      primaryLocation: { fileName, lineNumber, columnNumber },
      category: 'TYPE_ERROR',
    };
  }

  return {
    language: 'typescript',
    errorType: 'TypeScript Compilation Error',
    errorMessage: lines[0] || 'Unknown TypeScript compilation error',
    rawTrace: trace,
    frames: [],
    category: 'TYPE_ERROR',
  };
}

function parseGoPanic(trace: string): ParsedStackTrace {
  const lines = trace.split('\n').map(l => l.trim()).filter(Boolean);
  const panicLine = lines.find(l => l.startsWith('panic:')) || lines[0] || 'panic';
  const errorMessage = panicLine.replace(/^panic:\s*/, '');

  const frames: StackFrame[] = [];
  const goLineRegex = /^(.+?\.go):(\d+)(?:\s+\+0x[0-9a-f]+)?$/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(goLineRegex);
    if (match) {
      const prevFunc = i > 0 && !lines[i - 1].includes('.go:') ? lines[i - 1] : undefined;
      frames.push({
        fileName: match[1],
        lineNumber: parseInt(match[2], 10),
        functionName: prevFunc,
        isInternal: match[1].includes('/usr/local/go/') || match[1].includes('runtime/'),
      });
    }
  }

  return {
    language: 'go',
    errorType: 'Go Panic',
    errorMessage,
    rawTrace: trace,
    frames,
    primaryLocation: frames[0] ? {
      fileName: frames[0].fileName,
      lineNumber: frames[0].lineNumber,
    } : undefined,
    category: errorMessage.includes('nil pointer') ? 'NULL_POINTER' : 'LOGIC_ERROR',
  };
}

function categorizeError(errorType: string, message: string, raw: string): ParsedStackTrace['category'] {
  const combined = `${errorType} ${message} ${raw}`.toLowerCase();

  if (combined.includes('null') || combined.includes('undefined') || combined.includes('nil pointer') || combined.includes('nonetype')) {
    return 'NULL_POINTER';
  }
  if (combined.includes('hydration') || combined.includes('server-rendered html') || combined.includes('did not match')) {
    return 'HYDRATION_MISMATCH';
  }
  if (combined.includes('indexerror') || combined.includes('out of bounds') || combined.includes('rangeerror')) {
    return 'INDEX_OUT_OF_BOUNDS';
  }
  if (combined.includes('typeerror') || combined.includes('is not a function') || combined.includes('cannot assign') || combined.includes('ts2322')) {
    return 'TYPE_ERROR';
  }
  if (combined.includes('syntaxerror') || combined.includes('unexpected token') || combined.includes('invalid syntax')) {
    return 'SYNTAX_ERROR';
  }
  if (combined.includes('unhandledrejection') || combined.includes('unhandled promise')) {
    return 'UNHANDLED_REJECTION';
  }
  if (combined.includes('econnrefused') || combined.includes('timeout') || combined.includes('enotfound') || combined.includes('fetch failed')) {
    return 'NETWORK_ERROR';
  }
  return 'UNKNOWN';
}
