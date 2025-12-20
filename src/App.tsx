import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DataSourceIndicator } from './components/DataSourceIndicator';
import { Dashboard } from './pages/Dashboard';
import { ExecutionHistory } from './pages/ExecutionHistory';
import { AutomationRoadmap } from './pages/AutomationRoadmap';
import { SuiteResults } from './pages/SuiteResults';
import { FlakinessDetective } from './pages/FlakinessDetective';
import { PerformanceHistory } from './pages/PerformanceHistory';
import { Login } from './pages/Login';
import { ProductProvider, useProduct } from './context/ProductContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useData } from './hooks/useData';
import type { PageType } from './types';
import { Loader2, LogOut, User } from 'lucide-react';

function LogoutConfirmModal({ 
  onConfirm, 
  onCancel 
}: { 
  onConfirm: () => void; 
  onCancel: () => void; 
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60" 
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-[#18181b] border border-[#27272a] rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-fadeIn">
        <h3 className="text-lg font-semibold text-white mb-2">
          Sign out
        </h3>
        <p className="text-sm text-[#a1a1aa] mb-6">
          Are you sure you want to sign out of the dashboard?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[#e4e4e7] hover:bg-[#27272a] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user) return null;

  const handleLogoutConfirm = () => {
    signOut();
    setShowLogoutConfirm(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#27272a] transition-colors"
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <User size={16} className="text-purple-400" />
            </div>
          )}
          <span className="text-sm text-[#e4e4e7] hidden sm:block">
            {user.displayName || user.email}
          </span>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl z-[60]">
            <div className="p-3 border-b border-[#27272a]">
              <p className="text-sm font-medium text-white truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-[#71717a] truncate">{user.email}</p>
            </div>
            <div className="p-1">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#e4e4e7] hover:bg-[#27272a] rounded-md transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for closing menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[55]"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />
      )}
    </>
  );
}

function DashboardContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { selectedProduct, productInfo } = useProduct();

  const {
    testResults,
    testScenarios,
    historicalRuns,
    suiteData,
    loading,
    error,
    dataSource,
    lastUpdated,
    refresh,
  } = useData({ product: selectedProduct, autoRefresh: false });

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} style={{ color: productInfo.color }} className="animate-spin" />
            <p className="text-[#a1a1aa]">Loading {productInfo.name} dashboard data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-2">Error loading data</p>
            <p className="text-[#71717a]">{error}</p>
            <button
              onClick={refresh}
              className="mt-4 px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: `${productInfo.color}20`,
                color: productInfo.color,
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            testResults={testResults}
            historicalRuns={historicalRuns}
            suiteData={suiteData}
            onNavigate={setCurrentPage}
          />
        );
      case 'execution-history':
        return <ExecutionHistory historicalRuns={historicalRuns} />;
      case 'roadmap':
        return (
          <AutomationRoadmap
            suiteData={suiteData}
            testScenarios={testScenarios}
          />
        );
      case 'suite-results':
        return <SuiteResults testResults={testResults} />;
      case 'flakiness':
        return (
          <FlakinessDetective
            testResults={testResults}
            historicalRuns={historicalRuns}
          />
        );
      case 'performance':
        return <PerformanceHistory historicalRuns={historicalRuns} />;
      default:
        return <Dashboard testResults={testResults} historicalRuns={historicalRuns} suiteData={suiteData} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Top bar with data source indicator and user menu */}
        <div className="sticky top-0 z-40 bg-[#0d0d0f]/95 backdrop-blur-sm border-b border-[#27272a]">
          <div className="flex items-center justify-end gap-4 p-4 max-w-[1600px] mx-auto">
            <DataSourceIndicator
              source={dataSource}
              lastUpdated={lastUpdated}
              onRefresh={refresh}
              loading={loading}
            />
            <UserMenu />
          </div>
        </div>

        <div className="p-6 max-w-[1600px] mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-purple-500" />
          <p className="text-[#a1a1aa]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <ProductProvider>
      <DashboardContent />
    </ProductProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
