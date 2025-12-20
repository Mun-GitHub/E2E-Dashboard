import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import type { HistoricalRun } from '../types';
import { formatDurationSeconds } from '../utils/formatters';

interface PerformanceHistoryProps {
  historicalRuns: HistoricalRun[];
}

type ViewMode = 'weekly' | 'monthly' | 'quarterly';

export function PerformanceHistory({ historicalRuns }: PerformanceHistoryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  const weeklyData = useMemo(() => {
    // Group runs by week and calculate metrics
    const weeks: Record<string, {
      weekStarting: string;
      runs: HistoricalRun[];
      passRate: number;
      avgDuration: number;
      totalTests: number;
      flakyTests: number;
      coverage: number;
    }> = {};

    historicalRuns.forEach(run => {
      const date = new Date(run.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);

      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          weekStarting: weekKey,
          runs: [],
          passRate: 0,
          avgDuration: 0,
          totalTests: 0,
          flakyTests: 0,
          coverage: 83.3, // Simulated coverage
        };
      }
      weeks[weekKey].runs.push(run);
    });

    // Calculate averages for each week
    Object.values(weeks).forEach(week => {
      const totalPassed = week.runs.reduce((acc, r) => acc + r.passed, 0);
      const totalTests = week.runs.reduce((acc, r) => acc + r.totalTests, 0);
      const totalDuration = week.runs.reduce((acc, r) => acc + r.duration, 0);
      const totalFlaky = week.runs.reduce((acc, r) => acc + r.flaky, 0);

      week.passRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100 * 10) / 10 : 0;
      week.avgDuration = week.runs.length > 0 ? Math.round(totalDuration / week.runs.length) : 0;
      week.totalTests = totalTests;
      week.flakyTests = totalFlaky;
    });

    return Object.values(weeks).sort((a, b) => b.weekStarting.localeCompare(a.weekStarting));
  }, [historicalRuns]);

  const latestWeek = weeklyData[0];

  const trendData = useMemo(() => {
    return historicalRuns.slice(-10).map((run, idx) => ({
      name: `W${idx + 40}`,
      passRate: run.passRate,
      duration: Math.round(run.duration / 60),
      coverage: 80 + Math.random() * 10,
      flakiness: run.flaky,
    }));
  }, [historicalRuns]);

  const getStatusLabel = (passRate: number) => {
    if (passRate >= 97) return 'Stable';
    if (passRate >= 95) return 'Below Target';
    if (passRate >= 90) return 'Elevated Flakiness';
    return 'High Flakiness';
  };

  const getStatusColor = (passRate: number) => {
    if (passRate >= 97) return 'text-cyan-400';
    if (passRate >= 95) return 'text-yellow-400';
    if (passRate >= 90) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Performance History</h1>
          <p className="text-[#a1a1aa]">
            Historical E2E testing reports and performance metrics across different time periods
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-[#1a1a1f] p-1">
            {(['weekly', 'monthly', 'quarterly'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all flex items-center gap-2 ${
                  viewMode === mode
                    ? 'bg-[#27272a] text-white'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                <Calendar size={14} />
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1f] text-white hover:bg-[#27272a] transition-colors">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Latest Week Summary */}
      {latestWeek && (
        <div className="card bg-gradient-to-br from-[#18181b] to-[#1a1a1f]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-400" />
                Latest Week Strategic Summary
              </h3>
              <p className="text-sm text-[#71717a] mt-1">Week-over-Week wins:</p>
            </div>
            <span className="text-sm text-[#71717a]">Week of {latestWeek.weekStarting}</span>
          </div>

          <ul className="space-y-2 mb-6">
            <li className="text-sm text-[#a1a1aa] flex items-start gap-2">
              <span className="text-green-400">•</span>
              Pass rate at {latestWeek.passRate}%, exceeding the performance target.
            </li>
            <li className="text-sm text-[#a1a1aa] flex items-start gap-2">
              <span className="text-green-400">•</span>
              High test reliability enables faster deployment cycles.
            </li>
          </ul>

          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[#27272a]">
            <div className="p-3 rounded-lg bg-[#0d0d0f]">
              <span className="text-xs text-[#71717a] block mb-1">Current Status</span>
              <span className={`text-lg font-semibold ${getStatusColor(latestWeek.passRate)}`}>
                {getStatusLabel(latestWeek.passRate)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#0d0d0f]">
              <span className="text-xs text-[#71717a] block mb-1">Pass Rate (%)</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">{latestWeek.passRate}%</span>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <TrendingUp size={12} />
                  +2.5%
                </span>
              </div>
              <span className="text-xs text-green-400">↑ 5% pts vs 4-wk avg</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0d0d0f]">
              <span className="text-xs text-[#71717a] block mb-1">Average Test Duration</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">{formatDurationSeconds(latestWeek.avgDuration)}</span>
                <span className="text-xs text-red-400 flex items-center gap-1">
                  <TrendingUp size={12} />
                  +1.5%
                </span>
              </div>
              <span className="text-xs text-red-400">↑ 1.5% vs 4-wk avg</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0d0d0f]">
              <span className="text-xs text-[#71717a] block mb-1">Automation Coverage</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">{latestWeek.coverage}%</span>
              </div>
              <span className="text-xs text-[#71717a]">(68/71)</span>
            </div>
          </div>
        </div>
      )}

      {/* Trend Overview */}
      <div className="card">
        <h3 className="text-base font-medium text-white mb-4">3-week trend overview</h3>
        <div className="grid grid-cols-4 gap-6">
          {/* Pass Rate Trend */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#a1a1aa]">Pass Rate</span>
              <span className="text-xs text-red-400 flex items-center gap-1">
                <TrendingDown size={12} />
                -1.8%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={trendData}>
                <Line
                  type="monotone"
                  dataKey="passRate"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Duration Trend */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#a1a1aa]">Duration</span>
              <span className="text-xs text-red-400 flex items-center gap-1">
                <TrendingDown size={12} />
                -3.2%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={trendData}>
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Coverage Trend */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#a1a1aa]">Coverage</span>
              <span className="text-xs text-[#71717a]">—</span>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={trendData}>
                <Line
                  type="monotone"
                  dataKey="coverage"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Flakiness Trend */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#a1a1aa]">Flakiness</span>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingDown size={12} />
                -28.6%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={trendData}>
                <Line
                  type="monotone"
                  dataKey="flakiness"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly Performance History Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a]">
          <h3 className="text-base font-medium text-white">Weekly Performance History</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#71717a]">View:</span>
            <button className="px-2 py-1 text-sm bg-[#27272a] text-white rounded">Basic</button>
            <button className="px-2 py-1 text-sm text-[#a1a1aa] hover:text-white">Trend</button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-[#0d0d0f]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[#71717a]">Week Starting</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#71717a]">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#71717a]">Pass Rate</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#71717a]">Avg Duration</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#71717a]">Test Efficiency</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#71717a]">Flaky Tests</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#71717a]">Coverage</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#71717a]"></th>
            </tr>
          </thead>
          <tbody>
            {weeklyData.slice(0, 15).map((week, idx) => (
              <tr key={week.weekStarting} className="border-t border-[#27272a] hover:bg-[#1a1a1f]">
                <td className="px-4 py-3">
                  <span className="text-sm text-white">{week.weekStarting}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm ${getStatusColor(week.passRate)}`}>
                    {getStatusLabel(week.passRate)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-sm text-white">{week.passRate}%</span>
                    <span className={`text-xs ml-2 ${idx > 0 ? (week.passRate > weeklyData[idx - 1].passRate ? 'text-green-400' : 'text-red-400') : 'text-[#71717a]'}`}>
                      {idx > 0 ? `${week.passRate > weeklyData[idx - 1].passRate ? '+' : ''}${(week.passRate - weeklyData[idx - 1].passRate).toFixed(1)}%` : '—'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-sm text-white">{formatDurationSeconds(week.avgDuration)}</span>
                    <span className="text-xs text-[#71717a] ml-2">5 runs</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white">{Math.round(week.totalTests / Math.max(week.runs.length, 1))} tests/hour</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <span className="text-xs text-orange-400">{week.flakyTests}</span>
                    </div>
                    <span className="text-xs text-[#71717a]">({Math.round((week.flakyTests / Math.max(week.totalTests, 1)) * 100)}%)</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-sm text-white">{week.coverage}%</span>
                    <span className="text-xs text-[#71717a] ml-1">(68/71)</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    <ExternalLink size={14} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

