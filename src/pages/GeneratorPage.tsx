import React, { useState, useEffect } from 'react';
import {
  Code2,
  Sparkles,
  ArrowRight,
  Clock,
  HardDrive,
  CheckCircle,
  HelpCircle,
  RotateCw,
  AlertCircle,
  BookOpen,
  CheckSquare,
  FileCode,
} from 'lucide-react';
import {
  SupportedLanguage,
  DifficultyLevel,
  CodeGenResult,
  PresetLogicExample,
} from '../types';
import { generateCode } from '../services/api';
import { saveHistoryItem, PRESET_EXAMPLES } from '../services/storage';
import { validateSupportedLanguage, validateDifficultyLevel } from '../services/aiValidators';
import { CodeViewer } from '../components/CodeViewer';

interface GeneratorPageProps {
  initialPreset?: PresetLogicExample | null;
  initialResult?: CodeGenResult | null;
  onSendToExplainer: (code: string, language: SupportedLanguage) => void;
  onSendToChecker: (code: string, language: SupportedLanguage) => void;
  onSendToTester?: (code: string, language: SupportedLanguage) => void;
  onSendToDryRun?: (code: string, language: SupportedLanguage) => void;
  onUpdateActiveContext: (ctx: {
    language?: SupportedLanguage;
    code?: string;
    problem?: string;
    logic?: string;
  }) => void;
}

