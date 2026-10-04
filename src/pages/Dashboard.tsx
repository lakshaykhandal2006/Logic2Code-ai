import React from 'react';
import {
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
  ArrowRight,
  Sparkles,
  History as HistoryIcon,
} from 'lucide-react';
import { PRESET_EXAMPLES } from '../services/storage';
import { PresetLogicExample, HistoryItem } from '../types';

export type NavigationTab =
  | 'dashboard'
  | 'generate'
  | 'debug'
  | 'explain'
  | 'optimize'
  | 'test'
  | 'validate'
  | 'logic-vs-code'
  | 'practice'
  | 'convert'
  | 'dry-run'
  | 'combined'
  | 'history';

interface DashboardProps {
  onNavigate: (tab: NavigationTab) => void;
  onSelectPreset: (preset: PresetLogicExample) => void;
  recentHistory: HistoryItem[];
  onOpenHistoryItem: (item: HistoryItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onSelectPreset,
  recentHistory,
  onOpenHistoryItem,
}) => {
  const coreModes = [
    {
      id: 'generate' as NavigationTab,
      icon: Code2,
      emoji: '🧠',
      title: 'Logic → Code',
      badge: 'Algorithm to Code',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      description:
        'Convert natural language, algorithms, or pseudocode into clean, commented, working code with complexity and edge cases.',
      actionText: 'Generate Code',
      hoverBorder: 'hover:border-emerald-500/60',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500',
    },
    {
      id: 'debug' as NavigationTab,
      icon: Bug,
      emoji: '🐛',
      title: 'Debug My Code',
      badge: 'Error Hunter',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      description:
        'Find syntax bugs, off-by-one errors, infinite loops, and edge case crashes. Explains why it happened and how to fix it.',
      actionText: 'Debug Code',
      hoverBorder: 'hover:border-rose-500/60',
      btnBg: 'bg-rose-600 hover:bg-rose-500',
    },
    {
      id: 'explain' as NavigationTab,
      icon: BookOpen,
      emoji: '📖',
      title: 'Explain My Code',
      badge: 'Mentor Breakdown',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      description:
        'Line-by-line breakdowns, variable trackers, function responsibilities, and dry runs in Beginner, Intermediate, or Advanced mode.',
      actionText: 'Explain Code',
      hoverBorder: 'hover:border-blue-500/60',
      btnBg: 'bg-blue-600 hover:bg-blue-500',
    },
    {
      id: 'optimize' as NavigationTab,
      icon: Zap,
      emoji: '⚡',
      title: 'Optimize My Code',
      badge: 'Performance Boost',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      description:
        'Identify algorithmic bottlenecks, nested loops, and suboptimal data structures. Compare Big-O speedups side-by-side.',
      actionText: 'Optimize Code',
      hoverBorder: 'hover:border-amber-500/60',
      btnBg: 'bg-amber-600 hover:bg-amber-500',
    },
    {
      id: 'test' as NavigationTab,
      icon: FlaskConical,
      emoji: '🧪',
      title: 'Test My Code',
      badge: 'Test Suite Suite',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      description:
        'Synthesize normal, boundary, edge case, and invalid test cases in structured tabular format through static code analysis.',
      actionText: 'Generate Tests',
      hoverBorder: 'hover:border-purple-500/60',
      btnBg: 'bg-purple-600 hover:bg-purple-500',
    },
    {
      id: 'validate' as NavigationTab,
      icon: Lightbulb,
      emoji: '💡',
      title: 'Validate My Logic',
      badge: 'Pre-Code Audit',
      badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      description:
        'Verify your reasoning before writing code. Identifies implicit assumptions and concrete counterexamples if logic is flawed.',
      actionText: 'Validate Logic',
      hoverBorder: 'hover:border-yellow-500/60',
      btnBg: 'bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold',
    },
    {
      id: 'practice' as NavigationTab,
      icon: Target,
      emoji: '🎯',
      title: 'Practice Mode',
      badge: 'Interactive Coach',
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      description:
        'Sharpen skills on Arrays, Strings, Recursion, or DP. Formulate logic first with progressive hints before viewing the solution.',
      actionText: 'Start Practicing',
      hoverBorder: 'hover:border-teal-500/60',
      btnBg: 'bg-teal-600 hover:bg-teal-500',
    },
    {
      id: 'convert' as NavigationTab,
      icon: ArrowLeftRight,
      emoji: '🔄',
      title: 'Convert Code',
      badge: 'Polyglot Translator',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      description:
        'Translate code between Python, C, C++, Java, and JavaScript side-by-side with language-specific idioms explained.',
      actionText: 'Convert Code',
      hoverBorder: 'hover:border-indigo-500/60',
      btnBg: 'bg-indigo-600 hover:bg-indigo-500',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-slate-100 p-8 sm:p-12 shadow-xl">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Coding Assistant + Programming Mentor + Learning Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Logic2Code AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Think. Code. Debug. Understand.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
            Understand the logic of a problem, but struggle with syntax? Turn plain English algorithms into working code, debug faulty scripts, simulate dry runs, and master computer science fundamentals.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('generate')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
            >
              <span>🧠 Logic → Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('debug')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-colors cursor-pointer"
            >
              <Bug className="w-4 h-4 text-rose-400" />
              <span>Debug My Code</span>
            </button>

            <button
              onClick={() => onNavigate('practice')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-colors cursor-pointer"
            >
              <Target className="w-4 h-4 text-teal-400" />
              <span>Practice Mode</span>
            </button>

            <button
              onClick={() => onNavigate('dry-run')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-cyan-300 text-sm font-medium transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-cyan-400/40" />
              <span>Run Dry Run</span>
            </button>
          </div>
        </div>
      </section>

      {/* Logic2Code 8-Step Learning Workflow */}
      <section className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Recommended Engineering Pipeline</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              The 8-Step Logic2Code Learning Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Master algorithm design step-by-step. Click any phase to immediately jump into that tool.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden lg:inline">
            8 Interactive Steps
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            {
              step: 1,
              title: 'Understand Problem',
              desc: 'Deconstruct requirements, constraints, and edge examples.',
              tab: 'practice' as NavigationTab,
              badge: 'Stage 1',
              color: 'border-blue-500/30 hover:border-blue-500 bg-blue-500/5',
              numBg: 'bg-blue-600 text-white',
            },
            {
              step: 2,
              title: 'Write Logic',
              desc: 'Formulate plain-English algorithm & step-by-step pseudocode.',
              tab: 'generate' as NavigationTab,
              badge: 'Stage 2',
              color: 'border-teal-500/30 hover:border-teal-500 bg-teal-500/5',
              numBg: 'bg-teal-600 text-white',
            },
            {
              step: 3,
              title: 'Validate Logic',
              desc: 'Catch flawed assumptions & counterexamples before writing code.',
              tab: 'validate' as NavigationTab,
              badge: 'Stage 3',
              color: 'border-yellow-500/30 hover:border-yellow-500 bg-yellow-500/5',
              numBg: 'bg-yellow-600 text-white',
            },
            {
              step: 4,
              title: 'Generate Code',
              desc: 'Transform verified logic into production code in Python, C++, etc.',
              tab: 'generate' as NavigationTab,
              badge: 'Stage 4',
              color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5',
              numBg: 'bg-emerald-600 text-white',
            },
            {
              step: 5,
              title: 'Test Code',
              desc: 'Synthesize normal, boundary, edge case, and invalid test suites.',
              tab: 'test' as NavigationTab,
              badge: 'Stage 5',
              color: 'border-purple-500/30 hover:border-purple-500 bg-purple-500/5',
              numBg: 'bg-purple-600 text-white',
            },
            {
              step: 6,
              title: 'Debug Code',
              desc: 'Diagnose runtime flaws, logic bugs, and off-by-one conditions.',
              tab: 'debug' as NavigationTab,
              badge: 'Stage 6',
              color: 'border-rose-500/30 hover:border-rose-500 bg-rose-500/5',
              numBg: 'bg-rose-600 text-white',
            },
            {
              step: 7,
              title: 'Optimize Code',
              desc: 'Analyze bottlenecks, reduce Big-O time and auxiliary memory.',
              tab: 'optimize' as NavigationTab,
              badge: 'Stage 7',
              color: 'border-amber-500/30 hover:border-amber-500 bg-amber-500/5',
              numBg: 'bg-amber-600 text-white',
            },
            {
              step: 8,
              title: 'Understand Code',
              desc: 'Deep-dive line-by-line, track variables, and step dry-runs.',
              tab: 'explain' as NavigationTab,
              badge: 'Stage 8',
              color: 'border-cyan-500/30 hover:border-cyan-500 bg-cyan-500/5',
              numBg: 'bg-cyan-600 text-white',
            },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => onNavigate(item.tab)}
              className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between group cursor-pointer ${item.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center font-mono ${item.numBg}`}>
                      {item.step}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                      {item.badge}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h4>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {item.desc}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/60 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>Open Tool</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* What Do You Want To Do? (8 Core Mode Cards) */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              What do you want to do?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Select your programming mode from code synthesis to bug diagnosis and practice drills.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className={`flex flex-col justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all ${mode.hoverBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl" role="img" aria-label={mode.title}>
                      {mode.emoji}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${mode.badgeColor}`}
                    >
                      {mode.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {mode.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[54px]">
                    {mode.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onNavigate(mode.id)}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg text-white transition-colors cursor-pointer ${mode.btnBg}`}
                  >
                    <span>{mode.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Special Workflows: Dry Run & Logic vs Code Checker */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Card 1: Run Dry Run */}
        <div className="p-5 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 to-slate-900/40 dark:bg-slate-900/60 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 fill-cyan-400/30" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Run Dry Run</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400">Interactive</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm">
                Supply your test input and visualize variable changes, loop iterations, and recursive call frames step-by-step.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('dry-run')}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
          >
            Launch Dry Run
          </button>
        </div>

        {/* Quick Card 2: Logic vs Code Checker */}
        <div className="p-5 rounded-xl border border-teal-500/20 bg-gradient-to-r from-teal-950/20 to-slate-900/40 dark:bg-slate-900/60 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Does My Code Follow My Logic?</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-400">Alignment</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm">
                Check whether your written code faithfully implements your intended algorithmic strategy or diverges unexpectedly.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('logic-vs-code')}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
          >
            Check Alignment
          </button>
        </div>
      </section>

      {/* Preset Starters Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Instant Test Drive: Sample Algorithms</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Click any algorithmic approach below to automatically load it into the Code Generator.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_EXAMPLES.map((preset, index) => (
            <button
              type="button"
              key={index}
              onClick={() => onSelectPreset(preset)}
              className="text-left group cursor-pointer p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {preset.title}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                    {preset.language}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Load in Generator</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent History Quick Access */}
      {recentHistory.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-slate-500" />
              <span>Recent Sessions</span>
            </h2>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              View All History ({recentHistory.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentHistory.slice(0, 3).map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => onOpenHistoryItem(item)}
                className="text-left w-full cursor-pointer p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-colors flex items-center justify-between"
              >
                <div className="truncate pr-2">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {item.type.toUpperCase()} · {item.language}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
