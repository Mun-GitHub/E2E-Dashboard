import { useState, useEffect, useCallback } from 'react';
import { dataService, type DataSource } from '../services/dataService';
import type { TestResult, TestScenario, HistoricalRun, SuiteData, ProductId } from '../types';

interface DataState {
  testResults: TestResult[];
  testScenarios: Record<string, TestScenario[]>;
  historicalRuns: HistoricalRun[];
  suiteData: SuiteData[];
  loading: boolean;
  error: string | null;
  dataSource: DataSource;
  lastUpdated: Date | null;
}

interface UseDataOptions {
  product?: ProductId;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useData(options: UseDataOptions = {}): DataState & {
  refresh: () => Promise<void>;
} {
  const { product, autoRefresh = false, refreshInterval = 60000 } = options;

  const [data, setData] = useState<DataState>({
    testResults: [],
    testScenarios: {},
    historicalRuns: [],
    suiteData: [],
    loading: true,
    error: null,
    dataSource: 'local',
    lastUpdated: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch all data in parallel with product filter
      const [results, scenarios, runs, suites] = await Promise.all([
        dataService.getTestResults({ product }),
        dataService.getTestScenarios(product),
        dataService.getHistoricalRuns({ product }),
        dataService.getSuiteData(product),
      ]);

      setData({
        testResults: results,
        testScenarios: scenarios,
        historicalRuns: runs,
        suiteData: suites,
        loading: false,
        error: null,
        dataSource: dataService.getDataSource(),
        lastUpdated: new Date(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      console.error('Error loading data:', err);
    }
  }, [product]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(fetchData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    ...data,
    refresh: fetchData,
  };
}

// Hook for filtered test results
export function useTestResults(filters?: {
  status?: string;
  testSuite?: string;
  dateFrom?: string;
  dateTo?: string;
  product?: ProductId;
}) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true);
        const data = await dataService.getTestResults(filters);
        setResults(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [filters?.status, filters?.testSuite, filters?.dateFrom, filters?.dateTo, filters?.product]);

  return { results, loading, error };
}

// Hook for historical runs with filtering
export function useHistoricalRuns(options?: { days?: number; testSuite?: string; product?: ProductId }) {
  const [runs, setRuns] = useState<HistoricalRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRuns() {
      try {
        setLoading(true);
        const data = await dataService.getHistoricalRuns(options);
        setRuns(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load runs');
      } finally {
        setLoading(false);
      }
    }

    fetchRuns();
  }, [options?.days, options?.testSuite, options?.product]);

  return { runs, loading, error };
}

// Hook for aggregated metrics
export function useMetrics(product?: ProductId) {
  const [metrics, setMetrics] = useState<{
    passRateTrend: Array<{ date: string; passRate: number }>;
    statusCounts: { passed: number; failed: number; flaky: number };
  }>({
    passRateTrend: [],
    statusCounts: { passed: 0, failed: 0, flaky: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const [trend, counts] = await Promise.all([
          dataService.getPassRateTrend(15, product),
          dataService.getTestStatusCounts(product),
        ]);
        setMetrics({ passRateTrend: trend, statusCounts: counts });
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [product]);

  return { metrics, loading };
}
