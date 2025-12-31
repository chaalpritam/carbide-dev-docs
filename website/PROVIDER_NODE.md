# Carbide Provider Node - Developer Guide

## Overview

The Carbide Provider Node (`carbide-node`) is a high-performance Rust-based storage provider that allows anyone to contribute storage capacity to the Carbide Network and earn rewards. It includes a beautiful desktop GUI built with Tauri and React for easy configuration and monitoring.

## Architecture

### Backend (Rust)

The provider node is built with Rust for maximum performance and reliability:

```
src/
├── main.rs                 # Application entry point
├── commands.rs             # Tauri command handlers
├── provider_manager.rs     # Provider process management
├── system_info.rs          # System information utilities
├── api/                    # HTTP API layer
├── storage/                # Storage engine
├── config/                 # Configuration management
└── telemetry/              # Monitoring and metrics
```

### Frontend (React + TypeScript)

The GUI provides an intuitive interface for provider management:

```
gui/src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard view
│   ├── InstallWizard.tsx      # Installation wizard
│   ├── StatusCard.tsx         # Status display
│   ├── EarningsChart.tsx      # Earnings visualization
│   ├── StorageCard.tsx        # Storage management
│   ├── SystemMetricsCard.tsx  # System monitoring
│   ├── LogsPanel.tsx          # Log viewer
│   └── SettingsPanel.tsx      # Configuration panel
├── types.ts                   # TypeScript types
├── App.tsx                    # Root component
└── main.tsx                   # Entry point
```

## Installation

### Prerequisites

- **macOS**: 10.15+ (Catalina or newer)
- **Rust**: Latest stable toolchain
- **Node.js**: 18+
- **Xcode Command Line Tools**

### Development Setup

1. **Clone the Repository**:
   ```bash
   git clone <carbide-node-repo>
   cd carbide-node
   ```

2. **Install Rust Dependencies**:
   ```bash
   cargo build --release
   ```

3. **Install GUI Dependencies**:
   ```bash
   cd gui
   npm install
   ```

4. **Install Tauri CLI**:
   ```bash
   npm install -g @tauri-apps/cli
   ```

5. **Run Development Server**:
   ```bash
   npm run tauri:dev
   ```

### Building for Production

1. **Build the Application**:
   ```bash
   cd gui
   npm run tauri:build
   ```

2. **Locate the Built App**:
   ```bash
   # App bundle will be at:
   src-tauri/target/release/bundle/macos/Carbide\ Provider.app
   ```

3. **Install**:
   ```bash
   cp -r src-tauri/target/release/bundle/macos/Carbide\ Provider.app /Applications/
   ```

## Configuration

### Provider Configuration File

Located at `~/.carbide/provider-config.toml`:

```toml
[provider]
name = "My Carbide Provider"
tier = "home"  # home, professional, enterprise
region = "northamerica"
storage_path = "/path/to/storage"
capacity_gb = 25

[pricing]
price_per_gb_month = 0.005
bandwidth_price_per_gb = 0.001

[network]
port = 8080
advertise_address = "http://192.168.1.100:8080"
discovery_endpoints = ["http://localhost:9090"]

[monitoring]
health_check_interval_secs = 30
log_level = "info"
enable_metrics = true
```

### Environment Variables

```bash
# Discovery service endpoint
DISCOVERY_URL=http://localhost:9090

# Storage configuration
STORAGE_PATH=/path/to/storage
STORAGE_CAPACITY=25GB

# Network configuration
PROVIDER_PORT=8080
ADVERTISE_ADDRESS=http://192.168.1.100:8080

# Logging
RUST_LOG=info
```

## Provider Tiers

### Home Tier
- **Target**: Home users with spare disk space
- **Uptime Guarantee**: 90-95%
- **Recommended Capacity**: 10-100 GB
- **Pricing**: $0.002-0.005 per GB/month

### Professional Tier
- **Target**: Small businesses, enthusiasts
- **Uptime Guarantee**: 95-99%
- **Recommended Capacity**: 100GB-1TB
- **Requirements**: Backup power optional
- **Pricing**: $0.005-0.01 per GB/month

### Enterprise Tier
- **Target**: Data centers, cloud providers
- **Uptime Guarantee**: 99%+
- **Recommended Capacity**: 1TB+
- **Requirements**: Backup power, SLA guarantees
- **Pricing**: $0.01+ per GB/month

## API Reference

### Provider HTTP API

Base URL: `http://localhost:8080/api/v1`

#### File Upload

```http
POST /api/v1/files/upload
Content-Type: multipart/form-data

file: <binary data>
metadata: {
  "filename": "example.txt",
  "size": 1024,
  "hash": "sha256:abc123..."
}
```

**Response**:
```json
{
  "file_id": "f1e2d3c4...",
  "size": 1024,
  "stored_at": "2025-01-01T00:00:00Z"
}
```

#### File Download

```http
GET /api/v1/files/{file_id}
```

**Response**: Binary file data

#### File Deletion

```http
DELETE /api/v1/files/{file_id}
Authorization: Bearer <delete_key>
```

#### List Files

```http
GET /api/v1/files
```

**Response**:
```json
{
  "files": [
    {
      "id": "f1e2d3c4...",
      "filename": "example.txt",
      "size": 1024,
      "stored_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total_size": 1024,
  "file_count": 1
}
```

