// Elasticsearch / OpenSearch Configuration
// These values can be overridden via environment variables

// In development, we use a Vite proxy to avoid CORS issues
const isDev = import.meta.env.DEV;

export const ES_CONFIG = {
  // In dev mode, use the Vite proxy path; in production, use the direct URL
  host: isDev 
    ? '/es' 
    : (import.meta.env.VITE_ES_HOST || 'https://localhost:9200'),
  
  // Authentication (only needed for production - dev uses proxy)
  username: import.meta.env.VITE_ES_USERNAME || 'default_username',
  password: import.meta.env.VITE_ES_PASSWORD || 'default_password',
  
  // API Key authentication (alternative to username/password)
  apiKey: import.meta.env.VITE_ES_API_KEY || '',
  
  // Index names
  indices: {
    testResults: import.meta.env.VITE_ES_INDEX_TEST_RESULTS || 'test_results',
    testScenarios: import.meta.env.VITE_ES_INDEX_TEST_SCENARIOS || 'test_scenarios',
    historicalRuns: import.meta.env.VITE_ES_INDEX_HISTORICAL_RUNS || 'historical_runs',
    suiteData: import.meta.env.VITE_ES_INDEX_SUITE_DATA || 'suite_data',
  },
  
  // Request timeout in milliseconds
  timeout: 10000,
  
  // Enable/disable Elasticsearch (set to false to use local data only)
  enabled: import.meta.env.VITE_ES_ENABLED !== 'false',
  
  // Use proxy in development (auth is handled by Vite proxy)
  useProxy: isDev,
};

export type ESConfig = typeof ES_CONFIG;
