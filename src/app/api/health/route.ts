import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    service: 'DevLens Developer Intelligence Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      heuristicDiagnosticEngine: 'active',
      astErrorParser: 'active',
      gitDiffEngine: 'active',
      securityAuditor: 'active',
      geminiAdapter: Boolean(process.env.GEMINI_API_KEY) ? 'configured' : 'client_key_supported',
      openAiAdapter: Boolean(process.env.OPENAI_API_KEY) ? 'configured' : 'client_key_supported',
      claudeAdapter: Boolean(process.env.CLAUDE_API_KEY) ? 'configured' : 'client_key_supported',
    }
  });
}
