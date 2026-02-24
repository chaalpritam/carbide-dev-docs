# Carbide Discovery Service - Developer Guide

## Overview

The Carbide Discovery Service is a standalone Node.js + TypeScript microservice that provides provider discovery and marketplace functionality for the Carbide Network. It acts as the central registry and matchmaker between storage providers and consumers.

## Features

- **Provider Registry**: Tracks all active storage provider nodes worldwide
- **Health Monitoring**: Automatic health checks every 30 seconds
- **Auto-removal**: Providers with 5+ failed health checks are automatically removed
- **Marketplace Search**: Find providers by region, tier, and reputation
- **Quote Aggregation**: Request quotes from multiple providers in parallel
- **Statistics**: Real-time marketplace metrics
- **CORS Enabled**: Ready for client applications

## Technology Stack

- **Runtime**: Node.js 20+
- **Framework**: Fastify 4.x (high-performance HTTP)
- **Language**: TypeScript 5.x
- **Validation**: Zod (runtime type checking)
- **Storage**: In-memory (with Redis migration path)
- **Logging**: Pino (structured logging)

## Installation

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Setup

1. **Clone the Repository**:
   ```bash
   git clone <carbide-discovery-service-repo>
   cd carbide-discovery-service
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

Create a `.env` file:

```env
# Server Configuration
PORT=9090
HOST=0.0.0.0
NODE_ENV=development

# Health Check Configuration
HEALTH_CHECK_INTERVAL=30000      # 30 seconds
PROVIDER_TIMEOUT=300000          # 5 minutes
MAX_FAILED_CHECKS=5              # Auto-remove after 5 failures

# Marketplace Configuration
MAX_SEARCH_RESULTS=100
DEFAULT_SEARCH_LIMIT=10

# Logging
LOG_LEVEL=info
PRETTY_PRINT=true                # Pretty logs in development
```

## API Reference

Base URL: `https://discovery.carbidenetwork.xyz/api/v1`

### Provider Management

#### Register Provider

Register a new storage provider in the network.

```http
POST /api/v1/providers
Content-Type: application/json

{
  "name": "My Provider",
  "tier": "home",
  "region": "northamerica",
  "endpoint": "http://192.168.1.100:8080",
  "capacity_total_bytes": 26843545600,
  "capacity_available_bytes": 26843545600,
  "price_per_gb_month": 0.005,
  "bandwidth_price_per_gb": 0.001,
  "advertise_address": "http://192.168.1.100:8080"
}
```

**Response**:
```json
{
  "id": "provider-abc123",
  "registered_at": "2025-01-01T00:00:00Z",
  "status": "active"
}
```

#### List Providers

List all active providers with optional filtering.

```http
GET /api/v1/providers?region=northamerica&tier=home&limit=10
```

**Query Parameters**:
- `region` (optional): Filter by region (northamerica, europe, asia, etc.)
- `tier` (optional): Filter by tier (home, professional, enterprise)
- `minReputation` (optional): Minimum reputation score (0.0-1.0)
- `limit` (optional): Maximum results (default: 10, max: 100)

**Response**:
```json
{
  "providers": [
    {
      "id": "provider-abc123",
      "name": "My Provider",
      "tier": "home",
      "region": "northamerica",
      "endpoint": "http://192.168.1.100:8080",
      "capacity_total_bytes": 26843545600,
      "capacity_available_bytes": 26843545600,
      "price_per_gb_month": 0.005,
      "reputation_score": 0.95,
      "uptime_percentage": 99.5,
      "last_heartbeat": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

#### Get Provider

Get detailed information about a specific provider.

```http
GET /api/v1/providers/:id
```

**Response**:
```json
{
  "id": "provider-abc123",
  "name": "My Provider",
  "tier": "home",
  "region": "northamerica",
  "endpoint": "http://192.168.1.100:8080",
  "capacity_total_bytes": 26843545600,
  "capacity_available_bytes": 26843545600,
  "price_per_gb_month": 0.005,
  "bandwidth_price_per_gb": 0.001,
  "reputation_score": 0.95,
  "uptime_percentage": 99.5,
  "registered_at": "2025-01-01T00:00:00Z",
  "last_heartbeat": "2025-01-01T00:00:00Z",
  "failed_health_checks": 0
}
```

#### Unregister Provider

Remove a provider from the network.

```http
DELETE /api/v1/providers/:id
```

**Response**:
```json
{
  "message": "Provider unregistered successfully"
}
```

#### Update Heartbeat

Update provider heartbeat to indicate it's still active.

```http
POST /api/v1/providers/:id/heartbeat
Content-Type: application/json

