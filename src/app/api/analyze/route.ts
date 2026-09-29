import { NextRequest, NextResponse } from 'next/server';
import { ProviderFactory } from '@/lib/ai/providerFactory';
import { DiagnosticRequest } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DiagnosticRequest;

    if (!body.errorTrace || typeof body.errorTrace !== 'string' || body.errorTrace.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request: "errorTrace" is required.' },
        { status: 400 }
      );
    }

    const result = await ProviderFactory.diagnose(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/analyze] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal diagnostic processing failure.' },
      { status: 500 }
    );
  }
}
