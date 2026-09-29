import { NextRequest, NextResponse } from 'next/server';
import { ProviderFactory } from '@/lib/ai/providerFactory';
import { TestGenRequest } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TestGenRequest;

    if (!body.code || typeof body.code !== 'string' || body.code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request: "code" snippet is required.' },
        { status: 400 }
      );
    }

    const result = await ProviderFactory.generateTests({
      code: body.code,
      language: body.language || 'typescript',
      framework: body.framework || 'vitest',
      providerConfig: body.providerConfig,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/tests] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Test suite synthesis failure.' },
      { status: 500 }
    );
  }
}
