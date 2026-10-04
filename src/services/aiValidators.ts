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
  PracticeDifficulty,
  PracticeTopic,
  DifficultyLevel,
  TestCaseItem,
  DebugProblemItem,
} from '../types';

// Strict runtime boolean validation (Section 1: never allow "false" to become true or "maybe" to blindly fail)
export function parseStrictBoolean(val: any): boolean | null {
  if (typeof val === 'boolean') {
    return val;
  }
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (s === 'true' || s === 'yes' || s === '1' || s === 'correct' || s === 'valid') return true;
    if (s === 'false' || s === 'no' || s === '0' || s === 'incorrect' || s === 'invalid') return false;
  }
  return null;
}

export function strictBoolean(val: any, fallback = false): boolean {
  const parsed = parseStrictBoolean(val);
  return parsed !== null ? parsed : fallback;
}

// Runtime enum validators (Section 2: never rely only on TypeScript casts)
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  'python',
  'c',
  'cpp',
  'java',
  'javascript',
] as const;

export function validateSupportedLanguage(
  val: any,
  fallback: SupportedLanguage = 'python'
): SupportedLanguage {
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    if (normalized === 'js') return 'javascript';
    if (normalized === 'c++') return 'cpp';
    if (normalized === 'py') return 'python';
    if ((SUPPORTED_LANGUAGES as readonly string[]).includes(normalized)) {
      return normalized as SupportedLanguage;
    }
  }
  return fallback;
}

export const PRACTICE_DIFFICULTIES: readonly PracticeDifficulty[] = [
  'Easy',
  'Medium',
  'Hard',
] as const;

export function validatePracticeDifficulty(
  val: any,
  fallback: PracticeDifficulty = 'Easy'
): PracticeDifficulty {
  if (typeof val === 'string') {
    const match = PRACTICE_DIFFICULTIES.find(
      (d) => d.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) return match;
  }
  return fallback;
}

export const PRACTICE_TOPICS: readonly PracticeTopic[] = [
  'Arrays',
  'Strings',
  'Loops',
  'Functions',
  'Recursion',
  'Searching',
  'Sorting',
  'Linked List',
  'Stack',
  'Queue',
  'Trees',
  'Dynamic Programming',
] as const;

export function validatePracticeTopic(
  val: any,
  fallback: PracticeTopic = 'Arrays'
): PracticeTopic {
  if (typeof val === 'string') {
    const match = PRACTICE_TOPICS.find(
      (t) => t.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) return match;
  }
  return fallback;
}

export const DIFFICULTY_LEVELS: readonly DifficultyLevel[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
] as const;

export function validateDifficultyLevel(
  val: any,
  fallback: DifficultyLevel = 'Beginner'
): DifficultyLevel {
  if (typeof val === 'string') {
    const match = DIFFICULTY_LEVELS.find(
      (d) => d.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) return match;
  }
  return fallback;
}

export const TEST_CASE_TYPES: readonly TestCaseItem['type'][] = [
  'Normal',
  'Boundary',
  'Edge Case',
  'Invalid',
] as const;

export function validateTestCaseType(
  val: any,
  fallback: TestCaseItem['type'] = 'Normal'
): TestCaseItem['type'] {
  if (typeof val === 'string') {
    const match = TEST_CASE_TYPES.find(
      (t) => t.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) return match;
  }
  return fallback;
}

export const DEBUG_SEVERITIES: readonly DebugProblemItem['severity'][] = [
  'critical',
  'warning',
  'note',
] as const;

export function validateDebugSeverity(
  val: any,
  fallback: DebugProblemItem['severity'] = 'warning'
): DebugProblemItem['severity'] {
  if (typeof val === 'string') {
    const lower = val.trim().toLowerCase();
    if (lower === 'high' || lower === 'error') return 'critical';
    if (lower === 'medium' || lower === 'warn') return 'warning';
    if (lower === 'low' || lower === 'info') return 'note';
    if ((DEBUG_SEVERITIES as readonly string[]).includes(lower)) {
      return lower as DebugProblemItem['severity'];
    }
  }
  return fallback;
}

