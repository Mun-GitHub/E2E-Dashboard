import type { TestResult, TestScenario, HistoricalRun, SuiteData } from '../types';

class LocalDataService {
  private cache: {
    testResults?: TestResult[];
    testScenarios?: Record<string, TestScenario[]>;
    historicalRuns?: HistoricalRun[];
    suiteData?: SuiteData[];
  } = {};

  async getTestResults(): Promise<TestResult[]> {
    if (this.cache.testResults) {
      return this.cache.testResults;
    }

    const response = await fetch('/data/test_results.json');
    if (!response.ok) {
      throw new Error('Failed to load test results');
    }

    this.cache.testResults = await response.json();
    return this.cache.testResults!;
  }

  async getTestScenarios(): Promise<Record<string, TestScenario[]>> {
    if (this.cache.testScenarios) {
      return this.cache.testScenarios;
    }

    const response = await fetch('/data/test_scenarios.json');
    if (!response.ok) {
      throw new Error('Failed to load test scenarios');
    }

    this.cache.testScenarios = await response.json();
    return this.cache.testScenarios!;
  }

  async getHistoricalRuns(): Promise<HistoricalRun[]> {
    if (this.cache.historicalRuns) {
      return this.cache.historicalRuns;
    }

    const response = await fetch('/data/historical_runs.json');
    if (!response.ok) {
      throw new Error('Failed to load historical runs');
    }

    this.cache.historicalRuns = await response.json();
    return this.cache.historicalRuns!;
  }

  async getSuiteData(): Promise<SuiteData[]> {
    if (this.cache.suiteData) {
      return this.cache.suiteData;
    }

    const response = await fetch('/data/suite_data.json');
    if (!response.ok) {
      throw new Error('Failed to load suite data');
    }

    this.cache.suiteData = await response.json();
    return this.cache.suiteData!;
  }

  clearCache(): void {
    this.cache = {};
  }
}

export const localDataService = new LocalDataService();

