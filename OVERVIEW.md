# Carbide Network - Developer Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Components](#components)
4. [Quick Start](#quick-start)
5. [Development Guides](#development-guides)
6. [API Reference](#api-reference)
7. [Contributing](#contributing)

## Introduction

**Carbide Network** is a decentralized storage marketplace that allows anyone to contribute storage capacity and earn rewards, while users get affordable, secure, and customizable data storage with user-defined replication factors and pricing tiers.

### Key Features

- **Decentralized Storage Marketplace**: Connect storage providers with consumers
- **User-Defined Replication**: Choose your own replication factors and pricing tiers
- **Multi-Platform Support**: iOS, macOS, and Desktop applications
- **Optional Client-Side Encryption**: AES-256-GCM encryption with keychain storage
- **Provider Discovery**: Intelligent provider matching based on region, tier, and reputation
- **Real-Time Monitoring**: Track storage usage, earnings, and system health

### Current Status

The Carbide Network v1.0.0 has successfully implemented:
- ✅ Fully functional storage provider nodes
- ✅ Desktop GUI application for provider management
- ✅ Discovery service with health monitoring
- ✅ iOS SDK for client applications
- ✅ macOS client applications (Carbide and CarbideDrive)
- ✅ Basic reputation system
- ⏳ Blockchain integration (planned for Phase 3)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────┬───────────────────────────────────────┤
│     Mobile Clients      │         Desktop Clients               │
│   (iOS SDK)             │   (Carbide, CarbideDrive)             │
└─────────────────────────┴───────────────────────────────────────┘
                                    │
                      ┌─────────────┼─────────────┐
                      │             │             │
              ┌───────▼──┐   ┌─────▼──┐   ┌──────▼───┐
              │Discovery │   │Gateway │   │Reputation│
              │  Service │   │ Nodes  │   │  System  │
              └──────────┘   └────────┘   └──────────┘
                      │             │             │
    ┌─────────────────┴─────────────┼─────────────┴─────────────────┐
    │                   Carbide Network Layer                        │
    ├────────────────────────────────────────────────────────────────┤
    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────┐  │
    │  │Provider  │ │Provider  │ │Provider  │ │Provider  │ │... │  │
    │  │  Node    │ │  Node    │ │  Node    │ │  Node    │ │    │  │
    │  │ (Home)   │ │ (Office) │ │  (VPS)   │ │(Datactr) │ │    │  │
    │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────┘  │
    └────────────────────────────────────────────────────────────────┘
                                    │
    ┌────────────────────────────────────────────────────────────────┐
    │             Blockchain Layer (Future)                          │
    ├────────────────────────────────────────────────────────────────┤
    │    Smart Contracts • Payments • Reputation • Governance        │
    └────────────────────────────────────────────────────────────────┘
```

## Components

The Carbide Network consists of five main repositories:

### 1. carbide-node
**Language**: Rust + TypeScript (GUI)
**Purpose**: Storage provider node with desktop management interface

The provider node is the core of the Carbide Network, allowing anyone to contribute storage space and earn rewards.

**Key Features**:
- HTTP API for file storage operations
- Automatic health monitoring and reporting
- Beautiful desktop GUI for configuration and monitoring
- Provider tier support (Home, Professional, Enterprise)
- Real-time earnings tracking and statistics
- System tray integration for background operation

**Technologies**:
- Rust for high-performance backend
- Tauri for cross-platform desktop application
- React + TypeScript for GUI
- RESTful API architecture

### 2. carbide-discovery-service
**Language**: TypeScript (Node.js)
**Purpose**: Central discovery and marketplace coordination

The discovery service acts as the matchmaker between storage providers and consumers.

**Key Features**:
- Provider registry and health monitoring
- Automatic health checks every 30 seconds
- Marketplace search and filtering by region/tier
- Quote aggregation from multiple providers
- Real-time statistics and analytics
- CORS-enabled REST API

**Technologies**:
- Node.js 20+ runtime
- Fastify web framework
- TypeScript for type safety
- Zod for runtime validation
- In-memory storage (Redis migration path)

### 3. carbide-ios-sdk
**Language**: Swift
**Purpose**: iOS/macOS SDK for integrating with Carbide Network

The iOS SDK provides a simple, native Swift interface for iOS and macOS applications.

**Key Features**:
- Provider discovery and selection
- File upload/download with progress tracking
- Optional AES-256-GCM client-side encryption
- Secure key storage in iOS Keychain
- Zero external dependencies
- SwiftUI integration examples

**Technologies**:
- Swift 5.9+
- Native URLSession for networking
- CryptoKit for encryption
- Swift Package Manager

### 4. Carbide
**Language**: Swift (SwiftUI)
**Purpose**: Premium iOS/macOS file management application

A modern, Google Drive-inspired interface for managing files in the Carbide Network.

**Key Features**:
- Intelligent storage dashboard
- Full CRUD support for files and folders
- Smart file categorization (Images, Videos, Documents, Audio)
- SwiftData persistence
- Premium Material Design aesthetics
- Real-time storage visualization

**Technologies**:
- SwiftUI for declarative UI
- SwiftData for persistence
- iOS 17.0+ / macOS 13.0+

### 5. CarbideDrive
**Language**: Swift (SwiftUI)
**Purpose**: macOS desktop client for file synchronization

A native macOS application for seamless cloud storage synchronization.

**Key Features**:
- Real-time folder synchronization
- Flexible Grid and List views
- Background sync with configurable intervals
- Native macOS design with Material 3 aesthetics
- Carbide Network status indicators
- Customizable sync settings

**Technologies**:
- SwiftUI for native macOS UI
- SwiftData for metadata storage
- Combine for reactive programming
- REST API integration

## Quick Start

### For Storage Providers

1. **Install the Provider Node**:
   ```bash
   # Clone the repository
   git clone <carbide-node-repo>
   cd carbide-node

   # Install dependencies
   cargo build --release

   # Run the GUI installer (recommended)
   cd gui
   npm install
   npm run tauri:build
   ```

2. **Configure Your Provider**:
   - Launch the desktop application
   - Complete the installation wizard
   - Set storage capacity, pricing, and region
   - Start earning!

### For Developers (iOS/macOS)

1. **Add the SDK to Your Project**:
   ```swift
   dependencies: [
       .package(url: "https://github.com/carbide/carbide-ios-sdk", from: "1.0.0")
   ]
   ```

2. **Initialize the Client**:
   ```swift
   import CarbideSDK

   let client = CarbideClient(
       discoveryServiceURL: URL(string: "https://discovery.carbide.network")!
   )
   ```

3. **Upload a File**:
   ```swift
   let result = try await client.uploadFile(
       from: fileURL,
       preferredRegion: .northAmerica,
       encrypt: true,
       progress: { progress in
           print("Upload: \(Int(progress * 100))%")
       }
   )
   ```

### For Discovery Service Operators

1. **Deploy the Discovery Service**:
   ```bash
   cd carbide-discovery-service
   npm install

   # Configure environment
   cp .env.example .env

   # Start the service
   npm run dev
   ```

## Development Guides

For detailed development guides, see:
- [Provider Node Development](./PROVIDER_NODE.md)
- [Discovery Service Development](./DISCOVERY_SERVICE.md)
- [iOS SDK Development](./IOS_SDK.md)
- [Client Applications Development](./CLIENT_APPS.md)
- [API Reference](./API_REFERENCE.md)

## API Reference

### Discovery Service API

Base URL: `https://discovery.carbidenetwork.xyz/api/v1`

**Provider Management**:
- `POST /api/v1/providers` - Register a provider
- `GET /api/v1/providers` - List all providers
- `GET /api/v1/providers/:id` - Get specific provider
- `DELETE /api/v1/providers/:id` - Unregister provider
- `POST /api/v1/providers/:id/heartbeat` - Update heartbeat

**Marketplace**:
- `GET /api/v1/marketplace/search` - Search providers
- `POST /api/v1/marketplace/quotes` - Request quotes
- `GET /api/v1/marketplace/stats` - Get statistics

**Health**:
- `GET /api/v1/health` - Service health status

### Provider Node API

Base URL: `https://provider.example.carbidenetwork.xyz/api/v1`

**File Operations**:
- `POST /api/v1/files/upload` - Upload a file
- `GET /api/v1/files/:id` - Download a file
- `DELETE /api/v1/files/:id` - Delete a file
- `GET /api/v1/files` - List stored files

**Provider Info**:
- `GET /api/v1/provider/info` - Get provider information
- `GET /api/v1/provider/stats` - Get storage statistics
- `GET /api/v1/health` - Health check

## Contributing

We welcome contributions to all Carbide Network repositories!

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **Rust**: Follow the official Rust style guide, use `rustfmt`
- **TypeScript**: Use ESLint and Prettier
- **Swift**: Follow Swift API Design Guidelines

### Testing

- Write tests for all new features
- Ensure existing tests pass before submitting PR
- Aim for >80% code coverage

## License

All Carbide Network components are released under the MIT License.

## Support

- **Documentation**: https://docs.carbide.network
- **Issues**: File issues in the respective repository
- **Community**: Join our Discord server
- **Email**: support@carbide.network

---

**Built with ❤️ by the Carbide Team**
