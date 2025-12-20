import { ES_CONFIG } from '../config/elasticsearch';
import type { TestResult, TestScenario, HistoricalRun, SuiteData, ProductId } from '../types';

interface ESSearchResponse<T> {
  hits: {
    total: { value: number };
    hits: Array<{
      _id: string;
      _source: T;
    }>;
  };
  aggregations?: Record<string, unknown>;
}

interface ESError {
  message: string;
  status?: number;
}

class ElasticsearchService {
  private baseUrl: string;
  private headers: HeadersInit;
  private enabled: boolean;

  constructor() {
    this.baseUrl = ES_CONFIG.host;
    this.enabled = ES_CONFIG.enabled;
    
    this.headers = {
      'Content-Type': 'application/json',
    };

    // Add authentication if not using proxy (proxy handles auth)
    if (!ES_CONFIG.useProxy) {
      if (ES_CONFIG.apiKey) {
        this.headers['Authorization'] = `ApiKey ${ES_CONFIG.apiKey}`;
      } else if (ES_CONFIG.username && ES_CONFIG.password) {
        const credentials = btoa(`${ES_CONFIG.username}:${ES_CONFIG.password}`);
        this.headers['Authorization'] = `Basic ${credentials}`;
      }
    }
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: object
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: this.headers,
      signal: AbortSignal.timeout(ES_CONFIG.timeout),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error: ESError = {
        message: `Elasticsearch error: ${response.statusText}`,
        status: response.status,
      };
      throw error;
    }