export const DEBUG_CATEGORIES: readonly DebugProblemItem['category'][] = [
  'Syntax',
  'Logical',
  'Runtime',
  'Condition',
  'Loop',
  'Variable',
  'Edge Case',
  'Efficiency',
] as const;

export function validateDebugCategory(
  val: any,
  fallback: DebugProblemItem['category'] = 'Logical'
): DebugProblemItem['category'] {
  if (typeof val === 'string') {
    const match = DEBUG_CATEGORIES.find(
      (c) => c.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) return match;
  }
  return fallback;
}

export const LOGIC_VERDICTS: readonly ('Correct' | 'Partially Correct' | 'Flawed')[] = [
  'Correct',
  'Partially Correct',
  'Flawed',
] as const;

export function validateLogicVerdict(
  val: any,
  fallback: 'Correct' | 'Partially Correct' | 'Flawed' = 'Partially Correct'
): 'Correct' | 'Partially Correct' | 'Flawed' {
  if (typeof val === 'string') {
    const match = LOGIC_VERDICTS.find(
      (v) => v.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) return match;
  }
  return fallback;
}

export const MATCH_STATUSES = [
  'Matches',
  'Partially Matches',
  'Does Not Match',
] as const;

export type MatchStatus = (typeof MATCH_STATUSES)[number];

export function validateMatchStatus(
  val: any,
  fallback: MatchStatus = 'Partially Matches'
): MatchStatus {
  if (typeof val === 'string') {
    const match = MATCH_STATUSES.find(
      (m) => m.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) return match;
  }
  return fallback;
}

// Realistic, feature-specific input thresholds for student/developer workflow
export const LIMITS = {
  problemStatement: 5000,
  logicDescription: 10000,
  sourceCode: 30000,
  chatMessage: 2000,
  genericInput: 15000,
};

export function checkInputLimits(
  text?: string,
  fieldName = 'Input',
  maxChars = LIMITS.genericInput
): void {
  if (text && text.length > maxChars) {
    throw new Error(
      `Your input for ${fieldName} is too large (${text.length.toLocaleString()} characters, maximum is ${maxChars.toLocaleString()}). Please shorten it and try again.`
    );
  }
}

export function validateCodeGenResult(data: any): CodeGenResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  const code = typeof data.code === 'string' && data.code.trim() ? data.code : '';
  if (!code) {
    throw new Error('Model did not return source code in response');
  }

  return {
    understanding:
      typeof data.understanding === 'string' && data.understanding.trim()
        ? data.understanding
        : 'Algorithmic code synthesis',
    algorithm:
      typeof data.algorithm === 'string' && data.algorithm.trim()
        ? data.algorithm
        : 'Standard Algorithm',
    pseudocode: typeof data.pseudocode === 'string' ? data.pseudocode : '',
    code,
    example: {
      input:
        data.example && typeof data.example.input === 'string'
          ? data.example.input
          : 'Sample input',
      output:
        data.example && typeof data.example.output === 'string'
          ? data.example.output
          : 'Sample output',
      explanation:
        data.example && typeof data.example.explanation === 'string'
          ? data.example.explanation
          : 'Execution demonstration',
    },
    timeComplexity:
      typeof data.timeComplexity === 'string' && data.timeComplexity.trim()
        ? data.timeComplexity
        : 'Not determined',
    spaceComplexity:
      typeof data.spaceComplexity === 'string' && data.spaceComplexity.trim()
        ? data.spaceComplexity
        : 'Not determined',
    edgeCases: Array.isArray(data.edgeCases)
      ? data.edgeCases.filter((e: any) => typeof e === 'string' && e.trim())
      : [],
    keySteps: Array.isArray(data.keySteps)
      ? data.keySteps.filter((s: any) => typeof s === 'string' && s.trim())
      : [],
  };
}

