import {
  AIProvider,
  ProviderConfig,
  DiagnosticRequest,
  DiagnosticResult,
  ExplanationRequest,
  ExplanationResult,
  DocumentationRequest,
  DocumentationResult,
  TestGenRequest,
  TestGenResult,
} from './types';
import { HeuristicEngine } from './heuristicEngine';
import { GeminiProvider } from './geminiProvider';
import { OpenAIProvider } from './openaiProvider';
import { ClaudeProvider } from './claudeProvider';

export class ProviderFactory {
  public static async diagnose(req: DiagnosticRequest): Promise<DiagnosticResult> {
    const provider = req.providerConfig?.provider || 'heuristic';
    const apiKey = req.providerConfig?.apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];

    if (provider === 'gemini' && apiKey) {
      try {
        const p = new GeminiProvider(apiKey, req.providerConfig?.model || 'gemini-1.5-flash');
        return await p.diagnose(req);
      } catch (err) {
        console.warn('[DevLens] Gemini failed, falling back to heuristic engine:', err);
      }
    }

    if (provider === 'openai' && apiKey) {
      try {
        const p = new OpenAIProvider(apiKey, req.providerConfig?.model || 'gpt-4o-mini');
        return await p.diagnose(req);
      } catch (err) {
        console.warn('[DevLens] OpenAI failed, falling back to heuristic engine:', err);
      }
    }

    if (provider === 'claude' && apiKey) {
      try {
        const p = new ClaudeProvider(apiKey, req.providerConfig?.model || 'claude-3-5-sonnet-20241022');
        return await p.diagnose(req);
      } catch (err) {
        console.warn('[DevLens] Claude failed, falling back to heuristic engine:', err);
      }
    }

    // Default & offline fallback
    return HeuristicEngine.diagnose(req);
  }

  public static async explain(req: ExplanationRequest): Promise<ExplanationResult> {
    const provider = req.providerConfig?.provider || 'heuristic';
    const apiKey = req.providerConfig?.apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];

    if (provider === 'gemini' && apiKey) {
      try {
        const p = new GeminiProvider(apiKey);
        return await p.explain(req);
      } catch (err) {
        console.warn('[DevLens] Gemini failed, falling back to heuristic engine:', err);
      }
    }

    if (provider === 'openai' && apiKey) {
      try {
        const p = new OpenAIProvider(apiKey);
        return await p.explain(req);
      } catch (err) {
        console.warn('[DevLens] OpenAI failed, falling back to heuristic engine:', err);
      }
    }

    if (provider === 'claude' && apiKey) {
      try {
        const p = new ClaudeProvider(apiKey);
        return await p.explain(req);
      } catch (err) {
        console.warn('[DevLens] Claude failed, falling back to heuristic engine:', err);
      }
    }

    return HeuristicEngine.explain(req);
  }

  public static async document(req: DocumentationRequest): Promise<DocumentationResult> {
    const provider = req.providerConfig?.provider || 'heuristic';
    const apiKey = req.providerConfig?.apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];

    if (provider === 'gemini' && apiKey) {
      try {
        const p = new GeminiProvider(apiKey);
        return await p.document(req);
      } catch (err) {
        console.warn('[DevLens] Gemini failed, falling back to heuristic engine:', err);
      }
    }

    if (provider === 'openai' && apiKey) {
      try {
        const p = new OpenAIProvider(apiKey);
        return await p.document(req);
      } catch (err) {
        console.warn('[DevLens] OpenAI failed, falling back to heuristic engine:', err);
      }
    }

    if (provider === 'claude' && apiKey) {
      try {
        const p = new ClaudeProvider(apiKey);
        return await p.document(req);
      } catch (err) {
        console.warn('[DevLens] Claude failed, falling back to heuristic engine:', err);
      }
    }

    return HeuristicEngine.document(req);
  }

  public static async generateTests(req: TestGenRequest): Promise<TestGenResult> {
    const provider = req.providerConfig?.provider || 'heuristic';
    const apiKey = req.providerConfig?.apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];

    if (provider === 'gemini' && apiKey) {
      try {
        const p = new GeminiProvider(apiKey);
        return await p.generateTests(req);
      } catch (err) {
        console.warn('[DevLens] Gemini failed, falling back to heuristic engine:', err);
      }
    }

    if (provider === 'openai' && apiKey) {
      try {
        const p = new OpenAIProvider(apiKey);
        return await p.generateTests(req);
      } catch (err) {
        console.warn('[DevLens] OpenAI failed, falling back to heuristic engine:', err);
      }
    }

    if (provider === 'claude' && apiKey) {
      try {
        const p = new ClaudeProvider(apiKey);
        return await p.generateTests(req);
      } catch (err) {
        console.warn('[DevLens] Claude failed, falling back to heuristic engine:', err);
      }
    }

    return HeuristicEngine.generateTests(req);
  }
}
