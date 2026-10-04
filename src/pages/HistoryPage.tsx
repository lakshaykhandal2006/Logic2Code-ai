import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ExternalLink,
  Code2,
  Bug,
  BookOpen,
  Zap,
  FlaskConical,
  Lightbulb,
  Target,
  ArrowLeftRight,
  Play,
  Scale,
  Download,
  ArrowRight,
} from 'lucide-react';
import { HistoryItem, HistoryType, SupportedLanguage } from '../types';
import { deleteHistoryItem, clearHistory } from '../services/storage';
import { CodeViewer } from '../components/CodeViewer';

interface HistoryPageProps {
  history: HistoryItem[];
  onRefresh: () => void;
  onOpenItem: (item: HistoryItem) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onRefresh,
  onOpenItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    if (previewItem?.id === id) {
      setPreviewItem(null);
    }
    onRefresh();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history records?')) {
      clearHistory();
      setPreviewItem(null);
      onRefresh();
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `logic2code_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.problemStatement && item.problemStatement.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.logic && item.logic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesLang = selectedLanguage === 'all' || item.language === selectedLanguage;

    return matchesSearch && matchesType && matchesLang;
  });

  const getTypeIcon = (type: HistoryType) => {
    switch (type) {
      case 'generation':
        return <Code2 className="w-4 h-4 text-emerald-500" />;
      case 'debug':
        return <Bug className="w-4 h-4 text-rose-500" />;
      case 'explanation':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'optimization':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'test':
        return <FlaskConical className="w-4 h-4 text-purple-500" />;
      case 'validation':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'logic-vs-code':
        return <Scale className="w-4 h-4 text-teal-500" />;
      case 'convert':
        return <ArrowLeftRight className="w-4 h-4 text-indigo-500" />;
      case 'dry-run':
        return <Play className="w-4 h-4 text-cyan-500 fill-cyan-500/30" />;
      case 'practice':
        return <Target className="w-4 h-4 text-teal-500" />;
      case 'combined':
      default:
        return <Scale className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-slate-500" />
            <span>Workspace History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, and reload previous generations, reviews, optimizations, test cases, and dry runs.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All</span>
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/80 rounded-lg border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history by problem title, keyword, or code..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
          >
            <option value="all">All Modes</option>
            <option value="generation">🧠 Logic → Code</option>
            <option value="debug">🐛 Debug</option>
            <option value="explanation">📖 Explain</option>
            <option value="optimization">⚡ Optimize</option>
            <option value="test">🧪 Test My Code</option>
            <option value="validation">💡 Validate Logic</option>
            <option value="logic-vs-code">🔍 Logic vs Code</option>
            <option value="convert">🔄 Convert Code</option>
            <option value="dry-run">🏃 Dry Run</option>
            <option value="practice">🎯 Practice</option>
            <option value="combined">⚖️ Triangulation</option>
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
          >
            <option value="all">All Languages</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout: History List & Detail Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* History List */}
        <div className={previewItem ? 'lg:col-span-5 space-y-2' : 'lg:col-span-12 space-y-2'}>
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-xs sm:text-sm">
              No sessions found matching your search. Try adjusting filters or generate some code!
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isSelected = previewItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => setPreviewItem(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPreviewItem(item);
                    }
                  }}
                  className={`cursor-pointer p-4 rounded-xl border transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                          <span className="uppercase font-semibold">{item.language}</span>
                          <span>·</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenItem(item);
                        }}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Load into workspace"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Delete from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Item Quick Inspection */}
        {previewItem && (
          <div className="lg:col-span-7 space-y-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-slate-500 uppercase">
                  {previewItem.type} · {previewItem.language}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {previewItem.title}
                </h3>
              </div>

              <button
                onClick={() => onOpenItem(previewItem)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
              >
                <span>Open in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {previewItem.logic && (
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Provided Logic:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  {previewItem.logic}
                </p>
              </div>
            )}

            {previewItem.code && (
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Source Code:
                </span>
                <CodeViewer
                  code={previewItem.code}
                  language={previewItem.language}
                  maxHeight="320px"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
