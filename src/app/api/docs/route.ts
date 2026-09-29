import { NextRequest, NextResponse } from 'next/server';
import { ProviderFactory } from '@/lib/ai/providerFactory';
import { DocumentationRequest } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DocumentationRequest;

    if (!body.code || typeof body.code !== 'string' || body.code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request: "code" snippet is required.' },
        { status: 400 }
      );
    }

    const result = await ProviderFactory.document({
      code: body.code,
      language: body.language || 'typescript',
      format: body.format || 'tsdoc',
      providerConfig: body.providerConfig,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/docs] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Documentation generation failure.' },
      { status: 500 }
    );
  }
}
