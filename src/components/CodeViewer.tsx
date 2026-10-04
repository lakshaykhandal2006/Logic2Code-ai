import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  RotateCw,
  BookOpen,
  CheckSquare,
  Trash2,
  WrapText,
  Edit3,
  Eye,
  FileCode,
} from 'lucide-react';
import { SupportedLanguage } from '../types';

export interface CodeViewerProps {
  code: string;
  language: SupportedLanguage;
  title?: string;
  editable?: boolean;
  onChange?: (val: string) => void;
  onClear?: () => void;
  onRegenerate?: () => void;
  onExplain?: () => void;
  onCheck?: () => void;
  isLoading?: boolean;
  maxHeight?: string;
  placeholder?: string;
}

const EXTENSIONS: Record<SupportedLanguage, string> = {
  python: 'py',
  c: 'c',
  cpp: 'cpp',
  java: 'java',
  javascript: 'js',
};

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  python: 'Python',
  c: 'C',
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript',
};

// Lightweight syntax token colorizer for code display
function renderSyntaxTokens(line: string): React.ReactNode {
  const trimmed = line.trim();
  if (
    trimmed.startsWith('//') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*')
  ) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  // Regex splitting by strings, keywords, literals, and numbers
  const tokenRegex =
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:def|class|function|return|if|else|elif|while|for|in|import|from|try|except|catch|finally|const|let|var|public|private|protected|static|void|int|float|double|char|bool|boolean|switch|case|break|continue|new|this|typeof|interface|struct)\b|\b(?:true|false|True|False|null|None|nullptr|undefined)\b|\b\d+(?:\.\d+)?\b)/g;

  const parts = line.split(tokenRegex);
  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // String literal
        if (
          (part.startsWith('"') && part.endsWith('"')) ||
          (part.startsWith("'") && part.endsWith("'"))
        ) {
          return (
            <span key={index} className="text-emerald-400">
              {part}
            </span>
          );
        }

        // Keywords
        if (
          /^(def|class|function|return|if|else|elif|while|for|in|import|from|try|except|catch|finally|const|let|var|public|private|protected|static|void|int|float|double|char|bool|boolean|switch|case|break|continue|new|this|typeof|interface|struct)$/.test(
            part
          )
        ) {
          return (
            <span key={index} className="text-indigo-400 font-semibold">
              {part}
            </span>
          );
        }

        // Boolean & Null literals
        if (/^(true|false|True|False|null|None|nullptr|undefined)$/.test(part)) {
          return (
            <span key={index} className="text-amber-400 font-medium">
              {part}
            </span>
          );
        }

        // Number literal
        if (/^\d+(\.\d+)?$/.test(part)) {
          return (
            <span key={index} className="text-cyan-400">
              {part}
            </span>
          );
        }

        // Default text / symbols
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language,
  title,
  editable = false,
  onChange,
  onClear,
  onRegenerate,
  onExplain,
  onCheck,
  isLoading = false,
  maxHeight = '500px',
  placeholder = 'Paste or write your code here...',
}) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [isWordWrap, setIsWordWrap] = useState(false);
  const [isEditMode, setIsEditMode] = useState(editable);

  React.useEffect(() => {
    setIsEditMode(editable);
  }, [editable]);

  const handleCopy = async () => {
    if (!code) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy code', e);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2500);
    }
  };

  const handleDownload = () => {
    if (!code) return;
    const ext = EXTENSIONS[language] || 'txt';
    const filename = `solution_${Date.now()}.${ext}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = code ? code.split('\n') : [''];

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950 text-slate-100 overflow-hidden shadow-md flex flex-col">
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          {/* Terminal control dots */}
          <div className="hidden sm:flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <span className="text-xs font-mono font-medium text-slate-300 truncate max-w-[140px] sm:max-w-none">
            {title || `solution.${EXTENSIONS[language] || 'txt'}`}
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 shrink-0">
            {LANGUAGE_LABELS[language] || language}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap">
          {onChange && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                isEditMode
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
              }`}
              title={isEditMode ? 'Switch to highlight preview' : 'Edit code directly'}
            >
              {isEditMode ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isEditMode ? 'Preview' : 'Edit'}</span>
            </button>
          )}

          <button
            onClick={() => setIsWordWrap(!isWordWrap)}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
              isWordWrap
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
            }`}
            title="Toggle word wrap"
          >
            <WrapText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isWordWrap ? 'Wrapped' : 'Wrap'}</span>
          </button>

          {onExplain && (
            <button
              onClick={onExplain}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
              title="Explain this code in detail"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Explain</span>
            </button>
          )}

          {onCheck && (
            <button
              onClick={onCheck}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
              title="Check this code for bugs and edge cases"
            >
              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Check</span>
            </button>
          )}

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors disabled:opacity-50 cursor-pointer"
              title="Regenerate code"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}

          {onClear && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-300 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
              title="Clear code"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            disabled={!code}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors disabled:opacity-40 cursor-pointer ${
              copyError
                ? 'bg-rose-900/60 text-rose-300'
                : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
            }`}
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : copyError ? (
              <>
                <span className="text-rose-400">Copy Failed</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={!code}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors disabled:opacity-40 cursor-pointer"
            title="Download source file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isEditMode ? (
        <div className="relative font-mono text-xs sm:text-sm bg-slate-950 flex flex-1">
          <textarea
            value={code}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            style={{ minHeight: '280px', maxHeight }}
            className={`w-full p-4 bg-transparent text-slate-200 placeholder-slate-600 font-mono resize-y focus:outline-none leading-relaxed border-none selection:bg-emerald-900/60 ${
              isWordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
            }`}
          />
        </div>
      ) : (
        <div
          className="relative font-mono text-xs sm:text-sm bg-slate-950 overflow-auto scrollbar-thin scrollbar-thumb-slate-800"
          style={{ maxHeight }}
        >
          {code ? (
            <div className="flex min-w-full">
              {/* Line Numbers */}
              <div
                className="select-none py-4 px-2.5 sm:px-3 text-right text-slate-600 bg-slate-900/40 border-r border-slate-800/80 font-mono text-xs shrink-0"
                style={{ minWidth: '3.2rem' }}
                aria-hidden="true"
              >
                {lines.map((_, i) => (
                  <div key={i} className="leading-6 tabular-nums">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Code lines */}
              <div
                className={`py-4 px-4 flex-1 text-slate-200 leading-6 font-mono ${
                  isWordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
                }`}
              >
                {lines.map((line, i) => (
                  <div key={i} className="leading-6">
                    {renderSyntaxTokens(line) || ' '}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-500 font-mono text-xs flex flex-col items-center justify-center gap-2">
              <FileCode className="w-8 h-8 text-slate-700" />
              <span>No code generated yet. Enter your logic and click &quot;Generate Code&quot;.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