export function validateCodeDebugResult(data: any): CodeDebugResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  const rawProblems = Array.isArray(data.problemsFound) ? data.problemsFound : [];
  const validCategories = [
    'Syntax',
    'Logical',
    'Runtime',
    'Condition',
    'Loop',
    'Variable',
    'Edge Case',
    'Efficiency',
  ];
  const validSeverities = ['critical', 'warning', 'note'];

  const problemsFound = rawProblems.map((p: any) => ({
    issue: typeof p.issue === 'string' && p.issue.trim() ? p.issue : 'Detected issue',
    severity: validateDebugSeverity(p.severity, 'warning'),
    category: validateDebugCategory(p.category, 'Logical'),
    whyItHappens:
      typeof p.whyItHappens === 'string' && p.whyItHappens.trim()
        ? p.whyItHappens
        : typeof p.whyItIsAProblem === 'string'
        ? p.whyItIsAProblem
        : 'Potential logic error or execution flaw',
    howToFix:
      typeof p.howToFix === 'string' && p.howToFix.trim()
        ? p.howToFix
        : typeof p.suggestedFix === 'string'
        ? p.suggestedFix
        : 'Review corrected code below',
  }));

  // Consistent status: if critical/warning problems exist, status cannot be falsely marked 'Correct'
  const hasCriticalOrWarning = problemsFound.some(
    (p: any) => p.severity === 'critical' || p.severity === 'warning'
  );
  let status: 'Correct' | 'Needs Fix' = 'Correct';
  if (data.status === 'Needs Fix' || problemsFound.length > 0 || hasCriticalOrWarning) {
    status = 'Needs Fix';
  }

  const correctedCode =
    typeof data.correctedCode === 'string'
      ? data.correctedCode
      : typeof data.improvedCode === 'string'
      ? data.improvedCode
      : '';

  const rawExplanations = Array.isArray(data.explanationOfChanges)
    ? data.explanationOfChanges
    : Array.isArray(data.potentialImprovements)
    ? data.potentialImprovements
    : [];

  const rawEdges = Array.isArray(data.edgeCasesChecked)
    ? data.edgeCasesChecked
    : Array.isArray(data.edgeCases)
    ? data.edgeCases
    : [];

  return {
    status,
    summary:
      typeof data.summary === 'string' && data.summary.trim()
        ? data.summary
        : status === 'Correct'
        ? 'No syntax, logical, or runtime issues found in the code.'
        : 'Code debugging analysis completed. Review identified problems and fixes below.',
    problemsFound,
    correctedCode,
    explanationOfChanges: rawExplanations.filter(
      (c: any) => typeof c === 'string' && c.trim()
    ),
    timeComplexity:
      typeof data.timeComplexity === 'string' && data.timeComplexity.trim()
        ? data.timeComplexity
        : 'Not determined',
    spaceComplexity:
      typeof data.spaceComplexity === 'string' && data.spaceComplexity.trim()
        ? data.spaceComplexity
        : 'Not determined',
    edgeCasesChecked: rawEdges.filter((e: any) => typeof e === 'string' && e.trim()),
  };
}

