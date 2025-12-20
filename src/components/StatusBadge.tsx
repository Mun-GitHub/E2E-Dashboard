interface StatusBadgeProps {
  status: 'passed' | 'failed' | 'flaky' | 'skipped' | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const baseClasses = `inline-flex items-center justify-center font-medium rounded-full ${
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
  }`;

  const statusClasses: Record<string, string> = {
    passed: 'bg-green-500/15 text-green-400 border border-green-500/30',
    failed: 'bg-red-500/15 text-red-400 border border-red-500/30',
    flaky: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    skipped: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
  };

  const statusClass = statusClasses[status.toLowerCase()] || statusClasses.skipped;

  return (
    <span className={`${baseClasses} ${statusClass}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

