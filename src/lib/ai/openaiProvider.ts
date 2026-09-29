import {
  DiagnosticRequest,
  DiagnosticResult,
  ExplanationRequest,
  ExplanationResult,
  DocumentationRequest,
  DocumentationResult,
  TestGenRequest,
  TestGenResult,
} from './types';
import { parseStackTrace } from '../analyzer/stackTraceParser';
import { generateUnifiedDiff } from '../analyzer/diffGenerator';
import { auditCodeSecurity } from '../analyzer/securityRules';

export class OpenAIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async callOpenAI(messages: Array<{ role: string; content: string }>): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  public async diagnose(req: DiagnosticRequest): Promise<DiagnosticResult> {
    const startTime = Date.now();
    const parsedTrace = parseStackTrace(req.errorTrace, req.code);
    const securityFindings = req.code ? auditCodeSecurity(req.code) : [];

    const prompt = `Analyze this code and runtime error. Respond ONLY in valid JSON:
{
  "summary": "one sentence summary",
  "rootCause": "detailed technical explanation",
  "consequences": "impact",
  "preventativeTips": ["tip 1", "tip 2"],
  "fixDescription": "explanation of patch",
  "patchedCode": "complete corrected code"
}

ERROR TRACE:
${req.errorTrace}

CODE:
${req.code || 'None'}`;

    const raw = await this.callOpenAI([
      { role: 'system', content: 'You are an expert compiler and diagnostic engineer. Output strictly JSON.' },
      { role: 'user', content: prompt }
    ]);

    let parsed: any = {};
    try {
      const cleaned = raw.replace(/^```json/m, '').replace(/```$/m, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        summary: 'OpenAI Diagnostic Analysis',
        rootCause: raw.slice(0, 500),
        consequences: 'Potential execution failure',
        preventativeTips: ['Verify inputs'],
        fixDescription: 'Patch generated',
        patchedCode: req.code || '',
      };
    }

    const patchedCode = parsed.patchedCode || req.code || '';
    const diff = generateUnifiedDiff(req.code || '', patchedCode);

    return {
      parsedTrace,
      explanation: {
        summary: parsed.summary || 'Diagnosis ready',
        rootCause: parsed.rootCause || 'Root cause analyzed',
        consequences: parsed.consequences || 'Prevented crash',
        preventativeTips: parsed.preventativeTips || [],
      },
      suggestedFix: req.code ? {
        description: parsed.fixDescription || 'Automated patch applied',
        patchedCode,
        unifiedDiff: diff.unifiedDiff,
      } : undefined,
      securityFindings,
      providerUsed: 'openai',
      latencyMs: Date.now() - startTime,
    };
  }

  public async explain(req: ExplanationRequest): Promise<ExplanationResult> {
    const securityFindings = auditCodeSecurity(req.code);
    const prompt = `Perform an architectural and complexity breakdown of this code. Output STRICT JSON:
{
  "architectureOverview": "text",
  "keyComponents": [{"name": "string", "purpose": "string", "logicFlow": "string"}],
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "cyclomaticRisk": "low | moderate | high",
  "maintainabilityScore": 85,
  "notes": ["note 1"],
  "bestPractices": ["practice 1"]
}

CODE (${req.language}):
${req.code}`;

    const raw = await this.callOpenAI([
      { role: 'system', content: 'You are an expert software architect. Output strictly JSON.' },
      { role: 'user', content: prompt }
    ]);

    let parsed: any = {};
    try {
      const cleaned = raw.replace(/^```json/m, '').replace(/```$/m, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        architectureOverview: raw.slice(0, 400),
        keyComponents: [],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        cyclomaticRisk: 'low',
        maintainabilityScore: 85,
        notes: [],
        bestPractices: [],
      };
    }

    return {
      architectureOverview: parsed.architectureOverview || 'Architecture summary',
      keyComponents: parsed.keyComponents || [],
      complexity: {
        estimatedTimeComplexity: parsed.timeComplexity || 'O(n)',
        estimatedSpaceComplexity: parsed.spaceComplexity || 'O(1)',
        cyclomaticRisk: parsed.cyclomaticRisk || 'low',
        maintainabilityScore: parsed.maintainabilityScore || 85,
        notes: parsed.notes || [],
      },
      securityFindings,
      bestPractices: parsed.bestPractices || [],
      providerUsed: 'openai',
    };
  }

  public async document(req: DocumentationRequest): Promise<DocumentationResult> {
    const prompt = `Synthesize professional ${req.format} documentation for this code.
Return STRICT JSON:
{
  "documentedCode": "full code with doc comments added",
  "markdownDoc": "markdown summary documentation"
}

CODE (${req.language}):
${req.code}`;

    const raw = await this.callOpenAI([
      { role: 'system', content: 'You are a technical documentation specialist. Output strictly JSON.' },
      { role: 'user', content: prompt }
    ]);

    let parsed: any = {};
    try {
      const cleaned = raw.replace(/^```json/m, '').replace(/```$/m, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { documentedCode: req.code, markdownDoc: raw };
    }

    return {
      documentedCode: parsed.documentedCode || req.code,
      apiSummary: [],
      markdownDoc: parsed.markdownDoc || 'Documentation synthesized',
      providerUsed: 'openai',
    };
  }

  public async generateTests(req: TestGenRequest): Promise<TestGenResult> {
    const prompt = `Generate exhaustive unit tests using ${req.framework} for this code.
Return STRICT JSON:
{
  "testCode": "full test code file contents",
  "coverageEstimate": "95%",
  "testSuites": [{"name": "string", "cases": [{"description": "string", "category": "happy-path"}]}]
}

CODE (${req.language}):
${req.code}`;

    const raw = await this.callOpenAI([
      { role: 'system', content: 'You are an automated testing and QA engineer. Output strictly JSON.' },
      { role: 'user', content: prompt }
    ]);

    let parsed: any = {};
    try {
      const cleaned = raw.replace(/^```json/m, '').replace(/```$/m, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { testCode: raw, coverageEstimate: '90%', testSuites: [] };
    }

    return {
      testCode: parsed.testCode || '// No tests generated',
      testSuites: parsed.testSuites || [],
      coverageEstimate: parsed.coverageEstimate || '90%',
      providerUsed: 'openai',
    };
  }
}