export function validateCodeExplanationResult(data: any): CodeExplanationResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  const rawSteps = Array.isArray(data.stepByStep) ? data.stepByStep : [];
  const rawLines = Array.isArray(data.lineByLine) ? data.lineByLine : [];
  const rawVars = Array.isArray(data.variables) ? data.variables : [];
  const rawFuncs = Array.isArray(data.functions) ? data.functions : [];

  return {
    overallPurpose:
      typeof data.overallPurpose === 'string' && data.overallPurpose.trim()
        ? data.overallPurpose
        : 'Explains code purpose and execution steps.',
    stepByStep: rawSteps.map((s: any, idx: number) => ({
      stepNumber: Number(s.stepNumber) || idx + 1,
      title: typeof s.title === 'string' && s.title.trim() ? s.title : `Step ${idx + 1}`,
      explanation: typeof s.explanation === 'string' ? s.explanation : '',
    })),
    lineByLine: rawLines.map((l: any) => ({
      lines: typeof l.lines === 'string' ? l.lines : '',
      explanation: typeof l.explanation === 'string' ? l.explanation : '',
      importance: l.importance === 'key' ? 'key' : 'standard',
    })),
    variables: rawVars.map((v: any) => ({
      name: typeof v.name === 'string' ? v.name : 'variable',
      type: typeof v.type === 'string' ? v.type : 'any',
      role: typeof v.role === 'string' ? v.role : '',
      purpose: typeof v.purpose === 'string' ? v.purpose : '',
    })),
    functions: rawFuncs.map((f: any) => ({
      name: typeof f.name === 'string' ? f.name : 'function',
      parameters: typeof f.parameters === 'string' ? f.parameters : '',
      returns: typeof f.returns === 'string' ? f.returns : '',
      purpose: typeof f.purpose === 'string' ? f.purpose : '',
    })),
    algorithm:
      typeof data.algorithm === 'string' && data.algorithm.trim()
        ? data.algorithm
        : 'Algorithm breakdown',
    dryRun: {
      sampleInput:
        data.dryRun && typeof data.dryRun.sampleInput === 'string'
          ? data.dryRun.sampleInput
          : 'sample input',
      traceSteps:
        data.dryRun && Array.isArray(data.dryRun.traceSteps)
          ? data.dryRun.traceSteps.map((t: any, idx: number) => ({
              step: Number(t.step) || idx + 1,
              currentLineOrAction:
                typeof t.currentLineOrAction === 'string'
                  ? t.currentLineOrAction
                  : `Action ${idx + 1}`,
              state: typeof t.state === 'string' ? t.state : '',
              explanation: typeof t.explanation === 'string' ? t.explanation : '',
              callStack: Array.isArray(t.callStack)
                ? t.callStack.filter((c: any) => typeof c === 'string')
                : undefined,
            }))
          : [],
      finalOutput:
        data.dryRun && typeof data.dryRun.finalOutput === 'string'
          ? data.dryRun.finalOutput
          : 'Execution trace finished',
    },
    timeComplexity: {
      bigO:
        data.timeComplexity && typeof data.timeComplexity.bigO === 'string'
          ? data.timeComplexity.bigO
          : 'Not determined',
      explanation:
        data.timeComplexity && typeof data.timeComplexity.explanation === 'string'
          ? data.timeComplexity.explanation
          : '',
    },
    spaceComplexity: {
      bigO:
        data.spaceComplexity && typeof data.spaceComplexity.bigO === 'string'
          ? data.spaceComplexity.bigO
          : 'Not determined',
      explanation:
        data.spaceComplexity && typeof data.spaceComplexity.explanation === 'string'
          ? data.spaceComplexity.explanation
          : '',
    },
  };
}

export function validateCodeOptimizationResult(data: any): CodeOptimizationResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  return {
    currentApproach:
      typeof data.currentApproach === 'string' && data.currentApproach.trim()
        ? data.currentApproach
        : 'Current algorithmic approach',
    currentComplexity: {
      time:
        data.currentComplexity && typeof data.currentComplexity.time === 'string'
          ? data.currentComplexity.time
          : 'Not determined',
      space:
        data.currentComplexity && typeof data.currentComplexity.space === 'string'
          ? data.currentComplexity.space
          : 'Not determined',
    },
    problems: Array.isArray(data.problems)
      ? data.problems.filter((p: any) => typeof p === 'string' && p.trim())
      : [],
    bottlenecks: Array.isArray(data.bottlenecks)
      ? data.bottlenecks.filter((b: any) => typeof b === 'string' && b.trim())
      : [],
    optimizedApproach:
      typeof data.optimizedApproach === 'string' && data.optimizedApproach.trim()
        ? data.optimizedApproach
        : 'Optimized algorithmic approach',
    newComplexity: {
      time:
        data.newComplexity && typeof data.newComplexity.time === 'string'
          ? data.newComplexity.time
          : 'Not determined',
      space:
        data.newComplexity && typeof data.newComplexity.space === 'string'
          ? data.newComplexity.space
          : 'Not determined',
    },
    optimizedCode:
      typeof data.optimizedCode === 'string' && data.optimizedCode.trim()
        ? data.optimizedCode
        : '',
    whyThisIsBetter: Array.isArray(data.whyThisIsBetter)
      ? data.whyThisIsBetter.filter((w: any) => typeof w === 'string' && w.trim())
      : [],
  };
}