    return response.json();
  }

  async isAvailable(): Promise<boolean> {
    if (!this.enabled) return false;
    
    try {
      await this.request('GET', '/_cluster/health');
      return true;
    } catch {
      console.warn('Elasticsearch not available, falling back to local data');
      return false;
    }
  }

  async getTestResults(options?: {
    size?: number;
    from?: number;
    status?: string;
    testSuite?: string;
    dateFrom?: string;
    dateTo?: string;
    product?: ProductId;
  }): Promise<TestResult[]> {
    const { size = 1000, from = 0, status, testSuite, dateFrom, dateTo, product } = options || {};

    const must: object[] = [];

    // Filter by product
    if (product) {
      must.push({ term: { product } });
    }

    if (status) {
      must.push({ term: { status } });
    }

    if (testSuite) {
      must.push({ term: { testSuiteName: testSuite } });
    }

    if (dateFrom || dateTo) {
      const range: Record<string, string> = {};
      if (dateFrom) range.gte = dateFrom;
      if (dateTo) range.lte = dateTo;
      must.push({ range: { runTimestamp: range } });
    }

    const query = must.length > 0
      ? { bool: { must } }
      : { match_all: {} };

    const response = await this.request<ESSearchResponse<TestResult>>(
      'POST',
      `/${ES_CONFIG.indices.testResults}/_search`,
      {
        query,
        size,
        from,
        sort: [{ runTimestamp: { order: 'desc' } }],
      }
    );

    return response.hits.hits.map(hit => {
      const source = hit._source as TestResult & { durationMs?: number };
      return {
        ...source,
        // Map field names if needed (ES uses durationMs, local uses durationdurationMs)
        durationdurationMs: source.durationMs ?? source.durationdurationMs ?? 0,
      };
    });
  }

  async getTestScenarios(product?: ProductId): Promise<Record<string, TestScenario[]>> {
    const query = product
      ? { term: { product } }
      : { match_all: {} };

    const response = await this.request<ESSearchResponse<TestScenario & { suiteName: string }>>(
      'POST',
      `/${ES_CONFIG.indices.testScenarios}/_search`,
      {
        query,
        size: 10000,
        sort: [{ suiteName: { order: 'asc' } }],
      }
    );

    // Group by suite name
    const grouped: Record<string, TestScenario[]> = {};
    
    response.hits.hits.forEach(hit => {
      const { suiteName, ...scenario } = hit._source;
      if (!grouped[suiteName]) {
        grouped[suiteName] = [];
      }
      grouped[suiteName].push(scenario);
    });

    return grouped;
  }

  async getHistoricalRuns(options?: {
    size?: number;
    days?: number;
    testSuite?: string;
    product?: ProductId;
  }): Promise<HistoricalRun[]> {
    const { size = 100, days = 30, testSuite, product } = options || {};

    const must: object[] = [];

    // Filter by product
    if (product) {
      must.push({ term: { product } });
    }

    if (testSuite) {
      must.push({ term: { testSuite } });
    }

    if (days > 0) {
      must.push({
        range: {
          date: {
            gte: `now-${days}d/d`,
            lte: 'now/d',
          },
        },
      });
    }

    const query = must.length > 0
      ? { bool: { must } }
      : { match_all: {} };

    const response = await this.request<ESSearchResponse<HistoricalRun & { runId: string }>>(
      'POST',
      `/${ES_CONFIG.indices.historicalRuns}/_search`,
      {
        query,
        size,
        sort: [{ date: { order: 'desc' } }],
      }
    );

    return response.hits.hits.map(hit => ({
      ...hit._source,
      id: hit._source.runId || hit._id,
    }));
  }

  async getSuiteData(product?: ProductId): Promise<SuiteData[]> {
    const query = product
      ? { term: { product } }
      : { match_all: {} };

    const response = await this.request<ESSearchResponse<SuiteData>>(
      'POST',
      `/${ES_CONFIG.indices.suiteData}/_search`,
      {
        query,
        size: 100,
        sort: [{ name: { order: 'asc' } }],
      }
    );

    return response.hits.hits.map(hit => hit._source);
  }

  // Aggregation queries for dashboard metrics
  async getPassRateTrend(days: number = 15, product?: ProductId): Promise<Array<{ date: string; passRate: number }>> {
    const must: object[] = [
      {
        range: {
          date: {
            gte: `now-${days}d/d`,
            lte: 'now/d',
          },
        },
      },
    ];

    if (product) {
      must.push({ term: { product } });
    }

    const response = await this.request<ESSearchResponse<unknown> & {
      aggregations: {
        daily: {
          buckets: Array<{
            key_as_string: string;
            doc_count: number;
            pass_rate: { value: number };
          }>;
        };
      };
    }>(
      'POST',
      `/${ES_CONFIG.indices.historicalRuns}/_search`,
      {
        size: 0,
        query: { bool: { must } },
        aggs: {
          daily: {
            date_histogram: {
              field: 'date',
              calendar_interval: 'day',
            },
            aggs: {
              pass_rate: {
                avg: { field: 'passRate' },
              },
            },
          },
        },
      }
    );

    return response.aggregations.daily.buckets.map(bucket => ({
      date: bucket.key_as_string.slice(0, 10),
      passRate: bucket.pass_rate.value || 0,
    }));
  }

  async getTestStatusCounts(product?: ProductId): Promise<{ passed: number; failed: number; flaky: number }> {
    const query = product
      ? { term: { product } }
      : { match_all: {} };

    const response = await this.request<ESSearchResponse<unknown> & {
      aggregations: {
        status_counts: {
          buckets: Array<{
            key: string;
            doc_count: number;
          }>;
        };
      };
    }>(
      'POST',
      `/${ES_CONFIG.indices.testResults}/_search`,
      {
        size: 0,
        query,
        aggs: {
          status_counts: {
            terms: { field: 'status' },
          },
        },
      }
    );

    const counts = { passed: 0, failed: 0, flaky: 0 };
    response.aggregations.status_counts.buckets.forEach(bucket => {
      if (bucket.key in counts) {
        counts[bucket.key as keyof typeof counts] = bucket.doc_count;
      }
    });

    return counts;
  }
}

// Export singleton instance
export const elasticsearchService = new ElasticsearchService();
