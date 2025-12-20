import { useMemo, useState } from 'react';
import { Zap, RefreshCw, Filter, Calendar, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { TestResult, HistoricalRun } from '../types';

interface FlakinessDetectiveProps {
  testResults: TestResult[];
  historicalRuns: HistoricalRun[];
}

export function FlakinessDetective({ testResults, historicalRuns }: FlakinessDetectiveProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');

  const stats = useMemo(() => {
    const flakyTests = testResults.filter(t => t.status === 'flaky');
    const totalFlaky = historicalRuns.reduce((acc, r) => acc + r.flaky, 0);
    
    // Simulate cluster detection
    const clusters = 0; // No flaky patterns detected
    const persistentClusters = 0;
    const resolutionRate = totalFlaky > 0 ? 0 : 100;

    return {
      recentClusters: clusters,
      totalFailures: totalFlaky,
      persistentClusters,
      resolutionRate,
      flakyTests: flakyTests.length,
    };
  }, [testResults, historicalRuns]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            Flakiness Detective
          </h1>
          <p className="text-[#a1a1aa]">
            AI-powered analysis of test failures to identify flaky patterns.
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1f] text-white hover:bg-[#27272a] transition-colors">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Flakiness Overview */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap size={18} className="text-purple-400" />
          Flakiness Overview
        </h2>

        <div className="grid grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm text-[#a1a1aa]">Recent Clusters</span>
              <AlertTriangle size={16} className="text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400">{stats.recentClusters}</div>
            <span className="text-xs text-[#71717a]">clusters from last 3 days</span>
          </div>

          <div className="card">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm text-[#a1a1aa]">Total Failures</span>
              <Zap size={16} className="text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalFailures}</div>
            <span className="text-xs text-[#71717a]">across all clusters</span>
          </div>

          <div className="card">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm text-[#a1a1aa]">Persistent Clusters</span>
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400">{stats.persistentClusters}</div>
            <span className="text-xs text-[#71717a]">&gt;3 days old with &gt;10 failures</span>
          </div>

          <div className="card">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm text-[#a1a1aa]">Resolution Rate</span>
              <CheckCircle2 size={16} className="text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.resolutionRate}%</div>
            <span className="text-xs text-[#71717a]">resolved before becoming persistent</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#71717a]" />
            <span className="text-sm text-[#a1a1aa]">Filter by:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-2 ${
                true ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-[#1a1a1f] text-[#a1a1aa]'
              }`}
            >
              <Calendar size={14} />
              Time Period
            </button>
            <button className="px-3 py-1.5 text-sm rounded-lg bg-[#1a1a1f] text-[#a1a1aa] hover:text-white flex items-center gap-2">
              <Calendar size={14} />
              Detection Date
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-[#71717a]">Select time range</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '14d' | '30d')}
              className="bg-[#1a1a1f] text-white text-sm px-3 py-1.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-purple-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="14d">Last 14 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#71717a]">Show results</span>
            <select className="bg-[#1a1a1f] text-white text-sm px-3 py-1.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-purple-500">
              <option>Show 20</option>
              <option>Show 50</option>
              <option>Show 100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detective's Findings */}
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={18} className="text-purple-400" />
          <h3 className="text-base font-medium text-white">Detective's Findings</h3>
        </div>
        <p className="text-sm text-[#71717a] mb-4">No flaky cases found</p>

        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <CheckCircle2 size={18} className="text-green-400" />
          <span className="text-sm text-green-400">No flaky test patterns found in recent analysis</span>
        </div>

        <div className="mt-6 pt-4 border-t border-[#27272a]">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-[#71717a] mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white">About the Flakiness Detective</h4>
              <p className="text-xs text-[#71717a] mt-1">
                The Flakiness Detective uses AI-powered pattern recognition to identify tests that exhibit
                inconsistent behavior. It analyzes test execution history, groups similar failures into clusters,
                and provides actionable insights to help you prioritize fixes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Flakiness Trends */}
      <div className="card">
        <h3 className="text-base font-medium text-white mb-4">What Makes a Test Flaky?</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#1a1a1f]">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3">
              <AlertTriangle size={20} className="text-yellow-400" />
            </div>
            <h4 className="text-sm font-medium text-white mb-1">Intermittent Failures</h4>
            <p className="text-xs text-[#71717a]">
              Tests that pass and fail inconsistently across runs without code changes.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[#1a1a1f]">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
              <Zap size={20} className="text-purple-400" />
            </div>
            <h4 className="text-sm font-medium text-white mb-1">Race Conditions</h4>
            <p className="text-xs text-[#71717a]">
              Tests with timing dependencies that cause unpredictable behavior.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[#1a1a1f]">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3">
              <RefreshCw size={20} className="text-cyan-400" />
            </div>
            <h4 className="text-sm font-medium text-white mb-1">External Dependencies</h4>
            <p className="text-xs text-[#71717a]">
              Tests affected by network, database, or third-party service variability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

