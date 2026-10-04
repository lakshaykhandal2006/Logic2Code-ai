import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  RotateCw,
  AlertCircle,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  HardDrive,
  Cpu,
  Variable,
  FunctionSquare,
  PlayCircle,
  ListOrdered,
  HelpCircle,
} from 'lucide-react';
import { SupportedLanguage, DifficultyLevel, CodeExplanationResult } from '../types';
import { explainCode } from '../services/api';
import { saveHistoryItem } from '../services/storage';
import { validateSupportedLanguage, validateDifficultyLevel } from '../services/aiValidators';
import { CodeViewer } from '../components/CodeViewer';

interface ExplainerPageProps {
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  initialResult?: CodeExplanationResult | null;
  initialDifficulty?: DifficultyLevel;
  onUpdateActiveContext: (ctx: {
    language?: SupportedLanguage;
    code?: string;
    problem?: string;
    logic?: string;
  }) => void;
}

const SAMPLE_EXPLAIN_SNIPPET = `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1`;

export const ExplainerPage: React.FC<ExplainerPageProps> = ({
  initialCode = '',
  initialLanguage = 'python',
  initialResult,
  initialDifficulty = 'Beginner',
  onUpdateActiveContext,
}) => {
  const [code, setCode] = useState(initialCode !== undefined ? initialCode : SAMPLE_EXPLAIN_SNIPPET);
  const [language, setLanguage] = useState<SupportedLanguage>(
    validateSupportedLanguage(initialLanguage, 'python')
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    validateDifficultyLevel(initialDifficulty, 'Beginner')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CodeExplanationResult | null>(initialResult || null);

  // Sync state when props update
  useEffect(() => {
    if (initialCode !== undefined) {
      setCode(initialCode);
    }
    setLanguage(validateSupportedLanguage(initialLanguage, 'python'));
    setDifficulty(validateDifficultyLevel(initialDifficulty, 'Beginner'));
    if (initialResult !== undefined) {
      setResult(initialResult);
    }
  }, [initialCode, initialLanguage, initialDifficulty, initialResult]);

  // Accordion state for expandable sections
  const [openSections, setOpenSections] = useState({
    purpose: true,
    stepByStep: true,
    lineByLine: true,
    variables: true,
    functions: true,
    algorithm: true,
    dryRun: true,
    complexity: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExplain = async () => {
    if (!code.trim()) {
      setError('Please provide code to explain.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await explainCode({
        code,
        language,
        difficulty,
      });

      setResult(data);

      saveHistoryItem({
        type: 'explanation',
        title: data.overallPurpose ? data.overallPurpose.slice(0, 50) : `Code Explanation (${language})`,
        language,
        code,
        result: data,
      });

      onUpdateActiveContext({
        language,
        code,
        problem: data.overallPurpose,
        logic: data.algorithm,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate code explanation. Please try again.');
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
            <BookOpen className="w-6 h-6 text-blue-500" />
            <span>Code Explainer & Tutor</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Demystify any code snippet with beginner-friendly breakdowns, variable tracking, dry runs, and complexity traces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCode(SAMPLE_EXPLAIN_SNIPPET);
              setLanguage('python');
              setDifficulty('Beginner');
              setError(null);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap"
          >
            Load Binary Search Example
          </button>
          <button
            onClick={() => {
              setCode('');
              setResult(null);
              setError(null);
            }}
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
            <p className="font-semibold">Explanation Error</p>
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

      {/* Two-Column Explainer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Code Input & Difficulty Selection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-blue-500" />
                <span>Your Code</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">Editable source</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
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
                  Audience Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="Beginner">Beginner (Simple analogies)</option>
                  <option value="Intermediate">Intermediate (Idiomatic)</option>
                  <option value="Advanced">Advanced (Deep mechanics)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Code Snippet
              </label>
              <CodeViewer
                code={code}
                language={language}
                editable={true}
                onChange={(val) => setCode(val)}
                maxHeight="340px"
                placeholder="Paste the code you want explained..."
              />
            </div>

            <button
              onClick={handleExplain}
              disabled={isLoading || !code.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Deconstructing Logic & Execution...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>Start Explanation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Deep Explanation Breakdown with Collapsible Sections */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>AI Explanation</span>
              {result && (
                <span className="text-xs text-slate-500 font-normal">
                  · {difficulty} Mode
                </span>
              )}
            </h2>
          </div>

          {!result && !isLoading && (
            <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-500 text-xs sm:text-sm">
              Paste code on the left and click "Start Explanation" to generate a step-by-step breakdown.
            </div>
          )}

          {isLoading && (
            <div className="p-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Generating pedagogical explanation, tracking variables, and creating dry run trace...
              </p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-4">
              {/* Section A: Overall Purpose */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleSection('purpose')}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">A.</span> Overall Purpose
                  </span>
                  {openSections.purpose ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.purpose && (
                  <div className="p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {result.overallPurpose}
                  </div>
                )}
              </div>

              {/* Section B: Step-by-Step Explanation */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleSection('stepByStep')}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">B.</span> Step-by-Step Flow ({result.stepByStep?.length || 0})
                  </span>
                  {openSections.stepByStep ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.stepByStep && (
                  <div className="p-4 space-y-3 border-t border-slate-100 dark:border-slate-800">
                    {result.stepByStep?.map((step) => (
                      <div key={step.stepNumber} className="flex items-start gap-3 text-xs sm:text-sm">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                          {step.stepNumber}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {step.title}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                            {step.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section C: Line-by-Line Explanation */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleSection('lineByLine')}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">C.</span> Line-by-Line Breakdown
                  </span>
                  {openSections.lineByLine ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.lineByLine && (
                  <div className="p-4 space-y-2.5 border-t border-slate-100 dark:border-slate-800">
                    {result.lineByLine?.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs ${
                          item.importance === 'key'
                            ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                        }`}
                      >
                        <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          {item.lines}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">{item.explanation}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section D: Variables */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleSection('variables')}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">D.</span> Variables & Memory Roles
                  </span>
                  {openSections.variables ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.variables && (
                  <div className="p-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
                    {result.variables?.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <Variable className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {v.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">({v.type})</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 sm:text-right">
                          <span className="font-medium text-slate-700 dark:text-slate-300 mr-1">{v.role}:</span>
                          <span>{v.purpose}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section E: Functions */}
              {result.functions && result.functions.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                  <button
                    onClick={() => toggleSection('functions')}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-blue-500">E.</span> Functions Breakdown
                    </span>
                    {openSections.functions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openSections.functions && (
                    <div className="p-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
                      {result.functions.map((fn, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <FunctionSquare className="w-4 h-4 text-purple-500" />
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                              {fn.name}({fn.parameters})
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">→ {fn.returns}</span>
                          </div>
                          <div className="text-slate-600 dark:text-slate-400 pl-6">{fn.purpose}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Section F: Logic & Algorithm */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleSection('algorithm')}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">F.</span> Algorithm & Conceptual Logic
                  </span>
                  {openSections.algorithm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.algorithm && (
                  <div className="p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {result.algorithm}
                  </div>
                )}
              </div>

              {/* Section G: Example Dry Run */}
              {result.dryRun && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                  <button
                    onClick={() => toggleSection('dryRun')}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-blue-500">G.</span> Example Dry Run Trace
                    </span>
                    {openSections.dryRun ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openSections.dryRun && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between text-xs gap-2 p-2.5 rounded bg-slate-100 dark:bg-slate-950 font-mono">
                        <div>
                          <span className="text-slate-500">Input: </span>
                          <span className="text-slate-900 dark:text-slate-100 font-bold">
                            {result.dryRun.sampleInput}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Result: </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {result.dryRun.finalOutput}
                          </span>
                        </div>
                      </div>

                      {/* Trace Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                              <th className="py-2 px-2">#</th>
                              <th className="py-2 px-2">Action / Line</th>
                              <th className="py-2 px-2">State</th>
                              <th className="py-2 px-2">Explanation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {result.dryRun.traceSteps?.map((trace) => (
                              <tr key={trace.step}>
                                <td className="py-2 px-2 text-slate-500 tabular-nums">{trace.step}</td>
                                <td className="py-2 px-2 text-slate-900 dark:text-slate-100">
                                  {trace.currentLineOrAction}
                                </td>
                                <td className="py-2 px-2 text-blue-600 dark:text-blue-400 font-bold">
                                  {trace.state}
                                </td>
                                <td className="py-2 px-2 text-slate-600 dark:text-slate-400 font-sans">
                                  {trace.explanation}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Section H: Complexity Analysis */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleSection('complexity')}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">H.</span> Time & Space Complexity
                  </span>
                  {openSections.complexity ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.complexity && (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                          Time: {result.timeComplexity?.bigO}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {result.timeComplexity?.explanation}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <div className="flex items-center gap-2 mb-1">
                        <HardDrive className="w-4 h-4 text-teal-500" />
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                          Space: {result.spaceComplexity?.bigO}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {result.spaceComplexity?.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
