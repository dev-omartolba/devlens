import { NextRequest, NextResponse } from 'next/server';
import { ProviderFactory } from '@/lib/ai/providerFactory';
import { ExplanationRequest } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExplanationRequest;

    if (!body.code || typeof body.code !== 'string' || body.code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request: "code" snippet is required.' },
        { status: 400 }
      );
    }

    const result = await ProviderFactory.explain({
      code: body.code,
      language: body.language || 'typescript',
      detailLevel: body.detailLevel || 'in-depth',
      providerConfig: body.providerConfig,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/explain] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Code explanation failure.' },
      { status: 500 }
    );
  }
}
