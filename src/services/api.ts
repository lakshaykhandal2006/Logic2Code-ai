import {
  CodeGenResult,
  CodeDebugResult,
  CodeExplanationResult,
  CodeOptimizationResult,
  CodeTestCasesResult,
  LogicValidationResult,
  LogicCodeMatchResult,
  CodeConvertResult,
  DedicatedDryRunResult,
  PracticeProblem,
  PracticeHintResult,
  PracticeLogicCheckResult,
  PracticeSolutionResult,
  CombinedAnalysisResult,
  SupportedLanguage,
  DifficultyLevel,
  PracticeDifficulty,
  PracticeTopic,
} from '../types';

function extractErrorMessage(err: any, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === 'string') {
    try {
      const parsed = JSON.parse(err);
      if (parsed.error?.message) return parsed.error.message;
      if (parsed.message) return parsed.message;
    } catch {
      // not JSON string
    }
    return err;
  }
  if (typeof err === 'object') {
    if (err.error?.message) return err.error.message;
    if (err.message) return err.message;
  }
  return fallback;
}

// 1. Logic -> Code
export async function generateCode(params: {
  problem: string;
  logic: string;
  language: SupportedLanguage;
  difficulty: DifficultyLevel;
}): Promise<CodeGenResult> {
  const res = await fetch('/api/generate-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 2. Debug My Code
export async function debugCode(params: {
  code: string;
  language: SupportedLanguage;
  expectedBehavior?: string;
}): Promise<CodeDebugResult> {
  const res = await fetch('/api/debug-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// Backwards-compatible alias
export const reviewCode = debugCode;

// 3. Explain My Code
export async function explainCode(params: {
  code: string;
  language: SupportedLanguage;
  difficulty: DifficultyLevel;
}): Promise<CodeExplanationResult> {
  const res = await fetch('/api/explain-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 4. Optimize My Code
export async function optimizeCode(params: {
  code: string;
  language: SupportedLanguage;
}): Promise<CodeOptimizationResult> {
  const res = await fetch('/api/optimize-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 5. Test My Code
export async function testCode(params: {
  code: string;
  language: SupportedLanguage;
  expectedBehavior?: string;
}): Promise<CodeTestCasesResult> {
  const res = await fetch('/api/test-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 6. Validate My Logic
export async function validateLogic(params: {
  problem: string;
  logic: string;
}): Promise<LogicValidationResult> {
  const res = await fetch('/api/validate-logic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 7. Logic vs Code Checker
export async function checkLogicVsCode(params: {
  problem?: string;
  logic: string;
  code: string;
  language: SupportedLanguage;
}): Promise<LogicCodeMatchResult> {
  const res = await fetch('/api/check-logic-vs-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 8. Convert Code
export async function convertCode(params: {
  code: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}): Promise<CodeConvertResult> {
  const res = await fetch('/api/convert-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 9. Dedicated Dry Run
export async function runDryRun(params: {
  code: string;
  language: SupportedLanguage;
  sampleInput: string;
}): Promise<DedicatedDryRunResult> {
  const res = await fetch('/api/dry-run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 10. Practice: Generate Problem
export async function generatePracticeProblem(params: {
  topic: PracticeTopic;
  difficulty: PracticeDifficulty;
}): Promise<PracticeProblem> {
  const res = await fetch('/api/practice/generate-problem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 11. Practice: Get Progressive Hint
export async function getPracticeHint(params: {
  problem: string;
  userLogic?: string;
  hintLevel: number;
}): Promise<PracticeHintResult> {
  const res = await fetch('/api/practice/hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 12. Practice: Check Logic
export async function checkPracticeLogic(params: {
  problem: string;
  userLogic: string;
}): Promise<PracticeLogicCheckResult> {
  const res = await fetch('/api/practice/check-logic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 13. Practice: Get Solution
export async function getPracticeSolution(params: {
  problem: string;
  language: SupportedLanguage;
}): Promise<PracticeSolutionResult> {
  const res = await fetch('/api/practice/solution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 14. Combined Triangulation
export async function analyzeProblem(params: {
  problem: string;
  logic: string;
  code: string;
  language: SupportedLanguage;
}): Promise<CombinedAnalysisResult> {
  const res = await fetch('/api/analyze-problem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  return res.json();
}

// 15. Contextual Chat
export async function chatAboutCode(params: {
  message: string;
  history: Array<{ role: 'user' | 'model'; content: string }>;
  context: {
    language?: string;
    code?: string;
    problem?: string;
    logic?: string;
  };
}): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData.error, 'AI service is temporarily unavailable. Please try again.'));
  }

  const data = await res.json();
  return data.reply;
}