export const GeneratorPage: React.FC<GeneratorPageProps> = ({
  initialPreset,
  initialResult,
  onSendToExplainer,
  onSendToChecker,
  onSendToTester,
  onSendToDryRun,
  onUpdateActiveContext,
}) => {
  const [problem, setProblem] = useState(initialPreset?.problem || '');
  const [logic, setLogic] = useState(
    initialPreset?.logic ||
      'I want to find the largest number in an array. First take the first element as maximum, then compare every other element with it. If another element is greater, update maximum.'
  );
  const [language, setLanguage] = useState<SupportedLanguage>(
    validateSupportedLanguage(initialPreset?.language, 'python')
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    validateDifficultyLevel(initialPreset?.difficulty, 'Beginner')
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CodeGenResult | null>(initialResult || null);

  // Sync state when initialPreset or initialResult prop updates
  useEffect(() => {
    if (initialPreset) {
      setProblem(initialPreset.problem || '');
      setLogic(initialPreset.logic || '');
      setLanguage(validateSupportedLanguage(initialPreset.language, 'python'));
      setDifficulty(validateDifficultyLevel(initialPreset.difficulty, 'Beginner'));
      setError(null);
    } else if (initialPreset === null) {
      setProblem('');
      setLogic('');
      setLanguage('python');
      setDifficulty('Beginner');
      setError(null);
    }
  }, [initialPreset]);

  useEffect(() => {
    if (initialResult !== undefined) {
      setResult(initialResult);
    }
  }, [initialResult]);

  const handleGenerate = async () => {
    if (!logic.trim() && !problem.trim()) {
      setError('Please provide your problem statement or describe your algorithmic logic.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await generateCode({
        problem,
        logic,
        language,
        difficulty,
      });

      setResult(data);

      // Save to local history
      saveHistoryItem({
        type: 'generation',
        title: problem ? problem.slice(0, 50) : 'Logic to Code',
        language,
        problemStatement: problem,
        logic,
        code: data.code,
        result: data,
      });

      // Update global context for AI chat drawer
      onUpdateActiveContext({
        language,
        code: data.code,
        problem,
        logic,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate code. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (preset: PresetLogicExample) => {
    setProblem(preset.problem);
    setLogic(preset.logic);
    setLanguage(preset.language);
    setDifficulty(preset.difficulty);
    setError(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Logic to Code Generator</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Express your problem-solving approach in natural language, algorithm steps, or pseudocode.
          </p>
        </div>

        {/* Quick presets picker */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
            Quick Starters:
          </span>
          {PRESET_EXAMPLES.slice(0, 3).map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-800 whitespace-nowrap transition-colors"
            >
              {p.title}
            </button>
          ))}
          <button
            onClick={() => {
              setProblem('');
              setLogic('');
              setResult(null);
              setError(null);
            }}
            className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-800 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 flex items-start gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">Error Generating Code</p>
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

      {/* Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Logic & Problem Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-500" />
                <span>Describe Your Logic</span>
              </h2>
              <span className="text-[11px] text-slate-500">Natural language, pseudocode, or steps</span>
            </div>

            {/* Problem Statement (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Problem Statement (Optional)
              </label>
              <input
                type="text"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g. Find the maximum element in an array"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Logic / Algorithm textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Logic, Algorithm, or Approach <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={logic}
                onChange={(e) => setLogic(e.target.value)}
                rows={9}
                placeholder="Describe your problem, algorithm or logic here...&#10;&#10;Example:&#10;First take the first element as maximum, then compare every other element with it. If another element is greater, update maximum."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed transition-colors"
              />
            </div>

            {/* Language & Difficulty selectors */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
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
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="Beginner">Beginner (Simple syntax & comments)</option>
                  <option value="Intermediate">Intermediate (Idiomatic patterns)</option>
                  <option value="Advanced">Advanced (High-performance / OOP)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || (!logic.trim() && !problem.trim())}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Code from Logic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Code Viewer & AI Analysis */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Generated Code</span>
                {result && (
                  <span className="text-xs text-slate-500 font-normal font-mono">
                    · {result.algorithm}
                  </span>
                )}
              </h2>

              {result && (
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => onSendToExplainer(result.code, language)}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Explain</span>
                  </button>
                  <span className="text-slate-400">·</span>
                  <button
                    onClick={() => onSendToChecker(result.code, language)}
                    className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-medium cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Debug</span>
                  </button>
                  {onSendToTester && (
                    <>
                      <span className="text-slate-400">·</span>
                      <button
                        onClick={() => onSendToTester(result.code, language)}
                        className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline font-medium cursor-pointer"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Test Cases</span>
                      </button>
                    </>
                  )}
                  {onSendToDryRun && (
                    <>
                      <span className="text-slate-400">·</span>
                      <button
                        onClick={() => onSendToDryRun(result.code, language)}
                        className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline font-medium cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Dry Run</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Main Code Viewer Component */}
            <CodeViewer
              code={result ? result.code : ''}
              language={language}
              title={result ? `solution_${language}` : undefined}
              onRegenerate={result ? handleGenerate : undefined}
              onExplain={result ? () => onSendToExplainer(result.code, language) : undefined}
              onCheck={result ? () => onSendToChecker(result.code, language) : undefined}
              isLoading={isLoading}
              maxHeight="420px"
              placeholder="Your generated code will appear here once you describe your logic and click Generate Code."
            />

            {/* Detailed AI Structured Breakdown */}
            {result && (
              <div className="space-y-4 pt-2">
                {/* Structured Breakdown: Understanding, Algorithm, Pseudocode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      AI Understanding
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {result.understanding}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Identified Algorithm
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {result.algorithm}
                    </p>
                  </div>
                </div>

                {/* Structured Pseudocode */}
                {result.pseudocode && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Pseudocode
                    </span>
                    <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                      {result.pseudocode}
                    </pre>
                  </div>
                )}

                {/* Edge Cases */}
                {result.edgeCases && result.edgeCases.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                      Edge Cases Considered
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {result.edgeCases.map((ec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                          <span>{ec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Steps Checklist */}
                {result.keySteps && result.keySteps.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                      Key Implementation Steps
                    </span>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {result.keySteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sample Input/Output Example */}
                {result.example && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                      Sample Execution
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs mb-2">
                      <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase">Input</span>
                        <span className="text-slate-800 dark:text-slate-200">{result.example.input}</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase">Output</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {result.example.output}
                        </span>
                      </div>
                    </div>
                    {result.example.explanation && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {result.example.explanation}
                      </p>
                    )}
                  </div>
                )}

                {/* Complexity Footer Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                        Time Complexity
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                        {result.timeComplexity}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                        Space Complexity
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                        {result.spaceComplexity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
