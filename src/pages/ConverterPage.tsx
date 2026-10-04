import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  RotateCw,
  AlertCircle,
  FileCode,
  BookOpen,
  CheckCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage, CodeConvertResult } from '../types';
import { convertCode } from '../services/api';
import { saveHistoryItem } from '../services/storage';
import { validateSupportedLanguage } from '../services/aiValidators';
import { CodeViewer } from '../components/CodeViewer';

interface ConverterPageProps {
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  initialTargetLanguage?: SupportedLanguage;
  initialResult?: CodeConvertResult | null;
  onSendToExplainer: (code: string, language: SupportedLanguage) => void;
  onUpdateActiveContext: (ctx: {
    language?: SupportedLanguage;
    code?: string;
  }) => void;
}

const SAMPLE_PYTHON_CODE = `def two_sum(nums, target):
    # Store seen numbers and their indices in hash map
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`;

const LANGUAGES: Array<{ id: SupportedLanguage; label: string }> = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'cpp', label: 'C++' },
  { id: 'c', label: 'C' },
  { id: 'java', label: 'Java' },
];

export const ConverterPage: React.FC<ConverterPageProps> = ({
  initialCode = '',
  initialLanguage = 'python',
  initialTargetLanguage = 'cpp',
  initialResult,
  onSendToExplainer,
  onUpdateActiveContext,
}) => {
  const [sourceCode, setSourceCode] = useState(initialCode !== undefined ? initialCode : SAMPLE_PYTHON_CODE);
  const [sourceLanguage, setSourceLanguage] = useState<SupportedLanguage>(
    validateSupportedLanguage(initialLanguage, 'python')
  );
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>(
    validateSupportedLanguage(initialTargetLanguage, 'cpp')
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CodeConvertResult | null>(initialResult || null);

  useEffect(() => {
    if (initialCode !== undefined) setSourceCode(initialCode);
    setSourceLanguage(validateSupportedLanguage(initialLanguage, 'python'));
    setTargetLanguage(validateSupportedLanguage(initialTargetLanguage, 'cpp'));
    if (initialResult !== undefined) setResult(initialResult);
  }, [initialCode, initialLanguage, initialTargetLanguage, initialResult]);

  const handleConvert = async () => {
    if (!sourceCode.trim()) {
      setError('Please provide code to convert.');
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setError('Source and target languages must be different.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await convertCode({
        code: sourceCode,
        sourceLanguage,
        targetLanguage,
      });

      setResult(data);

      saveHistoryItem({
        type: 'convert',
        title: `Convert: ${sourceLanguage.toUpperCase()} → ${targetLanguage.toUpperCase()}`,
        language: targetLanguage,
        code: data.convertedCode,
        result: data,
      });

      onUpdateActiveContext({
        language: targetLanguage,
        code: data.convertedCode,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong while converting code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    if (result?.convertedCode) {
      setSourceCode(result.convertedCode);
      setResult(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-indigo-500" />
            <span>Code Converter</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Translate code between Python, C, C++, Java, and JavaScript side-by-side with idiomatic memory, typing, and standard library differences explained.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              setSourceCode(SAMPLE_PYTHON_CODE);
              setSourceLanguage('python');
              setTargetLanguage('cpp');
              setError(null);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Load Python → C++ Example
          </button>
          <button
            onClick={() => {
              setSourceCode('');
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
            <p className="font-semibold">Conversion Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            onClick={handleConvert}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 hover:bg-rose-300"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Language Selector Controls */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Source Language:
            </label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value as SupportedLanguage)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-medium focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwapLanguages}
            className="mt-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title="Swap source and target languages"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Target Language:
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as SupportedLanguage)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-medium focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleConvert}
          disabled={isLoading || !sourceCode.trim() || sourceLanguage === targetLanguage}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Translating & Idiomatizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Convert Code</span>
            </>
          )}
        </button>
      </div>

      {/* Side by Side Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Source Code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              <span>Original ({sourceLanguage.toUpperCase()})</span>
            </span>
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-slate-950 text-slate-100 overflow-hidden shadow-md">
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              rows={14}
              placeholder="Paste original source code..."
              className="w-full p-4 bg-transparent text-slate-200 font-mono text-xs sm:text-sm focus:outline-none leading-relaxed resize-y border-none"
            />
          </div>
        </div>

        {/* Converted Code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Converted ({targetLanguage.toUpperCase()})</span>
            </span>

            {result && (
              <button
                onClick={() => onSendToExplainer(result.convertedCode, targetLanguage)}
                className="text-xs text-blue-500 hover:underline font-medium"
              >
                Explain Converted Code
              </button>
            )}
          </div>

          <CodeViewer
            code={result ? result.convertedCode : ''}
            language={targetLanguage}
            title={`converted_${targetLanguage}`}
            onExplain={result ? () => onSendToExplainer(result.convertedCode, targetLanguage) : undefined}
            maxHeight="380px"
            placeholder="Click 'Convert Code' above to generate translated code."
          />
        </div>
      </div>

      {/* Language Differences & Idioms Breakdown */}
      {result && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Differences */}
            {result.keyDifferences && result.keyDifferences.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Key Language Differences
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {result.keyDifferences.map((diff, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{diff}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Language-Specific Idioms */}
            {result.languageSpecificNotes && result.languageSpecificNotes.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Idiomatic {targetLanguage.toUpperCase()} Best Practices
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {result.languageSpecificNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
