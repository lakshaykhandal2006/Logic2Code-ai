import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  RotateCw,
  AlertCircle,
  FileCode,
  Copy,
  Check,
  Info,
  BookOpen,
  Bug,
  Sparkles,
  ClipboardCopy,
} from 'lucide-react';
import { SupportedLanguage, CodeTestCasesResult, TestCaseItem } from '../types';
import { testCode } from '../services/api';
import { saveHistoryItem } from '../services/storage';
import { validateSupportedLanguage } from '../services/aiValidators';

interface TesterPageProps {
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  initialResult?: CodeTestCasesResult | null;
  initialExpectedBehavior?: string;
  onSendToExplainer?: (code: string, language: SupportedLanguage) => void;
  onSendToDebug?: (code: string, language: SupportedLanguage) => void;
  onUpdateActiveContext: (ctx: {
    language?: SupportedLanguage;
    code?: string;
    problem?: string;
    logic?: string;
  }) => void;
}

const SAMPLE_CODE_FOR_TESTS = `def is_palindrome(s):
    # Check if a string is a palindrome ignoring non-alphanumeric chars
    cleaned = [c.lower() for c in s if c.isalnum()]
    return cleaned == cleaned[::-1]`;

export const TesterPage: React.FC<TesterPageProps> = ({
  initialCode = '',
  initialLanguage = 'python',
  initialResult,
  initialExpectedBehavior = '',
  onSendToExplainer,
  onSendToDebug,
  onUpdateActiveContext,
}) => {
  const [code, setCode] = useState(initialCode !== undefined ? initialCode : SAMPLE_CODE_FOR_TESTS);
  const [language, setLanguage] = useState<SupportedLanguage>(
    validateSupportedLanguage(initialLanguage, 'python')
  );
  const [expectedBehavior, setExpectedBehavior] = useState(initialExpectedBehavior);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CodeTestCasesResult | null>(initialResult || null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copyErrorInputId, setCopyErrorInputId] = useState<number | null>(null);
  const [copiedRowId, setCopiedRowId] = useState<number | null>(null);
  const [copyErrorRowId, setCopyErrorRowId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copyAllError, setCopyAllError] = useState(false);

  useEffect(() => {
    if (initialCode !== undefined) setCode(initialCode);
    setLanguage(validateSupportedLanguage(initialLanguage, 'python'));
    if (initialExpectedBehavior !== undefined) setExpectedBehavior(initialExpectedBehavior);
    if (initialResult !== undefined) setResult(initialResult);
  }, [initialCode, initialLanguage, initialExpectedBehavior, initialResult]);

  const handleGenerateTests = async () => {
    if (!code.trim()) {
      setError('Please provide code to generate test cases for.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await testCode({
        code,
        language,
        expectedBehavior: expectedBehavior.trim() || undefined,
      });

      setResult(data);

      saveHistoryItem({
        type: 'test',
        title: expectedBehavior ? `Tests: ${expectedBehavior.slice(0, 45)}` : `Test Cases (${language})`,
        language,
        code,
        result: data,
      });

      onUpdateActiveContext({
        language,
        code,
        problem: expectedBehavior || data.summary,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong while generating test cases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const safeWriteText = async (text: string): Promise<boolean> => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  };

  const handleCopyInput = async (id: number, text: string) => {
    const ok = await safeWriteText(text);
    if (ok) {
      setCopiedId(id);
      setCopyErrorInputId(null);
      setTimeout(() => setCopiedId(null), 1800);
    } else {
      setCopyErrorInputId(id);
      setTimeout(() => setCopyErrorInputId(null), 2500);
    }
  };

  const handleCopyTestCase = async (tc: TestCaseItem) => {
    const formatted = `Test Case #${tc.id} [${tc.type}]\nInput: ${tc.input}\nExpected Output: ${tc.expectedOutput}\nPurpose: ${tc.purpose}`;
    const ok = await safeWriteText(formatted);
    if (ok) {
      setCopiedRowId(tc.id);
      setCopyErrorRowId(null);
      setTimeout(() => setCopiedRowId(null), 1800);
    } else {
      setCopyErrorRowId(tc.id);
      setTimeout(() => setCopyErrorRowId(null), 2500);
    }
  };

  const handleCopyAllTestCases = async () => {
    if (!result || !result.testCases.length) return;
    const header = `| # | Type | Input | Expected Output | Purpose |\n|---|---|---|---|---|`;
    const rows = result.testCases
      .map((tc) => `| ${tc.id} | ${tc.type} | \`${tc.input.replace(/\|/g, '\\|')}\` | \`${tc.expectedOutput.replace(/\|/g, '\\|')}\` | ${tc.purpose.replace(/\|/g, '\\|')} |`)
      .join('\n');
    const tableText = `${header}\n${rows}\n\n*Note: These test cases are generated using AI-based static analysis. The code has not been executed.*`;
    const ok = await safeWriteText(tableText);
    if (ok) {
      setCopiedAll(true);
      setCopyAllError(false);
      setTimeout(() => setCopiedAll(false), 2000);
    } else {
      setCopyAllError(true);
      setTimeout(() => setCopyAllError(false), 2500);
    }
  };

  const getTypeBadgeClass = (type: TestCaseItem['type']) => {
    switch (type) {
      case 'Normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Boundary':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Edge Case':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Invalid':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-purple-500" />
            <span>Test My Code</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate normal, boundary, edge, and invalid test cases from static code analysis to test your functions thoroughly.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setCode(SAMPLE_CODE_FOR_TESTS);
              setLanguage('python');
              setExpectedBehavior('Valid palindrome check ignoring special characters');
              setError(null);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Load Palindrome Example
          </button>
          <button
            onClick={() => {
              setCode('');
              setExpectedBehavior('');
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
            <p className="font-semibold">Test Case Generation Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            onClick={handleGenerateTests}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 hover:bg-rose-300 cursor-pointer"
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
                <FileCode className="w-4 h-4 text-purple-500" />
                <span>Function or Script to Test</span>
              </h2>
              <span className="text-[11px] text-slate-500">Static test generation</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
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
                Expected Behavior / Requirements (Optional)
              </label>
              <input
                type="text"
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="e.g. Return True if string is palindrome, ignore spaces"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Source Code <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                placeholder="Paste the code you want to generate test cases for..."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono leading-relaxed transition-colors"
              />
            </div>

            <button
              onClick={handleGenerateTests}
              disabled={isLoading || !code.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Test Suite...</span>
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4" />
                  <span>Generate Test Cases</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Cross-Feature Actions */}
          {code.trim() && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
              <span className="text-slate-500">Also test code in:</span>
              <div className="flex items-center gap-3">
                {onSendToExplainer && (
                  <button
                    onClick={() => onSendToExplainer(code, language)}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Explain</span>
                  </button>
                )}
                {onSendToDebug && (
                  <button
                    onClick={() => onSendToDebug(code, language)}
                    className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Bug className="w-3.5 h-3.5" />
                    <span>Debug</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Test Cases Table */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Mandatory Transparency Notice (Phase 7 Distinction) */}
              <div className="p-3.5 rounded-xl border border-purple-300 dark:border-purple-800/80 bg-purple-50/70 dark:bg-purple-950/40 text-xs flex items-start gap-2.5 text-purple-900 dark:text-purple-200 shadow-xs">
                <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">AI Static Analysis Disclaimer</span>
                  <p className="text-purple-800 dark:text-purple-300 text-[11px] leading-relaxed">
                    These test cases are generated through AI-based analysis. The code has not been executed.
                  </p>
                </div>
              </div>

              {/* Summary */}
              {result.summary && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Testing Strategy
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              )}

              {/* Test Cases Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Generated Test Cases</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                      {result.testCases.length} Cases
                    </span>
                  </h3>

                  {/* Copy All Test Cases Button (Phase 8 Requirement) */}
                  <button
                    onClick={handleCopyAllTestCases}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                    title="Copy all test cases as Markdown table"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied All</span>
                      </>
                    ) : copyAllError ? (
                      <>
                        <span className="text-rose-500 font-semibold">Copy Failed</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="w-3.5 h-3.5" />
                        <span>Copy All Test Cases</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-mono text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Input</th>
                        <th className="py-2.5 px-3">Expected Output</th>
                        <th className="py-2.5 px-3">Purpose</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                      {result.testCases.map((tc) => (
                        <tr key={tc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3 font-mono text-xs text-slate-500 font-semibold align-top">
                            {tc.id}
                          </td>
                          <td className="py-3 px-3 align-top whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${getTypeBadgeClass(tc.type)}`}>
                              {tc.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 align-top font-mono text-xs text-slate-800 dark:text-slate-200">
                            <div className="flex items-center gap-1.5 group">
                              <span className="bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 break-all">
                                {tc.input}
                              </span>
                              <button
                                onClick={() => handleCopyInput(tc.id, tc.input)}
                                className="text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors p-1 shrink-0 cursor-pointer"
                                title="Copy input only"
                              >
                                {copiedId === tc.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : copyErrorInputId === tc.id ? (
                                  <span className="text-rose-400 text-[10px] font-bold">Failed</span>
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 align-top font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold whitespace-pre-wrap">
                            <span className="bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800">
                              {tc.expectedOutput}
                            </span>
                          </td>
                          <td className="py-3 px-3 align-top text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs">
                            {tc.purpose}
                          </td>
                          <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                            <button
                              onClick={() => handleCopyTestCase(tc)}
                              className="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/80 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                              title="Copy complete test case"
                            >
                              {copiedRowId === tc.id ? (
                                <span className="text-emerald-500 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Copied</span>
                                </span>
                              ) : copyErrorRowId === tc.id ? (
                                <span className="text-rose-400 font-bold">Failed</span>
                              ) : (
                                <span>Copy Case</span>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-500 text-xs sm:text-sm">
              <FlaskConical className="w-8 h-8 text-purple-500/60 mx-auto mb-3" />
              <p className="font-medium text-slate-800 dark:text-slate-200">Generate rigorous test suites</p>
              <p className="mt-1 max-w-sm mx-auto text-slate-500">
                Provide your code on the left to extract typical cases, zero-value conditions, boundary limits, and edge cases.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
