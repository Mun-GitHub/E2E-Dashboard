import { Database, HardDrive, RefreshCw } from 'lucide-react';
import type { DataSource } from '../services/dataService';

interface DataSourceIndicatorProps {
  source: DataSource;
  lastUpdated: Date | null;
  onRefresh?: () => void;
  loading?: boolean;
}

export function DataSourceIndicator({
  source,
  lastUpdated,
  onRefresh,
  loading = false,
}: DataSourceIndicatorProps) {
  const isElasticsearch = source === 'elasticsearch';

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1a1a1f] border border-[#27272a]">
      <div className="flex items-center gap-2">
        {isElasticsearch ? (
          <>
            <Database size={14} className="text-green-400" />
            <span className="text-xs text-green-400 font-medium">Elasticsearch</span>
          </>
        ) : (
          <>
            <HardDrive size={14} className="text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Local Data</span>
          </>
        )}
      </div>

      {lastUpdated && (
        <span className="text-xs text-[#71717a]">
          Updated: {lastUpdated.toLocaleTimeString()}
        </span>
      )}

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1 rounded hover:bg-[#27272a] text-[#71717a] hover:text-white transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      )}
    </div>
  );
}

