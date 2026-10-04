import React, { useState, useEffect } from 'react';
import {
  Scale,
  RotateCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  CheckSquare,
} from 'lucide-react';
import { SupportedLanguage, CombinedAnalysisResult } from '../types';
import { analyzeProblem } from '../services/api';
import { saveHistoryItem } from '../services/storage';
import { validateSupportedLanguage } from '../services/aiValidators';
import { CodeViewer } from '../components/CodeViewer';

interface CombinedAnalysisPageProps {
  initialProblem?: string;
  initialLogic?: string;
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  initialResult?: CombinedAnalysisResult | null;
  onSendToExplainer?: (code: string, language: SupportedLanguage) => void;
  onSendToChecker?: (code: string, language: SupportedLanguage) => void;
  onUpdateActiveContext: (ctx: {
    language?: SupportedLanguage;
    code?: string;
    problem?: string;
    logic?: string;
  }) => void;
}

const SAMPLE_COMBINED_DATA = {
  problem: 'Find the largest element in an array.',
  logic: 'Take the first element as maximum and compare it with every other element. If any element is greater, update maximum.',
  code: `def find_max(arr):
    # User's attempt
    m = arr[0]
    for x in arr:
        if x > m:
            m = x
    return m`,
  language: 'python' as SupportedLanguage,
};

export const CombinedAnalysisPage: React.FC<CombinedAnalysisPageProps> = ({
  initialProblem,
  initialLogic,
  initialCode,
  initialLanguage,
  initialResult,
  onSendToExplainer,
  onSendToChecker,
  onUpdateActiveContext,
}) => {
  const [problem, setProblem] = useState(initialProblem !== undefined ? initialProblem : SAMPLE_COMBINED_DATA.problem);
  const [logic, setLogic] = useState(initialLogic !== undefined ? initialLogic : SAMPLE_COMBINED_DATA.logic);
  const [code, setCode] = useState(initialCode !== undefined ? initialCode : SAMPLE_COMBINED_DATA.code);
  const [language, setLanguage] = useState<SupportedLanguage>(
    validateSupportedLanguage(initialLanguage, SAMPLE_COMBINED_DATA.language)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CombinedAnalysisResult | null>(initialResult || null);

  // Sync state when initial props update
  useEffect(() => {
    if (initialProblem !== undefined) setProblem(initialProblem);
    if (initialLogic !== undefined) setLogic(initialLogic);
    if (initialCode !== undefined) setCode(initialCode);
    setLanguage(validateSupportedLanguage(initialLanguage, 'python'));
    if (initialResult !== undefined) setResult(initialResult);
  }, [initialProblem, initialLogic, initialCode, initialLanguage, initialResult]);

  const handleRunAnalysis = async () => {
    if (!problem.trim() || !logic.trim() || !code.trim()) {
      setError('Problem Statement, Stated Logic, and Source Code are all required for 3-way analysis.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await analyzeProblem({
        problem,
        logic,
        code,
        language,
      });

      setResult(data);

      saveHistoryItem({
        type: 'combined',
        title: problem ? `Audit: ${problem.slice(0, 45)}` : 'Combined 3-Way Audit',
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
      setError(err.message || 'Failed to complete 3-way triangulation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Scale className="w-6 h-6 text-teal-500" />
            <span>Problem + Logic + Code Triangulation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare all three components to evaluate if your code actually follows your logic and truly solves the problem.
          </p>
        </div>

        <button
          onClick={() => {
            setProblem(SAMPLE_COMBINED_DATA.problem);
            setLogic(SAMPLE_COMBINED_DATA.logic);
            setCode(SAMPLE_COMBINED_DATA.code);
            setLanguage(SAMPLE_COMBINED_DATA.language);
          }}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          Load Array Max Example
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 flex items-start gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">Analysis Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs underline hover:no-underline font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Triangulation Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3 Input Blocks */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                1. Problem Statement
              </h2>
              <span className="text-[11px] text-slate-500">The goal</span>
            </div>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={2}
              placeholder="e.g. Find the largest element in an array."
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
            />

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 pt-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                2. Stated Logic / Approach
              </h2>
              <span className="text-[11px] text-slate-500">Your planned algorithm</span>
            </div>
            <textarea
              value={logic}
              onChange={(e) => setLogic(e.target.value)}
              rows={3}
              placeholder="e.g. Take the first element as maximum and compare it with every other element..."
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 font-mono transition-colors"
            />

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 pt-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  3. Code Implementation
                </h2>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Source code</span>
            </div>

            <CodeViewer
              code={code}
              language={language}
              editable={true}
              onChange={(val) => setCode(val)}
              maxHeight="250px"
              placeholder="Paste the implementation code..."
            />

            <button
              onClick={handleRunAnalysis}
              disabled={isLoading || !problem.trim() || !logic.trim() || !code.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Cross-Auditing Problem, Logic & Code...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  <span>Analyze Alignment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: AI Alignment Verdict & Analysis Report */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Triangulation Verdict & Audit Report
          </h2>

          {!result && !isLoading && (
            <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-500 text-xs sm:text-sm">
              Fill in all three sections on the left and click "Analyze Alignment" to evaluate agreement.
            </div>
          )}

          {isLoading && (
            <div className="p-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-teal-500 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Checking semantic alignment, edge cases, and algorithm fidelity...
              </p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-4">
              {/* Question 1 & 2: Solves Problem & Follows Logic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`p-4 rounded-xl border ${
                    result.solvesProblem.verdict
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-rose-300 dark:border-rose-800/80 bg-rose-50/50 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {result.solvesProblem.verdict ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      1. Solves the Problem?
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {result.solvesProblem.explanation}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    result.followsLogic.verdict
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-rose-300 dark:border-rose-800/80 bg-rose-50/50 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {result.followsLogic.verdict ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      2. Follows Stated Logic?
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {result.followsLogic.explanation}
                  </p>
                </div>
              </div>

              {/* Overall Summary */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Overall Synthesis
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.overallSummary}
                </p>
              </div>

              {/* Logical Mistakes */}
              {result.logicalMistakes && result.logicalMistakes.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-2">
                    3. Logical Mistakes Detected
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                    {result.logicalMistakes.map((mistake, idx) => (
                      <li key={idx}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Edge Cases */}
              {result.missingEdgeCases && result.missingEdgeCases.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-2">
                    4. Missing Edge Cases
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                    {result.missingEdgeCases.map((edge, idx) => (
                      <li key={idx}>{edge}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Efficiency Verdict */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-1">
                  5. Implementation Efficiency
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {result.efficiencyVerdict}
                </p>
              </div>

              {/* Suggested Improvements */}
              {result.suggestedImprovements && result.suggestedImprovements.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block mb-2">
                    6. What Can Be Improved
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                    {result.suggestedImprovements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Corrected Code */}
              {result.correctedCode && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                      Properly Aligned Code
                    </span>
                    <div className="flex items-center gap-2">
                      {onSendToExplainer && (
                        <button
                          onClick={() => onSendToExplainer(result.correctedCode, language)}
                          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Explain Code</span>
                        </button>
                      )}
                      {onSendToChecker && (
                        <button
                          onClick={() => onSendToChecker(result.correctedCode, language)}
                          className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Check Code</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <CodeViewer
                    code={result.correctedCode}
                    language={language}
                    title={`aligned_${language}`}
                    maxHeight="320px"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
