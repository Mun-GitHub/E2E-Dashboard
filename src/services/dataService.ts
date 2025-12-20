import { elasticsearchService } from './elasticsearchService';
import { localDataService } from './localDataService';
import { ES_CONFIG } from '../config/elasticsearch';
import type { TestResult, TestScenario, HistoricalRun, SuiteData, ProductId } from '../types';

export type DataSource = 'elasticsearch' | 'local';

interface DataServiceState {
  source: DataSource;
  esAvailable: boolean;
  lastCheck: number;
}

class DataService {
  private state: DataServiceState = {
    source: 'local',
    esAvailable: false,
    lastCheck: 0,
  };

  private checkInterval = 60000; // Re-check ES availability every minute

  async initialize(): Promise<DataSource> {
    if (!ES_CONFIG.enabled) {
      console.log('📦 Elasticsearch disabled, using local data');
      this.state.source = 'local';
      return 'local';
    }

    const now = Date.now();
    
    // Only check if we haven't checked recently
    if (now - this.state.lastCheck < this.checkInterval && this.state.lastCheck > 0) {
      return this.state.source;
    }

    this.state.lastCheck = now;

    try {
      const isAvailable = await elasticsearchService.isAvailable();
      this.state.esAvailable = isAvailable;
      
      if (isAvailable) {
        console.log('🔍 Connected to Elasticsearch');
        this.state.source = 'elasticsearch';
      } else {
        console.log('📦 Elasticsearch not available, using local data');
        this.state.source = 'local';
      }
    } catch (error) {
      console.warn('⚠️ Error checking Elasticsearch:', error);
      this.state.esAvailable = false;
      this.state.source = 'local';
    }

    return this.state.source;
  }

  getDataSource(): DataSource {
    return this.state.source;
  }

  isElasticsearchAvailable(): boolean {
    return this.state.esAvailable;
  }

  async getTestResults(options?: {
    status?: string;
    testSuite?: string;
    dateFrom?: string;
    dateTo?: string;
    product?: ProductId;
  }): Promise<TestResult[]> {
    await this.initialize();

    if (this.state.source === 'elasticsearch') {
      try {
        return await elasticsearchService.getTestResults(options);
      } catch (error) {
        console.warn('Failed to fetch from Elasticsearch, falling back to local:', error);
        return await this.getLocalTestResults(options?.product);
      }
    }

    return await this.getLocalTestResults(options?.product);
  }

  private async getLocalTestResults(product?: ProductId): Promise<TestResult[]> {
    const results = await localDataService.getTestResults();
    if (product) {
      // Filter by product or return all if product field doesn't exist (legacy data)
      return results.filter(r => !r.product || r.product === product);
    }
    return results;
  }

  async getTestScenarios(product?: ProductId): Promise<Record<string, TestScenario[]>> {
    await this.initialize();

    if (this.state.source === 'elasticsearch') {
      try {
        return await elasticsearchService.getTestScenarios(product);
      } catch (error) {
        console.warn('Failed to fetch from Elasticsearch, falling back to local:', error);
        return await localDataService.getTestScenarios();
      }
    }

    return await localDataService.getTestScenarios();
  }

  async getHistoricalRuns(options?: {
    days?: number;
    testSuite?: string;
    product?: ProductId;
  }): Promise<HistoricalRun[]> {
    await this.initialize();

    if (this.state.source === 'elasticsearch') {
      try {
        return await elasticsearchService.getHistoricalRuns(options);
      } catch (error) {
        console.warn('Failed to fetch from Elasticsearch, falling back to local:', error);
        return await this.getLocalHistoricalRuns(options?.product);
      }
    }

    return await this.getLocalHistoricalRuns(options?.product);
  }

  private async getLocalHistoricalRuns(product?: ProductId): Promise<HistoricalRun[]> {
    const runs = await localDataService.getHistoricalRuns();
    if (product) {
      return runs.filter(r => !r.product || r.product === product);
    }
    return runs;
  }

  async getSuiteData(product?: ProductId): Promise<SuiteData[]> {
    await this.initialize();

    if (this.state.source === 'elasticsearch') {
      try {
        return await elasticsearchService.getSuiteData(product);
      } catch (error) {
        console.warn('Failed to fetch from Elasticsearch, falling back to local:', error);
        return await this.getLocalSuiteData(product);
      }
    }

    return await this.getLocalSuiteData(product);
  }

  private async getLocalSuiteData(product?: ProductId): Promise<SuiteData[]> {
    const suites = await localDataService.getSuiteData();
    if (product) {
      return suites.filter(s => !s.product || s.product === product);
    }
    return suites;
  }

  // Aggregation methods (ES only, fallback to computed local values)
  async getPassRateTrend(days: number = 15, product?: ProductId): Promise<Array<{ date: string; passRate: number }>> {
    await this.initialize();

    if (this.state.source === 'elasticsearch') {
      try {
        return await elasticsearchService.getPassRateTrend(days, product);
      } catch (error) {
        console.warn('Failed to fetch trend from Elasticsearch:', error);
      }
    }

    // Compute from local data
    const runs = await this.getLocalHistoricalRuns(product);
    return runs.slice(-days).map(run => ({
      date: run.date,
      passRate: run.passRate,
    }));
  }

  async getTestStatusCounts(product?: ProductId): Promise<{ passed: number; failed: number; flaky: number }> {
    await this.initialize();

    if (this.state.source === 'elasticsearch') {
      try {
        return await elasticsearchService.getTestStatusCounts(product);
      } catch (error) {
        console.warn('Failed to fetch status counts from Elasticsearch:', error);
      }
    }

    // Compute from local data
    const results = await this.getLocalTestResults(product);
    return {
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      flaky: results.filter(r => r.status === 'flaky').length,
    };
  }
}

// Export singleton
export const dataService = new DataService();

