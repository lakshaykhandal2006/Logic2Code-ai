import React, { useState, useEffect } from 'react';
import {
  Scale,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckSquare,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage, LogicCodeMatchResult } from '../types';
import { checkLogicVsCode } from '../services/api';
import { saveHistoryItem } from '../services/storage';
import { validateSupportedLanguage } from '../services/aiValidators';
import { CodeViewer } from '../components/CodeViewer';

interface LogicVsCodePageProps {
  initialProblem?: string;
  initialLogic?: string;
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  initialResult?: LogicCodeMatchResult | null;
  onSendToExplainer: (code: string, language: SupportedLanguage) => void;
  onUpdateActiveContext: (ctx: {
    language?: SupportedLanguage;
    code?: string;
    problem?: string;
    logic?: string;
  }) => void;
}

const SAMPLE_COMPARISON = {
  problem: 'Reverse a string in place or return its reverse.',
  logic: 'Use two pointers starting at the beginning and end of the string, swapping characters and moving inward until they meet.',
  code: `def reverse_string(s):
    # Instead of two pointers, user took shortcut slicing
    return s[::-1]`,
  language: 'python' as SupportedLanguage,
};

export const LogicVsCodePage: React.FC<LogicVsCodePageProps> = ({
  initialProblem = '',
  initialLogic = '',
  initialCode = '',
  initialLanguage = 'python',
  initialResult,
  onSendToExplainer,
  onUpdateActiveContext,
}) => {
  const [problem, setProblem] = useState(initialProblem !== undefined ? initialProblem : SAMPLE_COMPARISON.problem);
  const [logic, setLogic] = useState(initialLogic !== undefined ? initialLogic : SAMPLE_COMPARISON.logic);
  const [code, setCode] = useState(initialCode !== undefined ? initialCode : SAMPLE_COMPARISON.code);
  const [language, setLanguage] = useState<SupportedLanguage>(
    validateSupportedLanguage(initialLanguage, SAMPLE_COMPARISON.language)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LogicCodeMatchResult | null>(initialResult || null);

  useEffect(() => {
    if (initialProblem !== undefined) setProblem(initialProblem);
    if (initialLogic !== undefined) setLogic(initialLogic);
    if (initialCode !== undefined) setCode(initialCode);
    setLanguage(validateSupportedLanguage(initialLanguage, 'python'));
    if (initialResult !== undefined) setResult(initialResult);
  }, [initialProblem, initialLogic, initialCode, initialLanguage, initialResult]);

  const handleCompare = async () => {
    if (!logic.trim() || !code.trim()) {
      setError('Both Expected Logic and Source Code are required to verify alignment.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await checkLogicVsCode({
        problem,
        logic,
        code,
        language,
      });

      setResult(data);

      saveHistoryItem({
        type: 'logic-vs-code',
        title: `Logic Match: ${problem ? problem.slice(0, 40) : 'Logic vs Code'}`,
        language,
        problemStatement: problem,
        logic,
        code,
        result: data,
      });

      onUpdateActiveContext({
        language,
        code: data.correctedCode || code,
        problem,
        logic,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong while verifying logic vs code alignment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchBadge = (status: LogicCodeMatchResult['matchStatus']) => {
    switch (status) {
      case 'Matches':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-600 text-white">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Matches</span>
          </span>
        );
      case 'Partially Matches':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-500 text-white">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Partially Matches</span>
          </span>
        );
      case 'Does Not Match':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-rose-600 text-white">
            <XCircle className="w-3.5 h-3.5" />
            <span>Does Not Match</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Scale className="w-6 h-6 text-teal-500" />
            <span>Does My Code Follow My Logic?</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare your intended algorithmic logic directly against your actual code to verify whether your implementation faithfully followed your plan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setProblem(SAMPLE_COMPARISON.problem);
              setLogic(SAMPLE_COMPARISON.logic);
              setCode(SAMPLE_COMPARISON.code);
              setLanguage(SAMPLE_COMPARISON.language);
              setError(null);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Load Sample Mismatch
          </button>
          <button
            onClick={() => {
              setProblem('');
              setLogic('');
              setCode('');
              setResult(null);
              setError(null);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 flex items-start gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">Comparison Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            onClick={handleCompare}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 hover:bg-rose-300"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Logic & Code Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Problem Statement (Optional)
              </label>
              <input
                type="text"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="What problem were you trying to solve?"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Expected Logic / Algorithm <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={logic}
                onChange={(e) => setLogic(e.target.value)}
                rows={5}
                placeholder="Describe the logic you intended your code to follow..."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono leading-relaxed transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Your Code Implementation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="text-[11px] px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded font-mono"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={8}
                placeholder="Paste the code you wrote..."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono leading-relaxed transition-colors"
              />
            </div>

            <button
              onClick={handleCompare}
              disabled={isLoading || !logic.trim() || !code.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Comparing Implementation Against Logic...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  <span>Check Logic vs Code Match</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Comparison Verdict */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Verdict Banner */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase font-mono text-slate-500 font-semibold">
                    Alignment Result
                  </span>
                  {getMatchBadge(result.matchStatus)}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {result.summary}
                </p>
                <div className="text-xs text-slate-500 pt-1">
                  Solves Problem: <strong className={result.solvesProblem ? 'text-emerald-500' : 'text-rose-500'}>
                    {result.solvesProblem ? 'Yes' : 'No / Incomplete'}
                  </strong>
                </div>
              </div>

              {/* Identified Differences */}
              {result.differences && result.differences.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                    Discrepancies Between Logic & Code
                  </span>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {result.differences.map((diff, i) => (
                      <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{diff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Explanation */}
              {result.explanation && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    In-Depth Analysis
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {result.explanation}
                  </p>
                </div>
              )}

              {/* Corrected Code if Mismatched */}
              {result.correctedCode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Code Aligned with Stated Logic</span>
                    </h3>
                    <button
                      onClick={() => onSendToExplainer(result.correctedCode!, language)}
                      className="text-xs text-blue-500 hover:underline font-medium"
                    >
                      Explain this code
                    </button>
                  </div>

                  <CodeViewer
                    code={result.correctedCode}
                    language={language}
                    title={`aligned_${language}`}
                    onExplain={() => onSendToExplainer(result.correctedCode!, language)}
                    maxHeight="350px"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-500 text-xs sm:text-sm">
              <Scale className="w-8 h-8 text-teal-500/60 mx-auto mb-3" />
              <p className="font-medium text-slate-800 dark:text-slate-200">Verify whether code matches intent</p>
              <p className="mt-1 max-w-sm mx-auto text-slate-500">
                Enter your expected algorithm and your written code to see if your code took shortcuts, skipped edge cases, or diverged from your plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
