import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  HardDrive,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import { LogicValidationResult } from '../types';
import { validateLogic } from '../services/api';
import { saveHistoryItem } from '../services/storage';

interface LogicValidatorPageProps {
  initialProblem?: string;
  initialLogic?: string;
  initialResult?: LogicValidationResult | null;
  onSendToGenerator: (problem: string, logic: string) => void;
  onUpdateActiveContext: (ctx: {
    problem?: string;
    logic?: string;
  }) => void;
}

const SAMPLE_FLAWED_LOGIC = {
  problem: 'Find the maximum product of two integers in an array of numbers.',
  logic: 'Simply find the two largest positive numbers in the array and multiply them together. That product will always be the maximum possible product.',
};

export const LogicValidatorPage: React.FC<LogicValidatorPageProps> = ({
  initialProblem,
  initialLogic,
  initialResult,
  onSendToGenerator,
  onUpdateActiveContext,
}) => {
  const [problem, setProblem] = useState(initialProblem !== undefined ? initialProblem : SAMPLE_FLAWED_LOGIC.problem);
  const [logic, setLogic] = useState(initialLogic !== undefined ? initialLogic : SAMPLE_FLAWED_LOGIC.logic);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LogicValidationResult | null>(initialResult || null);
  const [copiedLogic, setCopiedLogic] = useState(false);
  const [copyLogicError, setCopyLogicError] = useState(false);

  useEffect(() => {
    if (initialProblem !== undefined) setProblem(initialProblem);
    if (initialLogic !== undefined) setLogic(initialLogic);
    if (initialResult !== undefined) setResult(initialResult);
  }, [initialProblem, initialLogic, initialResult]);

  const handleCopyLogic = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLogic(true);
      setCopyLogicError(false);
      setTimeout(() => setCopiedLogic(false), 2000);
    } catch {
      setCopyLogicError(true);
      setTimeout(() => setCopyLogicError(false), 2500);
    }
  };

  const handleValidate = async () => {
    if (!logic.trim()) {
      setError('Please provide your algorithmic logic or approach to validate.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await validateLogic({
        problem,
        logic,
      });

      setResult(data);

      saveHistoryItem({
        type: 'validation',
        title: `Logic Validation: ${problem ? problem.slice(0, 45) : 'General Logic'}`,
        language: 'python',
        problemStatement: problem,
        logic,
        result: data,
      });

      onUpdateActiveContext({
        problem,
        logic: data.improvedLogic || logic,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong while validating your logic. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setProblem('');
    setLogic('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            <span>Validate My Logic</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Check whether your algorithm is mathematically sound before writing code. Exposes flawed reasoning and counterexamples.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setProblem(SAMPLE_FLAWED_LOGIC.problem);
              setLogic(SAMPLE_FLAWED_LOGIC.logic);
              setError(null);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap"
          >
            Load Flawed Example
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
            <p className="font-semibold">Validation Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            onClick={handleValidate}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 hover:bg-rose-300"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Two Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Logic Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Problem Statement (Optional but Recommended)
              </label>
              <input
                type="text"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g. Find maximum product of two numbers in an array"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Logic or Algorithm <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={logic}
                onChange={(e) => setLogic(e.target.value)}
                rows={11}
                placeholder="Explain how you plan to solve the problem step-by-step..."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono leading-relaxed transition-colors"
              />
            </div>

            <button
              onClick={handleValidate}
              disabled={isLoading || !logic.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Logical Soundness...</span>
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4" />
                  <span>Validate My Logic</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Reasoning Verdict & Counterexamples */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Verdict Card */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                result.isCorrect
                  ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200'
                  : 'border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200'
              }`}>
                <div className="flex items-start gap-3">
                  {result.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-mono font-semibold">Verdict:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        result.isCorrect ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {result.verdict}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm mt-1 leading-relaxed">{result.summary}</p>
                  </div>
                </div>

                <button
                  onClick={() => onSendToGenerator(problem, result.improvedLogic || logic)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 flex items-center gap-1 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Turn Into Code</span>
                </button>
              </div>

              {/* Counterexample if flawed */}
              {result.counterexample && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/30 shadow-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    <XCircle className="w-4 h-4" />
                    <span>Concrete Counterexample (Why This Logic Breaks)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 font-mono text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Input:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{result.counterexample.input}</span>
                    </div>
                    <div>
                      <span className="text-rose-500 block text-[10px] uppercase">Flaw in reasoning:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-sans">{result.counterexample.whyItFails}</span>
                    </div>
                    <div>
                      <span className="text-emerald-500 block text-[10px] uppercase">Expected outcome:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{result.counterexample.expectedOutcome}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Assumptions & Flaws in Reasoning */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.assumptions && result.assumptions.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Implicit Assumptions Made
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {result.assumptions.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.problemsInReasoning && result.problemsInReasoning.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-2">
                      Flaws in Reasoning
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {result.problemsInReasoning.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Improved Logic */}
              {result.improvedLogic && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Corrected & Improved Logic
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCopyLogic(result.improvedLogic)}
                        className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium"
                        title="Copy improved logic"
                      >
                        {copiedLogic ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : copyLogicError ? (
                          <>
                            <span className="text-rose-400">Copy Failed</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => onSendToGenerator(problem, result.improvedLogic)}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>Generate code</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-mono leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                    {result.improvedLogic}
                  </p>
                </div>
              )}

              {/* Expected Complexity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Expected Time</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {result.expectedComplexity.time || 'O(N)'}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 text-xs">
                  <HardDrive className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Expected Space</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {result.expectedComplexity.space || 'O(1)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-500 text-xs sm:text-sm">
              <Lightbulb className="w-8 h-8 text-amber-500/60 mx-auto mb-3" />
              <p className="font-medium text-slate-800 dark:text-slate-200">Validate your algorithm before writing code</p>
              <p className="mt-1 max-w-sm mx-auto text-slate-500">
                Enter your logic on the left. The AI will stress-test your thoughts, search for counterexamples, and provide mathematically sound guidance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
