import React, { useState, useEffect } from 'react';
import {
  Target,
  Sparkles,
  RotateCw,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Code2,
  Eye,
  ArrowRight,
  BookOpen,
  HelpCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  PracticeTopic,
  PracticeDifficulty,
  PracticeProblem,
  PracticeHintResult,
  PracticeLogicCheckResult,
  PracticeSolutionResult,
  SupportedLanguage,
} from '../types';
import {
  generatePracticeProblem,
  getPracticeHint,
  checkPracticeLogic,
  getPracticeSolution,
} from '../services/api';
import { saveHistoryItem } from '../services/storage';
import {
  validateSupportedLanguage,
  validatePracticeDifficulty,
  validatePracticeTopic,
} from '../services/aiValidators';
import { CodeViewer } from '../components/CodeViewer';

export interface PracticeStatePayload {
  topic?: PracticeTopic;
  difficulty?: PracticeDifficulty;
  language?: SupportedLanguage;
  problem?: PracticeProblem | null;
  userLogic?: string;
  hintResult?: PracticeHintResult | null;
  currentHintLevel?: number;
  logicCheckResult?: PracticeLogicCheckResult | null;
  solutionResult?: PracticeSolutionResult | null;
}

interface PracticePageProps {
  initialState?: PracticeStatePayload | null;
  onSendToGenerator: (problem: string, logic: string) => void;
  onSendToExplainer: (code: string, language: SupportedLanguage) => void;
  onUpdateActiveContext: (ctx: {
    language?: SupportedLanguage;
    code?: string;
    problem?: string;
    logic?: string;
  }) => void;
}

const TOPICS: PracticeTopic[] = [
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
];

const DIFFICULTIES: PracticeDifficulty[] = ['Easy', 'Medium', 'Hard'];

