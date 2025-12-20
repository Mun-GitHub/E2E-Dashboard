import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { KPICard } from '../components/KPICard';
import type { TestResult } from '../types';
import { formatDuration, formatDateTime } from '../utils/formatters';

interface SuiteResultsProps {
  testResults: TestResult[];
}

interface GroupedResults {
  suiteName: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  flaky: number;
  totalDuration: number;
}

export function SuiteResults({ testResults }: SuiteResultsProps) {
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());

  const groupedResults = useMemo(() => {
    const groups: Record<string, GroupedResults> = {};

    testResults.forEach(result => {
      const suite = result.testSuiteName || 'Unknown';
      if (!groups[suite]) {
        groups[suite] = {
          suiteName: suite,
          tests: [],
          passed: 0,
          failed: 0,
          flaky: 0,
          totalDuration: 0,
        };
      }
      groups[suite].tests.push(result);
      groups[suite].totalDuration += result.durationdurationMs || 0;

      if (result.status === 'passed') groups[suite].passed++;
      else if (result.status === 'failed') groups[suite].failed++;
      else if (result.status === 'flaky') groups[suite].flaky++;
    });

    return Object.values(groups);
  }, [testResults]);

  const overallStats = useMemo(() => {
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    const flaky = testResults.filter(t => t.status === 'flaky').length;
    const total = testResults.length;

    return {
      status: failed > 0 ? 'failed' : 'passed',
      flakyTests: flaky,
      activeFailures: failed,
      testCoverage: total,
      passed,
      failed,
    };
  }, [testResults]);

  const toggleSuite = (suiteName: string) => {
    setExpandedSuites(prev => {
      const next = new Set(prev);
      if (next.has(suiteName)) {
        next.delete(suiteName);
      } else {
        next.add(suiteName);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Latest Test Suite Results</h1>
        <p className="text-[#a1a1aa]">
          Quickly scan the latest outcomes for every test to identify failures and performance hot-spots across all suites.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <span className="text-sm text-[#a1a1aa] font-medium mb-2 block">Overall Status</span>
          <div className="flex items-center gap-2">
            <StatusBadge status={overallStats.status} />
            <span className="text-xs text-[#71717a]">about 20 hours ago</span>
          </div>
        </div>
        <KPICard
          title="Flaky Tests"
          value={overallStats.flakyTests}
          subtitle="in last run"
          color="yellow"
        />
        <KPICard
          title="Active Failures"
          value={overallStats.activeFailures}
          subtitle="currently failing"
          color="red"
        />
        <div className="card">
          <span className="text-sm text-[#a1a1aa] font-medium mb-2 block">Test Coverage</span>
          <div className="text-2xl font-bold text-cyan-400">{overallStats.testCoverage}</div>
          <span className="text-xs text-[#71717a]">total tests</span>
          <span className="text-xs text-[#71717a] block">{overallStats.passed} passed • {overallStats.failed} failed</span>
        </div>
      </div>

      {/* Suite Accordions */}
      <div className="space-y-3">
        {groupedResults.map(group => {
          const isExpanded = expandedSuites.has(group.suiteName);
          const status = group.failed > 0 ? 'failed' : 'passed';

          return (
            <div key={group.suiteName} className="card p-0 overflow-hidden">
              {/* Suite Header */}
              <button
                onClick={() => toggleSuite(group.suiteName)}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1a1a1f] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-base font-medium text-white text-left">{group.suiteName}</h3>
                    <p className="text-xs text-[#71717a] text-left">
                      {group.tests.length} tests • {group.passed} passed • {group.failed} failed • Total execution time: {formatDuration(group.totalDuration)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {group.failed > 0 && (
                    <span className="text-xs text-red-400">{group.failed} failed</span>
                  )}
                  <span className="text-xs text-green-400">{group.passed} passed</span>
                  <StatusBadge status={status} size="sm" />
                  {isExpanded ? <ChevronUp size={18} className="text-[#71717a]" /> : <ChevronDown size={18} className="text-[#71717a]" />}
                </div>
              </button>

              {/* Suite Tests Table */}
              {isExpanded && (
                <div className="border-t border-[#27272a]">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#0d0d0f]">
                        <th className="text-left px-4 py-2 text-xs font-medium text-[#71717a]">Test Case</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-[#71717a]">Status</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-[#71717a]">Execution Time</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-[#71717a]">Last Run</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-[#71717a]">Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.tests.map((test, idx) => (
                        <tr
                          key={`${test.testCaseId}-${idx}`}
                          className="border-t border-[#27272a] hover:bg-[#1a1a1f]"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              {test.status === 'passed' ? (
                                <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                              ) : test.status === 'failed' ? (
                                <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                              ) : (
                                <AlertCircle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                              )}
                              <div>
                                <span className="text-sm text-white">{test.journeyId || test.testCaseId}</span>
                                {test.error && (
                                  <p className="text-xs text-red-400 mt-1">{test.error}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={test.status} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#a1a1aa]">{formatDuration(test.durationdurationMs)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#a1a1aa]">{formatDateTime(test.runTimestamp)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={test.reportLink || '#'}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

