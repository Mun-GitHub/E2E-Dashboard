// Supported products
export const PRODUCTS = [
  { id: 'DAM', name: 'DAM', color: '#a855f7', icon: '/product-icons/DAM.png' },
  { id: 'CMS', name: 'CMS', color: '#3b82f6', icon: '/product-icons/CMS.png' },
  { id: 'AgentOS', name: 'AgentOS', color: '#10b981', icon: '/product-icons/AgentOS.png' },
  { id: 'Launch', name: 'Launch', color: '#f59e0b', icon: '/product-icons/Launch.png' },
  { id: 'Brandkit', name: 'Brandkit', color: '#ec4899', icon: '/product-icons/Brandkit.png' },
  { id: 'Marketplace', name: 'Marketplace', color: '#8b5cf6', icon: '/product-icons/Marketplace.png' },
  { id: 'DeveloperHub', name: 'DeveloperHub', color: '#06b6d4', icon: '/product-icons/DeveloperHub.png' },
] as const;

export type ProductId = typeof PRODUCTS[number]['id'];

export interface TestResult {
  testCaseId: string;
  testTitle: string;
  testSuiteName: string;
  journeyId: string;
  status: 'passed' | 'failed' | 'flaky' | 'skipped';
  runTimestamp: string;
  durationdurationMs: number;
  buildId: string;
  reportLink?: string;
  branch?: string;
  error?: string;
  error_stack?: string;
  product?: ProductId;
}

export interface TestScenario {
  automationStatus: string;
  priority: string;
  testType: string;
  journeyId: string;
  jiraTicket?: string;
  journeyShortDescription: string;
  primaryUserGoal: string;
  potentialStartingPoints: string;
  highLevelSteps: string;
  successOutcome: string;
  tearDownSteps: string;
  product?: ProductId;
}

export interface HistoricalRun {
  id: string;
  date: string;
  timestamp: string;
  testSuite: string;
  totalTests: number;
  passed: number;
  failed: number;
  flaky: number;
  duration: number;
  passRate: number;
  buildId: string;
  branch: string;
  status: 'passed' | 'failed';
  product?: ProductId;
}

export interface SuiteData {
  name: string;
  totalJourneys: number;
  done: number;
  inProgress: number;
  notStarted: number;
  coverage: number;
  product?: ProductId;
}

export interface KPIData {
  passRate: number;
  totalRuns: number;
  testDuration: string;
  automationCoverage: number;
  passedTests: number;
  failedTests: number;
  flakyTests: number;
  totalTests: number;
}

export interface WeeklyPerformance {
  weekStarting: string;
  status: string;
  passRate: number;
  passRateChange: number;
  avgDuration: string;
  durationChange: number;
  testEfficiency: string;
  flakyTests: number;
  coverage: number;
  coverageChange: number;
}

export type PageType = 
  | 'dashboard' 
  | 'execution-history' 
  | 'roadmap' 
  | 'suite-results' 
  | 'flakiness' 
  | 'performance';
