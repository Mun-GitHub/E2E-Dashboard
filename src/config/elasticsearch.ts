// Elasticsearch / OpenSearch Configuration
// These values can be overridden via environment variables

// In development, we use a Vite proxy to avoid CORS issues
const isDev = import.meta.env.DEV;

// Check if we have a proxy URL configured for production
// This allows using a serverless function or backend proxy to avoid CORS
const proxyUrl = import.meta.env.VITE_ES_PROXY_URL;

// Helper to resolve the host URL
// Use /es proxy path for both dev and preview (Vite handles the proxy)
// In true production, use the configured proxy URL or ES_HOST
const resolveHostUrl = (): string => {
  // In dev mode, use the Vite dev server proxy
  if (isDev) {
    return '/es';
  }
  
  // In production builds, check for explicit proxy URL first
  if (proxyUrl) {
    return proxyUrl;
  }
  
  // Check for direct ES_HOST (for non-Vite production deployments)
  const esHost = import.meta.env.VITE_ES_HOST;
  if (esHost) {
    return esHost;
  }
  
  // Default to /es for Vite preview compatibility
  // Vite preview server also has the proxy configured
  return '/es';
};

export const ES_CONFIG = {
  // In dev mode, use the Vite proxy path
  // In production, use proxy URL if available, otherwise direct URL
  // NOTE: Direct URL will fail due to CORS unless ES is configured to allow it
  host: resolveHostUrl(),
  
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
  
  // Enable/disable Elasticsearch
  // In production without a proxy, this should be false to avoid CORS errors
  // Automatically disable in production if no proxy URL is configured
  enabled: import.meta.env.VITE_ES_ENABLED === 'true' || (isDev && import.meta.env.VITE_ES_ENABLED !== 'false'),
  
  // Use proxy in development (auth is handled by Vite proxy)
  // Also true if a production proxy URL is configured
  useProxy: isDev || !!proxyUrl,
};

export type ESConfig = typeof ES_CONFIG;