export function validateCodeTestCasesResult(data: any): CodeTestCasesResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  const validTypes = ['Normal', 'Boundary', 'Edge Case', 'Invalid'];
  const rawCases = Array.isArray(data.testCases) ? data.testCases : [];

  const testCases = rawCases.map((tc: any, idx: number) => ({
    id: Number(tc.id) || idx + 1,
    type: validateTestCaseType(tc.type, 'Normal'),
    input: typeof tc.input === 'string' ? tc.input : String(tc.input ?? ''),
    expectedOutput:
      typeof tc.expectedOutput === 'string'
        ? tc.expectedOutput
        : String(tc.expectedOutput ?? ''),
    purpose:
      typeof tc.purpose === 'string' && tc.purpose.trim()
        ? tc.purpose
        : 'Verify behavior',
  }));

  return {
    summary:
      typeof data.summary === 'string' && data.summary.trim()
        ? data.summary
        : 'Static analysis test cases generated across standard and boundary conditions.',
    testCases,
    note: 'These test cases are generated using AI-based static analysis. The code has not been executed.',
  };
}

export function validateLogicValidationResult(data: any): LogicValidationResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  // Handle boolean/verdict alignment safely without treating invalid values as automatically false
  const parsedIsCorrect = parseStrictBoolean(data.isCorrect);
  const defaultVerdict =
    parsedIsCorrect === true
      ? 'Correct'
      : parsedIsCorrect === false
      ? 'Flawed'
      : 'Partially Correct';

  const verdict = validateLogicVerdict(data.verdict, defaultVerdict);
  const isCorrect = verdict === 'Correct';

  return {
    isCorrect,
    verdict,
    summary:
      typeof data.summary === 'string' && data.summary.trim()
        ? data.summary
        : verdict === 'Correct'
        ? 'Algorithm logic is sound and correctly addresses the problem.'
        : 'Logic analysis identified reasoning flaws or missing boundary invariants.',
    assumptions: Array.isArray(data.assumptions)
      ? data.assumptions.filter((a: any) => typeof a === 'string' && a.trim())
      : [],
    problemsInReasoning: Array.isArray(data.problemsInReasoning)
      ? data.problemsInReasoning.filter((p: any) => typeof p === 'string' && p.trim())
      : [],
    counterexample:
      data.counterexample && typeof data.counterexample === 'object'
        ? {
            input:
              typeof data.counterexample.input === 'string'
                ? data.counterexample.input
                : 'Sample input',
            whyItFails:
              typeof data.counterexample.whyItFails === 'string'
                ? data.counterexample.whyItFails
                : 'Breaks problem invariants',
            expectedOutcome:
              typeof data.counterexample.expectedOutcome === 'string'
                ? data.counterexample.expectedOutcome
                : 'Expected result',
          }
        : undefined,
    edgeCases: Array.isArray(data.edgeCases)
      ? data.edgeCases.filter((e: any) => typeof e === 'string' && e.trim())
      : [],
    improvedLogic: typeof data.improvedLogic === 'string' ? data.improvedLogic : '',
    expectedComplexity: {
      time:
        data.expectedComplexity && typeof data.expectedComplexity.time === 'string'
          ? data.expectedComplexity.time
          : 'Not determined',
      space:
        data.expectedComplexity && typeof data.expectedComplexity.space === 'string'
          ? data.expectedComplexity.space
          : 'Not determined',
    },
  };
}

export function validateLogicCodeMatchResult(data: any): LogicCodeMatchResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  const matchStatus = validateMatchStatus(data.matchStatus, 'Partially Matches');
  const parsedSolves = parseStrictBoolean(data.solvesProblem);
  const solvesProblem = parsedSolves !== null ? parsedSolves : matchStatus === 'Matches';

  return {
    matchStatus,
    summary:
      typeof data.summary === 'string' && data.summary.trim()
        ? data.summary
        : 'Logic vs Code alignment comparison completed.',
    differences: Array.isArray(data.differences)
      ? data.differences.filter((d: any) => typeof d === 'string' && d.trim())
      : [],
    solvesProblem,
    explanation: typeof data.explanation === 'string' ? data.explanation : '',
    correctedCode:
      typeof data.correctedCode === 'string' && data.correctedCode.trim()
        ? data.correctedCode
        : undefined,
  };
}

