import React, { useState, useEffect } from 'react';
import {
  Zap,
  ArrowRight,
  RotateCw,
  AlertCircle,
  FileCode,
  Clock,
  HardDrive,
  CheckCircle,
  TrendingUp,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage, CodeOptimizationResult } from '../types';
import { optimizeCode } from '../services/api';
import { saveHistoryItem } from '../services/storage';
import { validateSupportedLanguage } from '../services/aiValidators';
import { CodeViewer } from '../components/CodeViewer';

interface OptimizerPageProps {
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  initialResult?: CodeOptimizationResult | null;
  onSendToExplainer: (code: string, language: SupportedLanguage) => void;
  onUpdateActiveContext: (ctx: {
    language?: SupportedLanguage;
    code?: string;
    problem?: string;
    logic?: string;
  }) => void;
}

const SAMPLE_INEFFICIENT_SNIPPET = `def has_duplicates(nums):
    # Inefficient O(N^2) brute-force nested loops
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False`;

export const OptimizerPage: React.FC<OptimizerPageProps> = ({
  initialCode = '',
  initialLanguage = 'python',
  initialResult,
  onSendToExplainer,
  onUpdateActiveContext,
}) => {
  const [code, setCode] = useState(initialCode !== undefined ? initialCode : SAMPLE_INEFFICIENT_SNIPPET);
  const [language, setLanguage] = useState<SupportedLanguage>(
    validateSupportedLanguage(initialLanguage, 'python')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CodeOptimizationResult | null>(initialResult || null);

  useEffect(() => {
    if (initialCode !== undefined) setCode(initialCode);
    setLanguage(validateSupportedLanguage(initialLanguage, 'python'));
    if (initialResult !== undefined) setResult(initialResult);
  }, [initialCode, initialLanguage, initialResult]);

  const handleOptimize = async () => {
    if (!code.trim()) {
      setError('Please provide code to optimize.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await optimizeCode({
        code,
        language,
      });

      setResult(data);

      saveHistoryItem({
        type: 'optimization',
        title: `Optimize: ${data.currentApproach ? data.currentApproach.slice(0, 45) : language}`,
        language,
        code,
        result: data,
      });

      onUpdateActiveContext({
        language,
        code: data.optimizedCode || code,
        problem: `Optimized from ${data.currentComplexity.time} to ${data.newComplexity.time}`,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong while optimizing your code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            <span>Optimize My Code</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Detect algorithmic bottlenecks, eliminate redundant loops, upgrade data structures, and reduce time & space complexity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCode(SAMPLE_INEFFICIENT_SNIPPET);
              setLanguage('python');
              setError(null);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap"
          >
            Load Inefficient Example
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
            <p className="font-semibold">Optimization error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            onClick={handleOptimize}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 hover:bg-rose-300"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Two Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Source Code */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-amber-500" />
                <span>Source Code to Optimize</span>
              </h2>
              <span className="text-[11px] text-slate-500">Provide any working code</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="java">Java</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Code Snippet <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                placeholder="Paste code to analyze complexity and optimize..."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono leading-relaxed transition-colors"
              />
            </div>

            <button
              onClick={handleOptimize}
              disabled={isLoading || !code.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Profiling & Optimizing Algorithms...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Optimize My Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Optimization Results & Code */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Complexity Comparison Card */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20 shadow-xs">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-semibold block mb-3">
                  Complexity Speedup Comparison
                </span>

                <div className="grid grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[11px] font-semibold text-rose-500 block">Current Complexity</span>
                    <div className="mt-1 flex flex-col gap-1 font-mono text-xs">
                      <span className="text-slate-700 dark:text-slate-300">
                        Time: <strong className="text-rose-500">{result.currentComplexity.time}</strong>
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        Space: <strong>{result.currentComplexity.space}</strong>
                      </span>
                    </div>
                  </div>

                  {/* After */}
                  <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/30">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Optimized Complexity</span>
                    </span>
                    <div className="mt-1 flex flex-col gap-1 font-mono text-xs">
                      <span className="text-slate-800 dark:text-slate-200">
                        Time: <strong className="text-emerald-500">{result.newComplexity.time}</strong>
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">
                        Space: <strong>{result.newComplexity.space}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approaches Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Current Approach
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {result.currentApproach}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block mb-1">
                    Optimized Approach
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {result.optimizedApproach}
                  </p>
                </div>
              </div>

              {/* Bottlenecks & Problems */}
              {result.problems && result.problems.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Identified Inefficiencies & Bottlenecks
                  </span>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {result.problems.map((prob, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                        <span>{prob}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Optimized Code Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Optimized Code</span>
                  </h3>
                  <button
                    onClick={() => onSendToExplainer(result.optimizedCode, language)}
                    className="text-xs text-blue-500 hover:underline font-medium"
                  >
                    Explain Optimized Code
                  </button>
                </div>

                <CodeViewer
                  code={result.optimizedCode}
                  language={language}
                  title={`optimized_${language}`}
                  onExplain={() => onSendToExplainer(result.optimizedCode, language)}
                  maxHeight="380px"
                />
              </div>

              {/* Why This Is Better */}
              {result.whyThisIsBetter && result.whyThisIsBetter.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">
                    Why This Is Better
                  </span>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {result.whyThisIsBetter.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-500 text-xs sm:text-sm">
              <Zap className="w-8 h-8 text-amber-500/60 mx-auto mb-3" />
              <p className="font-medium text-slate-800 dark:text-slate-200">Ready to optimize performance</p>
              <p className="mt-1 max-w-sm mx-auto text-slate-500">
                Paste your code on the left to analyze runtime complexity, identify algorithmic bottlenecks, and get an optimized version.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
