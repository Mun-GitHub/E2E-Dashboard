import {
  LayoutDashboard,
  History,
  Map,
  TestTube2,
  Zap,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { PageType } from '../types';
import { ProductSelector } from './ProductSelector';
import { useProduct } from '../context/ProductContext';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems: { id: PageType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'execution-history', label: 'Execution History', icon: <History size={20} /> },
  { id: 'roadmap', label: 'Automation Roadmap', icon: <Map size={20} /> },
  { id: 'suite-results', label: 'Suite Results', icon: <TestTube2 size={20} /> },
  { id: 'flakiness', label: 'Flakiness Detective', icon: <Zap size={20} /> },
  { id: 'performance', label: 'Performance History', icon: <TrendingUp size={20} /> },
];

export function Sidebar({ currentPage, onPageChange, collapsed, onToggleCollapse }: SidebarProps) {
  const { productInfo } = useProduct();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#0d0d0f] border-r border-[#27272a] flex flex-col transition-all duration-300 z-50 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Product Selector */}
      <div className="border-b border-[#27272a]">
        {collapsed ? (
          <div className="h-16 flex items-center justify-center">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: productInfo.color }}
            >
              {productInfo.id.slice(0, 2).toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="p-2">
            <ProductSelector />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'text-white border'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1f]'
                }`}
                style={
                  currentPage === item.id
                    ? {
                        background: `linear-gradient(135deg, ${productInfo.color}20, ${productInfo.color}10)`,
                        borderColor: `${productInfo.color}50`,
                      }
                    : undefined
                }
                title={collapsed ? item.label : undefined}
              >
                <span style={{ color: currentPage === item.id ? productInfo.color : undefined }}>
                  {item.icon}
                </span>
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-[#27272a]">
 
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#27272a] rounded-full flex items-center justify-center text-[#a1a1aa] hover:text-white hover:bg-[#3f3f46] transition-all"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