{
  "capacity_available_bytes": 26843545600,
  "uptime_percentage": 99.5
}
```

**Response**:
```json
{
  "message": "Heartbeat updated",
  "next_check_in": "2025-01-01T00:00:30Z"
}
```

### Marketplace

#### Search Providers

Search for providers matching specific criteria.

```http
GET /api/v1/marketplace/search?region=northamerica&tier=professional&minReputation=0.9
```

**Query Parameters**:
- `region` (optional): Preferred region
- `tier` (optional): Provider tier
- `minReputation` (optional): Minimum reputation (0.0-1.0)
- `maxPrice` (optional): Maximum price per GB/month
- `minCapacity` (optional): Minimum available capacity in bytes
- `limit` (optional): Maximum results (default: 10)

**Response**:
```json
{
  "providers": [
    {
      "id": "provider-abc123",
      "name": "My Provider",
      "tier": "professional",
      "region": "northamerica",
      "endpoint": "http://192.168.1.100:8080",
      "capacity_available_bytes": 26843545600,
      "price_per_gb_month": 0.007,
      "reputation_score": 0.95,
      "score": 8.5
    }
  ],
  "total": 1,
  "search_criteria": {
    "region": "northamerica",
    "tier": "professional",
    "minReputation": 0.9
  }
}
```

#### Request Quotes

Request storage quotes from multiple providers.

```http
POST /api/v1/marketplace/quotes
Content-Type: application/json

{
  "file_size_bytes": 104857600,
  "duration_days": 30,
  "replication_factor": 3,
  "region": "northamerica",
  "tier": "home"
}
```

**Response**:
```json
{
  "quotes": [
    {
      "provider_id": "provider-abc123",
      "provider_name": "My Provider",
      "price_total": 0.015,
      "price_storage": 0.005,
      "price_bandwidth": 0.001,
      "estimated_retrieval_time_ms": 500,
      "reputation_score": 0.95
    }
  ],
  "total_cost_estimate": 0.045,
  "recommended_providers": ["provider-abc123", "provider-def456", "provider-ghi789"]
}
```

#### Get Marketplace Statistics

Get real-time marketplace metrics.

```http
GET /api/v1/marketplace/stats
```

**Response**:
```json
{
  "total_providers": 150,
  "active_providers": 145,
  "total_capacity_bytes": 4294967296000,
  "available_capacity_bytes": 3221225472000,
  "average_price_per_gb_month": 0.006,
  "average_reputation": 0.92,
  "providers_by_region": {
    "northamerica": 60,
    "europe": 50,
    "asia": 35
  },
  "providers_by_tier": {
    "home": 80,
    "professional": 50,
    "enterprise": 20
  }
}
```

### Health

#### Service Health

Check the health status of the discovery service.

```http
GET /api/v1/health
```

**Response**:
```json
{
  "status": "healthy",
  "uptime_seconds": 86400,
  "providers_registered": 150,
  "providers_active": 145,
  "last_health_check": "2025-01-01T00:00:00Z"
}
```

## Data Models

### Provider

```typescript
interface Provider {
  id: string;
  name: string;
  tier: 'home' | 'professional' | 'enterprise';
  region: string;
  endpoint: string;
  capacity_total_bytes: number;
  capacity_available_bytes: number;
  price_per_gb_month: number;
  bandwidth_price_per_gb: number;
  reputation_score: number;
  uptime_percentage: number;
  registered_at: string;
  last_heartbeat: string;
  failed_health_checks: number;
  advertise_address: string;
}
```

### ProviderTier

```typescript
type ProviderTier = 'home' | 'professional' | 'enterprise';
```

### Region

```typescript
type Region =
  | 'northamerica'
  | 'southamerica'
  | 'europe'
  | 'asia'
  | 'africa'
  | 'oceania';
