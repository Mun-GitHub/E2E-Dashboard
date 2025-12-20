import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Activity,
  Clock,
  Target,
  Zap,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { AlertBanner } from '../components/AlertBanner';
import { StatusBadge } from '../components/StatusBadge';
import { useProduct } from '../context/ProductContext';
import type { TestResult, HistoricalRun, SuiteData } from '../types';
import { formatDurationSeconds, formatDateTime, formatTimeAgo } from '../utils/formatters';

interface DashboardProps {
  testResults: TestResult[];
  historicalRuns: HistoricalRun[];
  suiteData: SuiteData[];
  onNavigate?: (page: 'execution-history' | 'roadmap' | 'suite-results' | 'flakiness' | 'performance') => void;
}

export function Dashboard({ testResults, historicalRuns, suiteData, onNavigate }: DashboardProps) {
  const { productInfo } = useProduct();

  const kpiData = useMemo(() => {
    const latestRun = historicalRuns[historicalRuns.length - 1];
    const totalJourneys = suiteData.reduce((acc, s) => acc + s.totalJourneys, 0);
    const automatedJourneys = suiteData.reduce((acc, s) => acc + s.done, 0);

    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    const total = testResults.length;

    return {
      passRate: total > 0 ? Math.round((passed / total) * 100 * 10) / 10 : 0,
      totalRuns: historicalRuns.length,
      testDuration: latestRun ? formatDurationSeconds(latestRun.duration) : '0s',
      automationCoverage: totalJourneys > 0 ? Math.round((automatedJourneys / totalJourneys) * 100) : 0,
      passedTests: passed,
      failedTests: failed,
      totalTests: total,
    };
  }, [testResults, historicalRuns, suiteData]);

  const trendData = useMemo(() => {
    return historicalRuns.slice(-15).map(run => ({
      date: run.date.slice(5),
      duration: Math.round(run.duration / 60),
      passed: run.passed,
      failed: run.failed,
      flaky: run.flaky,
    }));
  }, [historicalRuns]);

  const latestExecutions = useMemo(() => {
    return historicalRuns.slice(-3).reverse();
  }, [historicalRuns]);

  const failedTests = testResults.filter(t => t.status === 'failed');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            <span style={{ color: productInfo.color }}>{productInfo.name}</span> - Drive Quality, Ship with Confidence
          </h1>
          <p className="text-[#a1a1aa]">
            The central hub for {productInfo.name} E2E test execution, performance analysis, and coverage tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#71717a]">Last sync</span>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1f] text-white hover:bg-[#27272a] transition-colors">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {failedTests.length > 0 && (
        <AlertBanner
          message={`Test Failures Detected: ${failedTests.length} failing tests out of ${testResults.length} total tests. Latest run at ${formatTimeAgo(testResults[0]?.runTimestamp || '')}.`}
          linkText="View Test Cases"
          type="error"
        />
      )}

      {/* Weekly Summary Card */}
      <div className="card bg-gradient-to-br from-[#18181b] to-[#1a1a1f] border-[#27272a]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Week of December 1 – December 8, 2025
            </h3>
            <p className="text-sm text-[#71717a]">
              Last updated: {formatTimeAgo(new Date().toISOString())}
            </p>
            <p className="text-xs text-purple-400 mt-1">Powered by AI Analysis</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-[#a1a1aa] flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
            Overall health remains strong this week, with a {kpiData.passRate}% pass rate across {historicalRuns.length} test suite runs!
          </p>
          <p className="text-sm text-[#a1a1aa] flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
            Automation coverage is holding steady at {kpiData.automationCoverage}% of our {suiteData.reduce((a, s) => a + s.totalJourneys, 0)} key journeys.
          </p>
          <p className="text-sm text-[#a1a1aa] flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
            We're celebrating excellent stability, with no flaky tests detected this week!
          </p>
        </div>

        <div className="flex items-center gap-6 pt-4 border-t border-[#27272a]">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-green-400" />
            <span className="text-sm text-[#a1a1aa]">{kpiData.passRate}% pass rate</span>
          </div>
          <div className="flex items-center gap-2">
            <Target size={14} className="text-cyan-400" />
            <span className="text-sm text-[#a1a1aa]">{historicalRuns.length} runs</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-yellow-400" />
            <span className="text-sm text-[#a1a1aa]">{kpiData.testDuration} avg duration</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-purple-400" />
            <span className="text-sm text-[#a1a1aa]">{kpiData.automationCoverage}% automation</span>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <a href="#" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
            View full history
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* KPI Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <Target size={18} className="text-purple-400" />
          Key Performance Indicators
        </h2>
        <p className="text-sm text-[#71717a] mb-4">
          Showing data from {historicalRuns[0]?.date || 'N/A'} – no data available for today yet.
        </p>

        <div className="grid grid-cols-4 gap-4">
          <KPICard
            title="Pass Rate"
            value={`${kpiData.passRate}%`}
            subtitle={`${kpiData.passedTests} of ${kpiData.totalTests} tests passed today`}
            color="green"
            icon={Activity}
          />
          <KPICard
            title="Total Runs"
            value={kpiData.totalRuns}
            subtitle={`${kpiData.failedTests} runs with issues (${Math.round((kpiData.failedTests / Math.max(kpiData.totalRuns, 1)) * 100)}% failure) today`}
            icon={Target}
          />
          <KPICard
            title="Test Duration"
            value={kpiData.testDuration}
            subtitle="Total tests • 3m 18s avg per test today"
            icon={Clock}
          />
          <KPICard
            title="Automation Coverage"
            value={`${kpiData.automationCoverage}%`}
            subtitle="Current automation coverage"
            color="purple"
            icon={Zap}
          />
        </div>
      </div>

      {/* Test Suite Trends */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity size={18} className="text-purple-400" />
          Test Suite Trends
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Duration Trend */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-[#71717a]" />
              <h3 className="text-sm font-medium text-white">Suite Duration Trend (Last 15 Days)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fafafa' }}
                />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ fill: '#a855f7', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#a855f7' }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-end mt-2">
              <span className="text-xs text-[#71717a]">Avg: {Math.round(trendData.reduce((a, b) => a + b.duration, 0) / trendData.length)}m</span>
            </div>
          </div>

          {/* Pass/Fail/Flaky Trend */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-[#71717a]" />
              <h3 className="text-sm font-medium text-white">Pass/Fail/Flaky Trend (Last 15 Days)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fafafa' }}
                />
                <Legend />
                <Bar dataKey="passed" stackId="a" fill="#22c55e" name="Passed" />
                <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
                <Bar dataKey="flaky" stackId="a" fill="#f97316" name="Flaky" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-end mt-2">
              <span className="text-xs text-[#71717a]">Avg: {Math.round(trendData.reduce((a, b) => a + b.passed + b.failed + b.flaky, 0) / trendData.length)} tests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock size={18} className="text-purple-400" />
          Recent Activity
        </h2>

        <div className="card">
          <h3 className="text-base font-medium text-white mb-1">Latest Test Executions</h3>
          <p className="text-sm text-[#71717a] mb-4">Most recent test runs and their status</p>

          <div className="space-y-3">
            {latestExecutions.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between py-3 border-b border-[#27272a] last:border-0"
              >
                <div>
                  <span className="text-sm font-medium text-white">{run.testSuite}</span>
                  <p className="text-xs text-[#71717a]">
                    {run.passed}/{run.totalTests} tests passed • {formatDateTime(run.timestamp)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={run.status} />
                  {run.status === 'failed' && (
                    <XCircle size={16} className="text-red-400" />
                  )}
                  {run.status === 'passed' && (
                    <CheckCircle2 size={16} className="text-green-400" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#27272a]">
            <button
              onClick={() => onNavigate?.('execution-history')}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              View All Test Runs
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

