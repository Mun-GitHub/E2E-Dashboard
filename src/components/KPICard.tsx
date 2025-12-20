import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: LucideIcon;
  color?: 'green' | 'red' | 'yellow' | 'purple' | 'cyan' | 'default';
}

const colorClasses = {
  green: 'text-green-400',
  red: 'text-red-400',
  yellow: 'text-yellow-400',
  purple: 'text-purple-400',
  cyan: 'text-cyan-400',
  default: 'text-white',
};

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon: Icon,
  color = 'default',
}: KPICardProps) {
  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;
  const trendColor = trend && trend > 0 ? 'text-green-400' : trend && trend < 0 ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="card group hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-[#a1a1aa] font-medium">{title}</span>
        {Icon && (
          <Icon
            size={18}
            className="text-[#71717a] group-hover:text-purple-400 transition-colors"
          />
        )}
      </div>

      <div className={`text-3xl font-bold mb-1 ${colorClasses[color]}`}>
        {value}
      </div>

      {(subtitle || trend !== undefined) && (
        <div className="flex items-center gap-2 text-sm">
          {subtitle && <span className="text-[#71717a]">{subtitle}</span>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon size={14} />
              <span>{Math.abs(trend)}%</span>
              {trendLabel && <span className="text-[#71717a]">{trendLabel}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

