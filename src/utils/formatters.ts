import { format, parseISO, formatDistanceToNow } from 'date-fns';

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function formatDurationSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'MMM d, hh:mm a');
  } catch {
    return dateStr;
  }
}

export function formatTimeAgo(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'passed':
      return '#22c55e';
    case 'failed':
      return '#ef4444';
    case 'flaky':
      return '#eab308';
    case 'skipped':
      return '#71717a';
    default:
      return '#a1a1aa';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority?.toLowerCase()) {
    case 'high':
      return '#a855f7';
    case 'medium':
      return '#ec4899';
    case 'low':
      return '#06b6d4';
    default:
      return '#71717a';
  }
}