#### Provider Info

```http
GET /api/v1/provider/info
```

**Response**:
```json
{
  "id": "provider-123",
  "name": "My Provider",
  "tier": "home",
  "region": "northamerica",
  "capacity_total": 26843545600,
  "capacity_used": 1024,
  "capacity_available": 26843544576,
  "price_per_gb_month": 0.005,
  "uptime_percentage": 99.5,
  "reputation_score": 0.95
}
```

#### Storage Statistics

```http
GET /api/v1/provider/stats
```

**Response**:
```json
{
  "total_files": 100,
  "total_size_bytes": 10485760,
  "available_bytes": 16358321152,
  "utilization_percentage": 0.06,
  "earnings_today": 0.05,
  "earnings_month": 1.50,
  "bandwidth_used_today_bytes": 104857600
}
```

#### Health Check

```http
GET /api/v1/health
```

**Response**:
```json
{
  "status": "healthy",
  "uptime_seconds": 86400,
  "disk_available": true,
  "network_reachable": true
}
```

## Desktop GUI Features

### Installation Wizard

The installation wizard guides new users through setup:

1. **Welcome Screen**: Introduction to Carbide Network
2. **Configuration**: Set storage capacity, pricing, and tier
3. **Installation**: Automated setup with progress tracking
4. **Completion**: Ready to start earning

### Dashboard

Real-time monitoring interface:

- **Provider Status**: Live status with visual indicators
- **Earnings Tracking**: Daily/monthly earnings with charts
- **Storage Management**: Visual storage usage
- **System Metrics**: CPU, memory, and disk monitoring
- **Reputation Score**: Live reputation tracking

### Settings Panel

Configure your provider:

- **Provider Info**: Name, tier, region, storage allocation
- **Network Settings**: Discovery endpoints, advertise address
- **Pricing**: Storage and bandwidth pricing
- **Advanced**: Log levels, health check intervals

### Logs Panel

Real-time log viewing:

- **Live Streaming**: Real-time log updates
- **Syntax Highlighting**: Color-coded log levels
- **Filtering**: Search and filter by level or content
- **Export**: Download logs for debugging

### System Tray

Background operation features:

- **Minimize to Tray**: Run in background
- **Quick Controls**: Start/stop provider from tray
- **Auto-start**: Launch on system boot
- **Notifications**: Important event notifications

## Development

### Running Tests

```bash
# Rust tests
cargo test

# GUI tests
cd gui
npm test
```

### Building Documentation

```bash
cargo doc --open
```

### Debugging

Enable debug logging:

```bash
RUST_LOG=debug npm run tauri:dev
```

### Performance Profiling

```bash
cargo build --release
cargo run --release -- --profile
```

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
rm -rf target node_modules
cargo clean
npm install
npm run tauri:build
```

#### Permission Errors

macOS may require permission approval:
- Go to System Preferences > Security & Privacy
- Allow Carbide Provider to access files

#### Port Conflicts

```bash
# Check for port conflicts
lsof -i :8080

# Change port in config
# Edit ~/.carbide/provider-config.toml
```

#### Storage Issues

```bash
# Verify storage path permissions
ls -la /path/to/storage

# Check disk space
df -h
```

## Monitoring and Metrics

### Prometheus Metrics

Available at `http://localhost:8080/metrics`:

- `carbide_storage_capacity_bytes` - Total storage capacity
- `carbide_storage_used_bytes` - Storage used
- `carbide_files_total` - Total number of files
- `carbide_earnings_total` - Total earnings
- `carbide_uptime_seconds` - Provider uptime

### Health Checks

The provider automatically:
- Reports to discovery service every 30 seconds
- Monitors disk space and availability
- Tracks uptime and reputation
- Logs all operations

## Security Considerations

### File Integrity

- All files are verified using BLAKE3 hashing
- Content-addressed storage prevents tampering
- Automatic integrity checks on retrieval

### Network Security

- HTTPS support for production deployments
- API authentication with bearer tokens
- Rate limiting to prevent abuse

### Data Privacy

- No metadata inspection of stored files
- Optional client-side encryption support
- Minimal logging for privacy

## Production Deployment

### Recommended Setup

1. **Hardware**:
   - Mac mini (M1 or newer recommended)
   - 256GB+ SSD for storage
   - Reliable internet connection (10+ Mbps upload)

2. **Network**:
   - Static IP or dynamic DNS
   - Port forwarding configured (8080)
   - Firewall rules for security

3. **Monitoring**:
   - Set up Prometheus for metrics collection
   - Configure alerts for downtime
   - Regular backup of provider configuration

### Auto-Start Configuration

macOS launch agent configuration:

```bash
# Create launch agent
cat > ~/Library/LaunchAgents/com.carbide.provider.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.carbide.provider</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Applications/Carbide Provider.app/Contents/MacOS/carbide-provider</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# Load the agent
launchctl load ~/Library/LaunchAgents/com.carbide.provider.plist
```

## Contributing

Contributions are welcome! Please:

1. Follow the Rust API Design Guidelines
2. Use `rustfmt` for code formatting
3. Write tests for new features
4. Update documentation as needed
5. Submit PR with clear description

## License

MIT License - see LICENSE file for details.