export function validateCodeConvertResult(
  data: any,
  source: SupportedLanguage,
  target: SupportedLanguage
): CodeConvertResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  return {
    sourceLanguage: validateSupportedLanguage(data.sourceLanguage, source),
    targetLanguage: validateSupportedLanguage(data.targetLanguage, target),
    convertedCode:
      typeof data.convertedCode === 'string' && data.convertedCode.trim()
        ? data.convertedCode
        : '',
    keyDifferences: Array.isArray(data.keyDifferences)
      ? data.keyDifferences.filter((k: any) => typeof k === 'string' && k.trim())
      : [],
    languageSpecificNotes: Array.isArray(data.languageSpecificNotes)
      ? data.languageSpecificNotes.filter((n: any) => typeof n === 'string' && n.trim())
      : [],
  };
}

export function validateDedicatedDryRunResult(
  data: any,
  input: string
): DedicatedDryRunResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  const rawSteps = Array.isArray(data.traceSteps) ? data.traceSteps : [];
  const traceSteps = rawSteps.map((s: any, idx: number) => ({
    step: Number(s.step) || idx + 1,
    currentLineOrAction:
      typeof s.currentLineOrAction === 'string' && s.currentLineOrAction.trim()
        ? s.currentLineOrAction
        : `Step ${idx + 1}`,
    state: typeof s.state === 'string' ? s.state : '',
    explanation: typeof s.explanation === 'string' ? s.explanation : '',
    callStack: Array.isArray(s.callStack)
      ? s.callStack.filter((c: any) => typeof c === 'string')
      : undefined,
  }));

  return {
    sampleInput:
      typeof data.sampleInput === 'string' && data.sampleInput.trim()
        ? data.sampleInput
        : input,
    finalOutput:
      typeof data.finalOutput === 'string' ? data.finalOutput : 'Not determined',
    traceSteps,
    explanation:
      typeof data.explanation === 'string' && data.explanation.trim()
        ? data.explanation
        : 'AI-generated execution walkthrough completed.',
  };
}

export function validatePracticeProblem(
  data: any,
  topic: PracticeTopic,
  diff: PracticeDifficulty
): PracticeProblem {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  const rawExamples = Array.isArray(data.examples) ? data.examples : [];
  const examples = rawExamples.map((ex: any) => ({
    input: typeof ex.input === 'string' ? ex.input : String(ex.input ?? ''),
    output: typeof ex.output === 'string' ? ex.output : String(ex.output ?? ''),
    explanation: typeof ex.explanation === 'string' ? ex.explanation : undefined,
  }));

  return {
    id: typeof data.id === 'string' ? data.id : `prob_${Date.now()}`,
    topic: validatePracticeTopic(data.topic, topic),
    difficulty: validatePracticeDifficulty(data.difficulty, diff),
    title:
      typeof data.title === 'string' && data.title.trim()
        ? data.title
        : 'Practice Problem',
    problemStatement:
      typeof data.problemStatement === 'string' && data.problemStatement.trim()
        ? data.problemStatement
        : 'Formulate an algorithmic approach for this problem.',
    constraints: Array.isArray(data.constraints)
      ? data.constraints.filter((c: any) => typeof c === 'string' && c.trim())
      : [],
    examples,
  };
}

export function validatePracticeHint(
  data: any,
  requestedLevel: number
): PracticeHintResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  return {
    hintLevel: Number(data.hintLevel) || requestedLevel,
    totalHints: Number(data.totalHints) || 3,
    hint:
      typeof data.hint === 'string' && data.hint.trim()
        ? data.hint
        : 'Focus on identifying which elements need tracking.',
    guidance:
      typeof data.guidance === 'string' && data.guidance.trim()
        ? data.guidance
        : 'Consider what invariant is preserved at each step.',
  };
}