```

## Health Check System

### Automatic Health Checks

The discovery service automatically performs health checks on all registered providers:

1. **Interval**: Every 30 seconds (configurable)
2. **Timeout**: 5 seconds per provider
3. **Endpoint**: `GET {provider.endpoint}/api/v1/health`
4. **Failure Handling**:
   - Increment `failed_health_checks` counter
   - After 5 failures: Auto-remove provider
   - Reset counter on successful check

### Health Check Flow

```typescript
async function performHealthChecks() {
  for (const provider of providers.values()) {
    try {
      const response = await fetch(`${provider.endpoint}/api/v1/health`, {
        timeout: 5000
      });

      if (response.ok) {
        provider.failed_health_checks = 0;
        provider.last_heartbeat = new Date().toISOString();
      } else {
        provider.failed_health_checks++;
      }
    } catch (error) {
      provider.failed_health_checks++;
    }

    // Auto-remove after max failures
    if (provider.failed_health_checks >= MAX_FAILED_CHECKS) {
      providers.delete(provider.id);
      logger.warn(`Provider ${provider.id} removed due to health check failures`);
    }
  }
}
```

## Deployment

### Local Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 9090

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t carbide-discovery .
docker run -p 9090:9090 --env-file .env carbide-discovery
```

### Railway Deployment

1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Auto-deploys on push to main branch

Railway configuration:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/v1/health"
restartPolicyType = "ON_FAILURE"
```

### Render Deployment

1. Create new Web Service
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Environment variables: Add from `.env` file

## Monitoring and Logging

### Structured Logging

The service uses Pino for structured JSON logging:

```typescript
logger.info('Provider registered', {
  providerId: provider.id,
  tier: provider.tier,
  region: provider.region
});
```

### Log Levels

- **error**: Critical errors requiring immediate attention
- **warn**: Warning messages (e.g., provider failures)
- **info**: General information (e.g., provider registration)
- **debug**: Detailed debugging information
- **trace**: Very detailed trace information

### Metrics

Key metrics to monitor:

- **Provider Count**: Total active providers
- **Health Check Performance**: Success rate and latency
- **API Request Latency**: p50, p95, p99
- **Error Rate**: Failed requests per minute
- **Memory Usage**: Service memory consumption

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Load Testing

Using autocannon:
```bash
npm install -g autocannon

# Test provider registration
autocannon -c 100 -d 30 https://discovery.carbidenetwork.xyz/api/v1/providers
```

## Security

### API Authentication

For production, implement API key authentication:

```typescript
fastify.addHook('onRequest', async (request, reply) => {
  const apiKey = request.headers['x-api-key'];

  if (!apiKey || !isValidApiKey(apiKey)) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});
```

### Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
import rateLimit from '@fastify/rate-limit';

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});
```

### Input Validation

All inputs are validated using Zod schemas:

```typescript
const ProviderSchema = z.object({
  name: z.string().min(1).max(100),
  tier: z.enum(['home', 'professional', 'enterprise']),
  region: z.string(),
  endpoint: z.string().url(),
  capacity_total_bytes: z.number().positive(),
  // ...
});
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Check what's using port 9090
lsof -i :9090

# Change port in .env
PORT=9091
```

#### TypeScript Compilation Errors

```bash
# Clear build cache
rm -rf dist node_modules
npm install
npm run build
```

#### Health Checks Failing

Check provider endpoints are accessible:
```bash
curl http://provider-endpoint:8080/api/v1/health
```

## Performance Optimization

### In-Memory Storage

Current implementation uses in-memory Map for providers. For production at scale:

```typescript
// Migrate to Redis
import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379
});

// Store provider
await redis.hset(`provider:${id}`, provider);

// Get provider
const provider = await redis.hgetall(`provider:${id}`);
```

### Caching

Implement caching for expensive operations:

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 });

// Cache marketplace stats
const stats = cache.get('marketplace:stats');
if (!stats) {
  const freshStats = calculateStats();
  cache.set('marketplace:stats', freshStats);
  return freshStats;
}
```

## Contributing

Contributions are welcome! Please:

1. Follow TypeScript best practices
2. Use ESLint and Prettier for formatting
3. Write tests for new features
4. Update API documentation
5. Submit PR with clear description

## License

MIT License - see LICENSE file for details.
