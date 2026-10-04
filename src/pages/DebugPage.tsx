import React, { useState, useEffect } from 'react';
import {
  Bug,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCw,
  AlertCircle,
  FileCode,
  ArrowRight,
  Clock,
  HardDrive,
  Lightbulb,
  BookOpen,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SupportedLanguage, CodeDebugResult } from '../types';
import { debugCode } from '../services/api';
import { saveHistoryItem } from '../services/storage';
import { validateSupportedLanguage } from '../services/aiValidators';
import { CodeViewer } from '../components/CodeViewer';

interface DebugPageProps {
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  initialResult?: CodeDebugResult | null;
  initialExpectedBehavior?: string;
  onSendToExplainer: (code: string, language: SupportedLanguage) => void;
  onSendToOptimizer?: (code: string, language: SupportedLanguage) => void;
  onUpdateActiveContext: (ctx: {
    language?: SupportedLanguage;
    code?: string;
    problem?: string;
    logic?: string;
  }) => void;
}

const SAMPLE_BUGGY_SNIPPET = `def find_largest(nums):
    # Buggy implementation: crashes on empty list & off-by-one indexing
    max_val = nums[0]
    for i in range(1, len(nums) + 1):
        if nums[i] > max_val:
            max_val = nums[i]
    return max_val`;

export const DebugPage: React.FC<DebugPageProps> = ({
  initialCode = '',
  initialLanguage = 'python',
  initialResult,
  initialExpectedBehavior = '',
  onSendToExplainer,
  onSendToOptimizer,
  onUpdateActiveContext,
}) => {
  const [code, setCode] = useState(initialCode !== undefined ? initialCode : SAMPLE_BUGGY_SNIPPET);
  const [language, setLanguage] = useState<SupportedLanguage>(
    validateSupportedLanguage(initialLanguage, 'python')
  );
  const [expectedBehavior, setExpectedBehavior] = useState(initialExpectedBehavior);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CodeDebugResult | null>(initialResult || null);

  useEffect(() => {
    if (initialCode !== undefined) setCode(initialCode);
    setLanguage(validateSupportedLanguage(initialLanguage, 'python'));
    if (initialExpectedBehavior !== undefined) setExpectedBehavior(initialExpectedBehavior);
    if (initialResult !== undefined) setResult(initialResult);
  }, [initialCode, initialLanguage, initialExpectedBehavior, initialResult]);

  const handleDebug = async () => {
    if (!code.trim()) {
      setError('Please paste or write your code to debug.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await debugCode({
        code,
        language,
        expectedBehavior: expectedBehavior.trim() || undefined,
      });

      setResult(data);

      saveHistoryItem({
        type: 'debug',
        title: expectedBehavior ? `Debug: ${expectedBehavior.slice(0, 45)}` : `Debug (${language})`,
        language,
        code,
        result: data,
      });

      onUpdateActiveContext({
        language,
        code: data.correctedCode || code,
        problem: expectedBehavior || data.summary,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong while debugging your code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setExpectedBehavior('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bug className="w-6 h-6 text-rose-500" />
            <span>Debug My Code</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze syntax errors, logical bugs, runtime flaws, incorrect loops, and edge cases without silent rewrites.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCode(SAMPLE_BUGGY_SNIPPET);
              setLanguage('python');
              setExpectedBehavior('Safely find the largest number in a list of numbers');
              setError(null);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap"
          >
            Load Buggy Example
          </button>
          <button
            onClick={handleClear}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 flex items-start gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">Something went wrong while analyzing your code.</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            onClick={handleDebug}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 hover:bg-rose-300"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Code */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-rose-500" />
                <span>Your Code to Debug</span>
              </h2>
              <span className="text-[11px] text-slate-500">Paste your implementation</span>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="java">Java</option>
              </select>
            </div>

            {/* Expected Behavior (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Intended Problem / Expected Behavior (Optional)
              </label>
              <input
                type="text"
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="e.g. Find largest number in array without crashing on empty inputs"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Code Textarea Editor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Code Snippet <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                placeholder="Paste your source code here..."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500 font-mono leading-relaxed transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleDebug}
              disabled={isLoading || !code.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Diagnosing Bugs & Vulnerabilities...</span>
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4" />
                  <span>Debug My Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Audit Findings & Corrected Code */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                result.status === 'Correct'
                  ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                  : 'border-rose-500/30 bg-rose-50/30 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
              }`}>
                <div className="flex items-center gap-3">
                  {result.status === 'Correct' ? (
                    <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider font-semibold">Status:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        result.status === 'Correct' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm mt-1">{result.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSendToExplainer(result.correctedCode || code, language)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium"
                    title="Explain corrected code"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Explain</span>
                  </button>
                  {onSendToOptimizer && (
                    <button
                      onClick={() => onSendToOptimizer(result.correctedCode || code, language)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium"
                      title="Optimize code"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Optimize</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Problems Found Section */}
              {result.problemsFound && result.problemsFound.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Problems Found ({result.problemsFound.length})</span>
                  </h3>

                  <div className="space-y-3">
                    {result.problemsFound.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-[10px] font-mono">
                              {idx + 1}
                            </span>
                            {p.issue}
                          </span>
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {p.category}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded font-semibold ${
                              p.severity === 'critical' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                              {p.severity.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                          <div>
                            <span className="text-[11px] font-semibold text-rose-500 block mb-0.5">
                              Why It Happens:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              {p.whyItHappens}
                            </p>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-emerald-500 block mb-0.5">
                              How To Fix It:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              {p.howToFix}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Corrected Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Corrected Code</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    {onSendToOptimizer && (
                      <button
                        onClick={() => onSendToOptimizer(result.correctedCode || code, language)}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
                      >
                        ⚡ Optimize Corrected Code
                      </button>
                    )}
                    <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                      Fixes applied without silent rewrite
                    </span>
                  </div>
                </div>

                <CodeViewer
                  code={result.correctedCode || code}
                  language={language}
                  title={`debugged_${language}`}
                  onExplain={() => onSendToExplainer(result.correctedCode || code, language)}
                  maxHeight="380px"
                />
              </div>

              {/* Explanation of Changes */}
              {result.explanationOfChanges && result.explanationOfChanges.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Explanation of Changes
                  </span>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {result.explanationOfChanges.map((change, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Complexity Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Time Complexity</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {result.timeComplexity || 'O(N)'}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 text-xs">
                  <HardDrive className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Space Complexity</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {result.spaceComplexity || 'O(1)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-500 text-xs sm:text-sm">
              <Bug className="w-8 h-8 text-rose-500/60 mx-auto mb-3" />
              <p className="font-medium text-slate-800 dark:text-slate-200">Ready to diagnose your code</p>
              <p className="mt-1 max-w-sm mx-auto text-slate-500">
                Paste your code on the left and click "Debug My Code" to detect syntax errors, off-by-one errors, infinite loops, and edge cases.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
