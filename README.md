# E2E-Dashboard

# AM2.0 DAM E2E Test Dashboard

Dashboard for visualizing automation test results for Contentstack suite of products

## Features

- **Dashboard Overview**: Key Performance Indicators, test suite trends, and recent activity
- **Test Execution History**: Chronological log of all test suite executions with filtering and sorting
- **Automation Roadmap**: Strategic overview of test planning, priority, and automation progress
- **Suite Results**: Detailed view of test results grouped by suite with expandable details
- **Flakiness Detective**: AI-powered analysis to identify flaky test patterns
- **Performance History**: Historical E2E testing reports and performance metrics

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **date-fns** for date formatting
- **Elasticsearch** for data storage (with local JSON fallback)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Elasticsearch 8.x (optional, falls back to local data)

### Installation

```bash
cd dashboard
npm install
```

### Development

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Data Sources

The dashboard supports two data sources:

### 1. Elasticsearch (Primary)

When Elasticsearch is available, the dashboard fetches real-time data from ES indices:

| Index | Description |
|-------|-------------|
| `test_results` | Individual test case results |
| `test_scenarios` | Test scenario definitions |
| `historical_runs` | Historical test run data |
| `suite_data` | Suite-level automation metrics |

### 2. Local JSON (Fallback)

If Elasticsearch is unavailable, the dashboard falls back to JSON files in `public/data/`:

- `test_results.json`
- `test_scenarios.json`
- `historical_runs.json`
- `suite_data.json`

## Elasticsearch Configuration

### Quick Setup

1. **Copy environment file:**
   ```bash
   cp env.example .env.local
   ```

2. **Edit `.env.local` with your Elasticsearch settings:**
   ```env
   VITE_ES_HOST=http://localhost:9200
   VITE_ES_ENABLED=true
   
   # Optional: Authentication
   VITE_ES_USERNAME=elastic
   VITE_ES_PASSWORD=your-password
   
   # Or use API Key (recommended for production)
   VITE_ES_API_KEY=your-api-key
   ```

3. **Create Elasticsearch indices:**
   ```bash
   cd ../elasticsearch
   ./setup_elasticsearch.sh
   ```

4. **Import data:**
   ```bash
   pip install elasticsearch
   python3 import_data_to_es.py
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ES_HOST` | Elasticsearch URL | `http://localhost:9200` |
| `VITE_ES_ENABLED` | Enable ES (`true`/`false`) | `true` |
| `VITE_ES_USERNAME` | Basic auth username | - |
| `VITE_ES_PASSWORD` | Basic auth password | - |
| `VITE_ES_API_KEY` | API key (alternative to basic auth) | - |
| `VITE_ES_INDEX_TEST_RESULTS` | Test results index name | `test_results` |
| `VITE_ES_INDEX_TEST_SCENARIOS` | Test scenarios index name | `dam_test_scenarios` |
| `VITE_ES_INDEX_HISTORICAL_RUNS` | Historical runs index name | `dam_historical_runs` |
| `VITE_ES_INDEX_SUITE_DATA` | Suite data index name | `dam_suite_data` |

### Disabling Elasticsearch

To use only local data:

```env
VITE_ES_ENABLED=false
```

### Data Source Indicator

The dashboard shows the current data source in the top-right corner:
- 🟢 **Elasticsearch** - Connected to ES
- 🟡 **Local Data** - Using JSON fallback

## Project Structure

```
dashboard/
├── public/
│   └── data/              # Local JSON data files (fallback)
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/            # Configuration (Elasticsearch, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # Data services (ES, local)
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── env.example            # Example environment file
└── index.html             # HTML template
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Dashboard UI                          │
│  (React + TypeScript + Tailwind + Recharts)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Service                            │
│  - Checks ES availability                                    │
│  - Routes to appropriate source                              │
│  - Handles fallback logic                                    │
└─────────────────────────────────────────────────────────────┘
                    │                    │
          ┌────────┴────────┐   ┌───────┴───────┐
          ▼                 │   ▼               │
┌──────────────────┐       │   ┌──────────────────┐
│   Elasticsearch  │       │   │   Local JSON     │
│     Service      │       │   │     Service      │
│                  │       │   │                  │
│  - API queries   │       │   │  - File fetch    │
│  - Aggregations  │       │   │  - Caching       │
└──────────────────┘       │   └──────────────────┘
          │                │            │
          ▼                │            ▼
┌──────────────────┐       │   ┌──────────────────┐
│  Elasticsearch   │       │   │  public/data/    │
│    Cluster       │       │   │   JSON files     │
└──────────────────┘       │   └──────────────────┘
                           │
                     (Fallback)
```

## License

Internal use only - Contentstack products