export const PracticePage: React.FC<PracticePageProps> = ({
  initialState,
  onSendToGenerator,
  onSendToExplainer,
  onUpdateActiveContext,
}) => {
  const [topic, setTopic] = useState<PracticeTopic>(
    validatePracticeTopic(initialState?.topic, 'Arrays')
  );
  const [difficulty, setDifficulty] = useState<PracticeDifficulty>(
    validatePracticeDifficulty(initialState?.difficulty, 'Easy')
  );
  const [language, setLanguage] = useState<SupportedLanguage>(
    validateSupportedLanguage(initialState?.language, 'python')
  );

  const [problem, setProblem] = useState<PracticeProblem | null>(initialState?.problem || null);
  const [userLogic, setUserLogic] = useState(initialState?.userLogic || '');

  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [isLoadingCheck, setIsLoadingCheck] = useState(false);
  const [isLoadingSolution, setIsLoadingSolution] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [hintResult, setHintResult] = useState<PracticeHintResult | null>(initialState?.hintResult || null);
  const [currentHintLevel, setCurrentHintLevel] = useState(initialState?.currentHintLevel || 1);
  const [logicCheckResult, setLogicCheckResult] = useState<PracticeLogicCheckResult | null>(initialState?.logicCheckResult || null);
  const [solutionResult, setSolutionResult] = useState<PracticeSolutionResult | null>(initialState?.solutionResult || null);

  useEffect(() => {
    if (initialState) {
      if (initialState.topic) setTopic(validatePracticeTopic(initialState.topic, 'Arrays'));
      if (initialState.difficulty) setDifficulty(validatePracticeDifficulty(initialState.difficulty, 'Easy'));
      if (initialState.language) setLanguage(validateSupportedLanguage(initialState.language, 'python'));
      if (initialState.problem !== undefined) setProblem(initialState.problem);
      if (initialState.userLogic !== undefined) setUserLogic(initialState.userLogic);
      if (initialState.hintResult !== undefined) setHintResult(initialState.hintResult);
      if (initialState.currentHintLevel !== undefined) setCurrentHintLevel(initialState.currentHintLevel);
      if (initialState.logicCheckResult !== undefined) setLogicCheckResult(initialState.logicCheckResult);
      if (initialState.solutionResult !== undefined) setSolutionResult(initialState.solutionResult);
      setError(null);
    } else if (initialState === null) {
      setProblem(null);
      setUserLogic('');
      setHintResult(null);
      setCurrentHintLevel(1);
      setLogicCheckResult(null);
      setSolutionResult(null);
      setError(null);
    }
  }, [initialState]);

  const handleGenerateProblem = async () => {
    setIsLoadingProblem(true);
    setError(null);
    setHintResult(null);
    setCurrentHintLevel(1);
    setLogicCheckResult(null);
    setSolutionResult(null);
    setUserLogic('');

    try {
      const data = await generatePracticeProblem({
        topic,
        difficulty,
      });
      setProblem(data);
      onUpdateActiveContext({
        problem: `${data.title}: ${data.problemStatement}`,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate practice challenge.');
    } finally {
      setIsLoadingProblem(false);
    }
  };

  const handleGetHint = async () => {
    if (!problem) return;
    setIsLoadingHint(true);
    setError(null);

    try {
      const data = await getPracticeHint({
        problem: `${problem.title}\n${problem.problemStatement}`,
        userLogic,
        hintLevel: currentHintLevel,
      });
      setHintResult(data);
      // Advance to next hint level if not at max
      if (currentHintLevel < 3) {
        setCurrentHintLevel((prev) => prev + 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve hint.');
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleCheckLogic = async () => {
    if (!problem || !userLogic.trim()) {
      setError('Please write your logic attempt in the box below before checking.');
      return;
    }
    setIsLoadingCheck(true);
    setError(null);

    try {
      const data = await checkPracticeLogic({
        problem: `${problem.title}\n${problem.problemStatement}`,
        userLogic,
      });
      setLogicCheckResult(data);

      saveHistoryItem({
        type: 'practice',
        title: `Practice: ${problem.title}`,
        language,
        problemStatement: `${problem.title}\n${problem.problemStatement}`,
        logic: userLogic,
        code: solutionResult?.code || '',
        result: {
          topic,
          difficulty,
          language,
          problem,
          userLogic,
          hintResult,
          currentHintLevel,
          logicCheckResult: data,
          solutionResult,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate logic.');
    } finally {
      setIsLoadingCheck(false);
    }
  };

  const handleShowSolution = async () => {
    if (!problem) return;
    setIsLoadingSolution(true);
    setError(null);

    try {
      const data = await getPracticeSolution({
        problem: `${problem.title}\n${problem.problemStatement}`,
        language,
      });
      setSolutionResult(data);
      onUpdateActiveContext({
        language,
        code: data.code,
        problem: problem.title,
      });

      saveHistoryItem({
        type: 'practice',
        title: `Practice: ${problem.title} (Solution)`,
        language,
        problemStatement: `${problem.title}\n${problem.problemStatement}`,
        logic: userLogic,
        code: data.code,
        result: {
          topic,
          difficulty,
          language,
          problem,
          userLogic,
          hintResult,
          currentHintLevel,
          logicCheckResult,
          solutionResult: data,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve solution.');
    } finally {
      setIsLoadingSolution(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-500" />
            <span>Practice Mode</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Master algorithmic thinking by tackling challenges topic by topic. Formulate your logic first before viewing hints or code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 font-mono"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 flex items-start gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">Practice Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Challenge Picker Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Select Topic:
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as PracticeTopic)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-medium focus:outline-none"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Difficulty:
            </label>
            <div className="flex items-center gap-1">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-mono font-medium transition-colors ${
                    difficulty === d
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerateProblem}
          disabled={isLoadingProblem}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          {isLoadingProblem ? (
            <RotateCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{problem ? 'Next Challenge' : 'Generate Challenge'}</span>
        </button>
      </div>

      {/* Main Practice Workspace */}
      {problem ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Problem Statement & Hints */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold uppercase">
                      {problem.topic}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase">
                      {problem.difficulty}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">
                    {problem.title}
                  </h2>
                </div>
              </div>

              {/* Problem Description */}
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {problem.problemStatement}
              </div>

              {/* Constraints */}
              {problem.constraints && problem.constraints.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Constraints:
                  </span>
                  <ul className="space-y-0.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examples */}
              {problem.examples && problem.examples.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Examples:
                  </span>
                  {problem.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1"
                    >
                      <div>
                        <span className="text-slate-400 text-[10px] block">Input:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-emerald-500 text-[10px] block">Output:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <p className="text-[11px] text-slate-500 font-sans pt-1">
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progressive Hint Card */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Progressive Hint (Level {currentHintLevel} of 3)</span>
                </span>

                <button
                  onClick={handleGetHint}
                  disabled={isLoadingHint}
                  className="px-2.5 py-1 text-xs rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {isLoadingHint ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{hintResult ? 'Next Hint Level' : 'Get Hint'}</span>
                  )}
                </button>
              </div>

              {hintResult ? (
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 text-xs sm:text-sm space-y-1.5">
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {hintResult.hint}
                  </p>
                  {hintResult.guidance && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-sans">
                      💡 {hintResult.guidance}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Stuck? Click "Get Hint" for an incremental conceptual clue without spoiling the whole solution.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: User Logic Formulation & Solution */}
          <div className="lg:col-span-6 space-y-4">
            {/* Step 1: User Formulates Logic */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-500" />
                  <span>Step 1: Your Logic & Algorithm Attempt</span>
                </h3>
                <span className="text-[11px] text-slate-500">Think before you code</span>
              </div>

              <textarea
                value={userLogic}
                onChange={(e) => setUserLogic(e.target.value)}
                rows={6}
                placeholder="Write your algorithmic approach here in plain English or pseudocode...&#10;&#10;e.g. Initialize a pointer at 0 and length-1, then compare..."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed transition-colors"
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={handleCheckLogic}
                  disabled={isLoadingCheck || !userLogic.trim()}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoadingCheck ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Check Logic</span>
                </button>

                <button
                  onClick={() => {
                    const fullProblem = problem.problemStatement
                      ? `${problem.title}\n\n${problem.problemStatement}`
                      : problem.title;
                    onSendToGenerator(fullProblem, userLogic);
                  }}
                  disabled={!userLogic.trim()}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-40"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Generate Code</span>
                </button>

                <button
                  onClick={handleShowSolution}
                  disabled={isLoadingSolution}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
                >
                  {isLoadingSolution ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span>Show Solution</span>
                </button>
              </div>

              {/* Logic Check Feedback Result */}
              {logicCheckResult && (
                <div className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2 ${
                  logicCheckResult.isViable
                    ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                    : 'border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {logicCheckResult.isViable ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Logic Looks Viable!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span>Logic Needs Refinement</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed">{logicCheckResult.feedback}</p>
                  {logicCheckResult.suggestions && logicCheckResult.suggestions.length > 0 && (
                    <ul className="space-y-1 pt-1 text-xs">
                      {logicCheckResult.suggestions.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-slate-400">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Official Solution Card */}
            {solutionResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span>Official Solution ({solutionResult.algorithm})</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      {solutionResult.timeComplexity} · {solutionResult.spaceComplexity}
                    </span>
                  </div>
                  <button
                    onClick={() => onSendToExplainer(solutionResult.code, language)}
                    className="text-xs text-blue-500 hover:underline font-medium"
                  >
                    Explain in Depth
                  </button>
                </div>

                <CodeViewer
                  code={solutionResult.code}
                  language={language}
                  title={`practice_solution_${language}`}
                  onExplain={() => onSendToExplainer(solutionResult.code, language)}
                  maxHeight="360px"
                />

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-xs">
                  <span className="font-semibold block text-slate-500 mb-1">
                    Algorithm Walkthrough:
                  </span>
                  {solutionResult.explanation}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-500">
          <Target className="w-10 h-10 text-emerald-500/60 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Pick a topic and difficulty to start
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Test your algorithmic chops on Arrays, Strings, Recursion, Trees, or DP. Formulate logic first and earn confidence before viewing solutions.
          </p>
          <button
            onClick={handleGenerateProblem}
            disabled={isLoadingProblem}
            className="mt-5 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Start Practicing Now
          </button>
        </div>
      )}
    </div>
  );
};
