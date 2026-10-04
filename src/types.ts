export type SupportedLanguage = 'python' | 'c' | 'cpp' | 'java' | 'javascript';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type PracticeDifficulty = 'Easy' | 'Medium' | 'Hard';

export type PracticeTopic =
  | 'Arrays'
  | 'Strings'
  | 'Loops'
  | 'Functions'
  | 'Recursion'
  | 'Searching'
  | 'Sorting'
  | 'Linked List'
  | 'Stack'
  | 'Queue'
  | 'Trees'
  | 'Dynamic Programming';

// 1. Logic -> Code Result
export interface CodeGenResult {
  understanding: string;
  algorithm: string;
  pseudocode: string;
  code: string;
  example: {
    input: string;
    output: string;
    explanation: string;
  };
  timeComplexity: string;
  spaceComplexity: string;
  edgeCases: string[];
  keySteps: string[];
}

// 2. Debug My Code Result
export interface DebugProblemItem {
  issue: string;
  severity: 'critical' | 'warning' | 'note';
  category: 'Syntax' | 'Logical' | 'Runtime' | 'Condition' | 'Loop' | 'Variable' | 'Edge Case' | 'Efficiency';
  whyItHappens: string;
  howToFix: string;
}

export interface CodeDebugResult {
  status: 'Correct' | 'Needs Fix';
  summary: string;
  problemsFound: DebugProblemItem[];
  correctedCode: string;
  explanationOfChanges: string[];
  timeComplexity: string;
  spaceComplexity: string;
  edgeCasesChecked: string[];
}

// 3. Explain My Code Result
export interface StepExplanation {
  stepNumber: number;
  title: string;
  explanation: string;
}

export interface LineExplanation {
  lines: string;
  explanation: string;
  importance: 'key' | 'standard';
}

export interface VariableExplanation {
  name: string;
  type: string;
  role: string;
  purpose: string;
}

export interface FunctionExplanation {
  name: string;
  parameters: string;
  returns: string;
  purpose: string;
}

export interface DryRunTrace {
  step: number;
  currentLineOrAction: string;
  state: string;
  explanation: string;
  callStack?: string[];
}

export interface CodeExplanationResult {
  overallPurpose: string;
  stepByStep: StepExplanation[];
  lineByLine: LineExplanation[];
  variables: VariableExplanation[];
  functions: FunctionExplanation[];
  algorithm: string;
  dryRun: {
    sampleInput: string;
    traceSteps: DryRunTrace[];
    finalOutput: string;
  };
  timeComplexity: {
    bigO: string;
    explanation: string;
  };
  spaceComplexity: {
    bigO: string;
    explanation: string;
  };
}

// 4. Optimize My Code Result
export interface CodeOptimizationResult {
  currentApproach: string;
  currentComplexity: {
    time: string;
    space: string;
  };
  problems: string[];
  bottlenecks: string[];
  optimizedApproach: string;
  newComplexity: {
    time: string;
    space: string;
  };
  optimizedCode: string;
  whyThisIsBetter: string[];
}

// 5. Test My Code Result
export interface TestCaseItem {
  id: number;
  type: 'Normal' | 'Boundary' | 'Edge Case' | 'Invalid';
  input: string;
  expectedOutput: string;
  purpose: string;
}

export interface CodeTestCasesResult {
  summary: string;
  testCases: TestCaseItem[];
  note: string; // e.g. "AI-generated test cases based on static code analysis"
}

// 6. Validate My Logic Result
export interface LogicValidationResult {
  isCorrect: boolean;
  verdict: 'Correct' | 'Flawed' | 'Partially Correct';
  summary: string;
  assumptions: string[];
  problemsInReasoning: string[];
  counterexample?: {
    input: string;
    whyItFails: string;
    expectedOutcome: string;
  };
  edgeCases: string[];
  improvedLogic: string;
  expectedComplexity: {
    time: string;
    space: string;
  };
}

// 7. Logic vs Code Checker Result
export interface LogicCodeMatchResult {
  matchStatus: 'Matches' | 'Partially Matches' | 'Does Not Match';
  summary: string;
  differences: string[];
  solvesProblem: boolean;
  explanation: string;
  correctedCode?: string;
}

// 8. Convert Code Result
export interface CodeConvertResult {
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  convertedCode: string;
  keyDifferences: string[];
  languageSpecificNotes: string[];
}

// 9. Dedicated Dry Run Result
export interface DedicatedDryRunResult {
  sampleInput: string;
  finalOutput: string;
  traceSteps: DryRunTrace[];
  callStackEvolution?: Array<{
    step: number;
    stack: string[];
  }>;
  explanation: string;
}

// 10. Practice Problem & State
export interface PracticeProblem {
  id: string;
  topic: PracticeTopic;
  difficulty: PracticeDifficulty;
  title: string;
  problemStatement: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
}

export interface PracticeHintResult {
  hintLevel: number;
  totalHints: number;
  hint: string;
  guidance: string;
}

export interface PracticeLogicCheckResult {
  isViable: boolean;
  feedback: string;
  suggestions: string[];
}

export interface PracticeSolutionResult {
  code: string;
  language: SupportedLanguage;
  algorithm: string;
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
}

// Combined 3-Way Result (Preserved from original)
export interface CombinedAnalysisResult {
  solvesProblem: {
    verdict: boolean;
    explanation: string;
  };
  followsLogic: {
    verdict: boolean;
    explanation: string;
  };
  logicalMistakes: string[];
  missingEdgeCases: string[];
  efficiencyVerdict: string;
  suggestedImprovements: string[];
  overallSummary: string;
  correctedCode: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export type HistoryType =
  | 'generation'
  | 'debug'
  | 'review'
  | 'explanation'
  | 'optimization'
  | 'test'
  | 'validation'
  | 'logic-vs-code'
  | 'convert'
  | 'dry-run'
  | 'practice'
  | 'combined';

export type NavigationTab =
  | 'dashboard'
  | 'generate'
  | 'debug'
  | 'explain'
  | 'optimize'
  | 'test'
  | 'validate'
  | 'logic-vs-code'
  | 'practice'
  | 'convert'
  | 'dry-run'
  | 'combined'
  | 'history';

// Backwards compatibility alias
export type CodeReviewResult = CodeDebugResult;

export interface HistoryItem {
  id: string;
  type: HistoryType;
  title: string;
  language: SupportedLanguage;
  createdAt: number;
  problemStatement?: string;
  logic?: string;
  code?: string;
  result: any;
}

export interface PresetLogicExample {
  title: string;
  description: string;
  problem: string;
  logic: string;
  language: SupportedLanguage;
  difficulty: DifficultyLevel;
}

