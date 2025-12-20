import { useMemo, useState } from 'react';
import { ExternalLink, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import type { HistoricalRun } from '../types';
import { formatDateTime, formatDurationSeconds } from '../utils/formatters';

interface ExecutionHistoryProps {
  historicalRuns: HistoricalRun[];
}

type SortField = 'date' | 'status' | 'passRate' | 'duration';
type SortDir = 'asc' | 'desc';

export function ExecutionHistory({ historicalRuns }: ExecutionHistoryProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filteredRuns = useMemo(() => {
    let runs = [...historicalRuns];
    
    if (statusFilter !== 'all') {
      runs = runs.filter(r => r.status === statusFilter);
    }

    runs.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date':
          cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'passRate':
          cmp = a.passRate - b.passRate;
          break;
        case 'duration':
          cmp = a.duration - b.duration;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return runs;
  }, [historicalRuns, sortField, sortDir, statusFilter]);

  const paginatedRuns = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRuns.slice(start, start + perPage);
  }, [filteredRuns, page]);

  const totalPages = Math.ceil(filteredRuns.length / perPage);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Test Execution History</h1>
        <p className="text-[#a1a1aa]">
          A chronological log of all test suite executions. Track status, duration, and outcomes, with direct links to CI/CD reports.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#71717a]" />
          <span className="text-sm text-[#a1a1aa]">Status:</span>
        </div>
        <div className="flex gap-2">
          {(['all', 'passed', 'failed'] as const).map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                statusFilter === status
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-[#1a1a1f] text-[#a1a1aa] hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-sm text-[#71717a] ml-auto">
          Showing {paginatedRuns.length} of {filteredRuns.length} total
        </span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272a]">
              <th
                onClick={() => handleSort('date')}
                className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa] cursor-pointer hover:text-white"
              >
                <span className="flex items-center gap-1">
                  Test Suite <SortIcon field="date" />
                </span>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa] cursor-pointer hover:text-white"
              >
                <span className="flex items-center gap-1">
                  Status <SortIcon field="status" />
                </span>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa]">
                Tests
              </th>
              <th
                onClick={() => handleSort('passRate')}
                className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa] cursor-pointer hover:text-white"
              >
                <span className="flex items-center gap-1">
                  Pass Rate <SortIcon field="passRate" />
                </span>
              </th>
              <th
                onClick={() => handleSort('duration')}
                className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa] cursor-pointer hover:text-white"
              >
                <span className="flex items-center gap-1">
                  Duration <SortIcon field="duration" />
                </span>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa]">
                Timestamp
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#a1a1aa]">
                CI Job
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRuns.map(run => (
              <tr
                key={run.id}
                className="border-b border-[#27272a] last:border-0 hover:bg-[#1a1a1f] transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-sm text-white">{run.testSuite}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={run.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-white">{run.totalTests} total</div>
                  <div className="text-xs text-[#71717a]">
                    {run.passed} passed, {run.failed} failed, {run.flaky} flaky
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white">{run.passRate}%</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white">{formatDurationSeconds(run.duration)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white">{formatDateTime(run.timestamp)}</span>
                </td>
                <td className="px-4 py-3">
                  <a
                    href="#"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#71717a]">
            Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, filteredRuns.length)} of {filteredRuns.length} results.
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#a1a1aa]">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1 text-sm rounded bg-[#1a1a1f] text-[#a1a1aa] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ««
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 text-sm rounded bg-[#1a1a1f] text-[#a1a1aa] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 text-sm rounded bg-[#1a1a1f] text-[#a1a1aa] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1 text-sm rounded bg-[#1a1a1f] text-[#a1a1aa] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                »»
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

