# DevLens

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)
![Tests](https://img.shields.io/badge/Tests-13%20Passed-emerald)

**An intelligent, multi-runtime code intelligence and diagnostic studio.**  
Diagnose stack traces, explain complex algorithms, identify OWASP security smells, synthesize unified git diffs, and generate unit tests across JavaScript, TypeScript, Python, and Go.

[Features](#features) • [Architecture](#architecture) • [Quickstart](#installation) • [API Reference](#api-reference) • [Testing](#testing)

</div>

---

## Overview

Modern software development involves diagnosing cryptic stack traces, compiler errors, and subtle runtime defects under pressure. **DevLens** provides developers with a local-first, privacy-conscious workbench that:

1. **Parses call stacks and compiler diagnostics** across V8 (Node/Chrome), Python tracebacks, Go panics, and TypeScript compiler errors.
2. **Explains root causes** in plain, actionable developer language, highlighting underlying runtime mechanics (null pointers, hydration mismatches, bounds violations, race conditions).
3. **Synthesizes unified git patches** (`.diff` / `.patch`) with automated defensive guards and modern safe access patterns.
4. **Performs static security auditing** for common OWASP vulnerabilities (SQL Injection, XSS, dangerous `eval`, exposed tokens).
5. **Generates documentation and unit tests** (Vitest, Jest, Pytest) with complete assertions for boundary conditions.
6. **Works 100% offline out-of-the-box** via an embedded heuristic rule engine, with optional live cloud LLM adapters (Google Gemini, OpenAI GPT-4o, Anthropic Claude).

---

## Features

### 🩺 1. Diagnostic Studio
- **Multi-Runtime Error Parser**: Extracts file paths, line numbers, function symbols, and error classifications from raw stack traces.
- **Root Cause & Impact Analysis**: Technical explanations detailing *why* an error occurred and its downstream consequences.
- **Automated Unified Git Diff**: Side-by-side patch viewer highlighting additions and deletions, with single-click clipboard copying and `.patch` file export.
- **One-Click Scenario Presets**: Instant demonstration presets including React Hydration Mismatch, Python `IndexError`, V8 `TypeError: Cannot read properties of undefined`, SQL Injection, and TypeScript type mismatch.

### 🧠 2. Code Explainer & Complexity Analyzer
- **Algorithmic Complexity Gauges**: Asymptotic time complexity ($O(1)$, $O(n)$, $O(n^2)$) and auxiliary space complexity estimates.
- **Cyclomatic Risk Assessment**: Measures decision path density and evaluates long-term maintainability on a 0–100 scale.
- **Static Security Auditing**: Real-time pattern detection for CWE-89 (SQLi), CWE-79 (XSS), CWE-95 (Code Execution), and CWE-798 (Hardcoded Secrets).

### 📑 3. Doc Synthesizer
- Generates standards-compliant documentation in multiple formats:
  - **TSDoc / JSDoc**: Param types, returns, and `@throws` contracts.
  - **Python Docstrings**: Google-style / Sphinx-compatible docstrings.
  - **Markdown API Specs**: Structured tables and signatures for developer portals.

### 🧪 4. Test Forge
- Auto-generates exhaustive unit test suites covering:
  - Happy path baseline assertions.
  - Boundary and edge-case null/empty inputs.
  - Defensive error handling and rejection scenarios.
- Supported frameworks: **Vitest**, **Jest**, and **Pytest**.

### ⚡ 5. Resilient Multi-Provider AI Architecture
- **Offline Heuristic Engine**: Zero network latency, zero costs, 100% private.
- **Pluggable Cloud LLM Adapters**: Google Gemini, OpenAI, and Anthropic Claude.
- **Automatic Fallback**: If an external provider experiences quota limits or network interruptions, DevLens falls back gracefully to local heuristic analysis.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Frontend** | React 19, TypeScript 5, Tailwind CSS v4, Lucide Icons |
| **Analysis Engines** | AST Parser, Diff Engine (`diff`), Static Security Rules |
| **AI Layer** | Multi-Provider Engine (Heuristic Offline, Gemini, OpenAI, Claude) |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert`), `tsx` |
| **Persistence** | LocalStorage sandbox for analysis sessions and audit trails |

---

## Architecture

```
                    ┌────────────────────────┐
                    │     DevLens Client     │
                    │ (Next.js 16 / React 19)│
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │     App Router APIs    │
                    │  (/api/analyze, etc.)  │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │                                               │
┌───────▼─────────────────┐                   ┌─────────▼──────────────┐
│  Static Analysis Core   │                   │   AI Provider Factory  │
├─────────────────────────┤                   ├────────────────────────┤
│ • StackTraceParser      │                   │ • Heuristic Engine     │
│ • DiffGenerator         │                   │ • Google Gemini        │
│ • SecurityAuditor       │                   │ • OpenAI GPT-4o        │
└─────────────────────────┘                   │ • Anthropic Claude     │
                                              └────────────────────────┘
```

---

## Installation

### Prerequisites
- Node.js `>= 18.0.0` (tested on Node.js `v26.0.0`)
- npm `>= 9.0.0`

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dev-omartolba/devlens.git
   cd devlens
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables (optional)**:
   ```bash
   cp .env.example .env
   ```
   > *Note:* DevLens runs fully functional without any API keys using its built-in offline engine.

---

## Running Locally

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## API Reference

### `POST /api/analyze`
Submits an error trace and optional code snippet for diagnosis.

**Request Body:**
```json
{
  "errorTrace": "TypeError: Cannot read properties of undefined (reading 'avatar')\n    at renderUserProfile (/app/src/UserProfile.tsx:24:28)",
  "code": "export function renderUserProfile(user: any) {\n  return user.profile.avatar;\n}",
  "providerConfig": {
    "provider": "heuristic"
  }
}
```

**Response:**
```json
{
  "parsedTrace": {
    "language": "javascript",
    "errorType": "TypeError",
    "category": "NULL_POINTER",
    "primaryLocation": { "fileName": "/app/src/UserProfile.tsx", "lineNumber": 24 }
  },
  "explanation": {
    "summary": "Attempted to access property 'avatar' on an undefined or null reference",
    "rootCause": "Object reference evaluated to undefined before member access 'avatar'.",
    "consequences": "Execution halts immediately with a fatal TypeError.",
    "preventativeTips": ["Use optional chaining: `obj?.avatar`"]
  },
  "suggestedFix": {
    "description": "Introduced optional chaining for safe access to 'avatar'.",
    "patchedCode": "export function renderUserProfile(user: any) {\n  return user.profile?.avatar;\n}",
    "unifiedDiff": "--- a/snippet.ts\n+++ b/snippet.ts\n@@ -1,3 +1,3 @@\n export function renderUserProfile(user: any) {\n-  return user.profile.avatar;\n+  return user.profile?.avatar;\n }"
  },
  "securityFindings": [],
  "providerUsed": "heuristic",
  "latencyMs": 4
}
```

### `POST /api/explain`
Calculates architectural flow, complexity scores, and security findings for a source module.

### `POST /api/docs`
Generates typed docstrings and API specifications.

### `POST /api/tests`
Synthesizes test suites with happy path and boundary conditions.

### `GET /api/health`
Health check endpoint reporting operational telemetry and adapter statuses.

---

## Project Structure

```
devlens/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts       # Diagnostic API
│   │   │   ├── docs/route.ts          # Documentation API
│   │   │   ├── explain/route.ts       # Code explanation API
│   │   │   ├── health/route.ts        # Telemetry health check
│   │   │   └── tests/route.ts         # Test generation API
│   │   ├── globals.css                # Custom styling & dark mode tokens
│   │   ├── layout.tsx                 # Root layout & typography
│   │   └── page.tsx                   # Main Studio interactive interface
│   ├── components/
│   │   ├── Header.tsx                 # Navigation, status, and provider picker
│   │   ├── DiagnosticStudio.tsx       # Core error analysis and patch workbench
│   │   ├── CodeExplainer.tsx          # Complexity dials and architecture breakdown
│   │   ├── DocSynthesizer.tsx         # TSDoc/JSDoc/Markdown generator
│   │   ├── TestForge.tsx              # Unit test generation interface
│   │   ├── DiffViewer.tsx             # Interactive unified git diff component
│   │   ├── HistoryDrawer.tsx          # Session persistence drawer
│   │   └── SettingsModal.tsx          # Local credentials configuration
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── types.ts               # Core domain models and provider types
│   │   │   ├── heuristicEngine.ts     # Offline static diagnostic engine
│   │   │   ├── geminiProvider.ts      # Google Gemini API adapter
│   │   │   ├── openaiProvider.ts      # OpenAI GPT-4o adapter
│   │   │   ├── claudeProvider.ts      # Anthropic Claude adapter
│   │   │   └── providerFactory.ts     # Resilient provider orchestration
│   │   ├── analyzer/
│   │   │   ├── stackTraceParser.ts    # Multi-runtime stack trace parser
│   │   │   ├── diffGenerator.ts       # Git diff computation engine
│   │   │   └── securityRules.ts       # Static OWASP security rule auditor
│   │   ├── presets.ts                 # Preset real-world error scenarios
│   │   └── storage/
│   │       └── historyStore.ts        # Local browser persistence store
│   └── __tests__/
│       ├── diffAndSecurity.test.ts    # Diff and security auditor tests
│       ├── heuristicEngine.test.ts    # Diagnostic engine tests
│       └── stackTraceParser.test.ts   # Stack trace parser tests
├── .env.example
├── LICENSE
├── package.json
├── tsconfig.json
└── README.md
```

---

## Testing

DevLens includes an automated test suite verifying parser accuracy, heuristic diagnostic rules, diff generation, and security pattern detection:

```bash
npm run test
```

### Test Coverage Highlights
- Stack trace parsing across V8 (JavaScript), Python tracebacks, Go panics, and TypeScript diagnostics.
- Defensive optional chaining patch generation and SSR hydration mismatch recovery.
- Asymptotic runtime complexity calculation ($O(1)$, $O(n)$, $O(n^2)$) and maintainability scoring.
- OWASP Top 10 static pattern detection (SQL Injection, dangerous `eval`, XSS `dangerouslySetInnerHTML`).

---

## Roadmap

- [ ] AST-based refactoring suggestions via Babel / TypeScript Compiler API.
- [ ] VS Code Extension companion connecting directly to local DevLens daemon.
- [ ] Integration with GitHub Actions for automated PR error triage.
- [ ] Support for Rust compiler diagnostic messages.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-new-feature`.
3. Commit your changes following Conventional Commits: `git commit -m 'feat: add Rust compiler diagnostic parser'`.
4. Ensure all tests pass: `npm run test` and `npm run build`.
5. Open a Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE) © 2026 Omar Tolba.