export function validatePracticeLogicCheck(data: any): PracticeLogicCheckResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  const parsedViable = parseStrictBoolean(data.isViable);
  const isViable =
    parsedViable !== null
      ? parsedViable
      : typeof data.feedback === 'string' &&
        !/\b(not viable|flaw|incorrect|fails|cannot work|wrong)\b/i.test(data.feedback);

  return {
    isViable,
    feedback:
      typeof data.feedback === 'string' && data.feedback.trim()
        ? data.feedback
        : 'Evaluated proposed logic.',
    suggestions: Array.isArray(data.suggestions)
      ? data.suggestions.filter((s: any) => typeof s === 'string' && s.trim())
      : [],
  };
}

export function validatePracticeSolution(
  data: any,
  language: SupportedLanguage
): PracticeSolutionResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  return {
    code: typeof data.code === 'string' && data.code.trim() ? data.code : '',
    language: validateSupportedLanguage(data.language, language),
    algorithm:
      typeof data.algorithm === 'string' && data.algorithm.trim()
        ? data.algorithm
        : 'Optimal Solution',
    explanation: typeof data.explanation === 'string' ? data.explanation : '',
    timeComplexity:
      typeof data.timeComplexity === 'string' && data.timeComplexity.trim()
        ? data.timeComplexity
        : 'Not determined',
    spaceComplexity:
      typeof data.spaceComplexity === 'string' && data.spaceComplexity.trim()
        ? data.spaceComplexity
        : 'Not determined',
  };
}

export function validateCombinedAnalysis(data: any): CombinedAnalysisResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  const parsedSolves = parseStrictBoolean(data.solvesProblem?.verdict);
  const solvesVerdict =
    parsedSolves !== null
      ? parsedSolves
      : typeof data.solvesProblem?.explanation === 'string' &&
        !/\b(does not solve|incorrect|fails|wrong|fails to solve)\b/i.test(
          data.solvesProblem.explanation
        ) &&
        /\b(solves|correct|yes|meets requirements|satisfies)\b/i.test(
          data.solvesProblem.explanation
        );

  const parsedFollows = parseStrictBoolean(data.followsLogic?.verdict);
  const followsVerdict =
    parsedFollows !== null
      ? parsedFollows
      : typeof data.followsLogic?.explanation === 'string' &&
        !/\b(does not follow|deviates|flawed|inconsistent|diverges)\b/i.test(
          data.followsLogic.explanation
        ) &&
        /\b(follows|matches|aligns|consistent|adheres)\b/i.test(
          data.followsLogic.explanation
        );

  return {
    solvesProblem: {
      verdict: solvesVerdict,
      explanation:
        typeof data.solvesProblem?.explanation === 'string'
          ? data.solvesProblem.explanation
          : '',
    },
    followsLogic: {
      verdict: followsVerdict,
      explanation:
        typeof data.followsLogic?.explanation === 'string'
          ? data.followsLogic.explanation
          : '',
    },
    logicalMistakes: Array.isArray(data.logicalMistakes)
      ? data.logicalMistakes.filter((m: any) => typeof m === 'string' && m.trim())
      : [],
    missingEdgeCases: Array.isArray(data.missingEdgeCases)
      ? data.missingEdgeCases.filter((e: any) => typeof e === 'string' && e.trim())
      : [],
    efficiencyVerdict:
      typeof data.efficiencyVerdict === 'string' && data.efficiencyVerdict.trim()
        ? data.efficiencyVerdict
        : 'Satisfactory complexity',
    suggestedImprovements: Array.isArray(data.suggestedImprovements)
      ? data.suggestedImprovements.filter((i: any) => typeof i === 'string' && i.trim())
      : [],
    overallSummary:
      typeof data.overallSummary === 'string' && data.overallSummary.trim()
        ? data.overallSummary
        : 'Triangulation between Problem, Logic, and Code completed.',
    correctedCode: typeof data.correctedCode === 'string' ? data.correctedCode : '',
  };
}
