import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface AlertBannerProps {
  message: string;
  linkText?: string;
  linkHref?: string;
  type?: 'warning' | 'error' | 'info';
}

export function AlertBanner({
  message,
  linkText,
  linkHref,
  type = 'warning',
}: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const bgColors = {
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  };

  const iconColors = {
    warning: 'text-yellow-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  };

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-lg border ${bgColors[type]}`}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle size={18} className={iconColors[type]} />
        <span className="text-sm text-[#fafafa]">{message}</span>
        {linkText && linkHref && (
          <a
            href={linkHref}
            className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            {linkText}
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-[#71717a] hover:text-white transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}

