# Carbide Network - Developer Documentation

Welcome to the Carbide Network developer documentation! This comprehensive guide covers all aspects of building and integrating with the Carbide decentralized storage network.

## What is Carbide Network?

Carbide Network is a **decentralized storage marketplace** that connects storage providers with consumers. Anyone can contribute storage capacity and earn rewards, while users get affordable, secure, and customizable data storage with user-defined replication factors and pricing tiers.

## Documentation Structure

This documentation is organized into the following sections:

### Core Documentation

- **[Overview](./OVERVIEW.md)** - Architecture, components, and quick start guide
- **[Provider Node](./PROVIDER_NODE.md)** - Complete guide for running a storage provider
- **[Discovery Service](./DISCOVERY_SERVICE.md)** - API reference and deployment guide
- **[iOS SDK](./IOS_SDK.md)** - Swift SDK for iOS and macOS integration
- **[Client Applications](./CLIENT_APPS.md)** - Carbide and CarbideDrive development

## Quick Links

### For Storage Providers
👉 [Start earning with your storage space](./PROVIDER_NODE.md#installation)

### For Developers
👉 [Integrate Carbide into your iOS/macOS app](./IOS_SDK.md#quick-start)

### For Discovery Service Operators
👉 [Deploy a discovery service](./DISCOVERY_SERVICE.md#deployment)

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
    │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────┘  │
    └────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. carbide-node
**Language**: Rust + TypeScript (GUI)
High-performance storage provider node with desktop management interface.

**Key Features**:
- HTTP API for file operations
- Automatic health monitoring
- Beautiful desktop GUI
- Real-time earnings tracking

[📖 Read the full guide →](./PROVIDER_NODE.md)

### 2. carbide-discovery-service
**Language**: TypeScript (Node.js)
Central discovery and marketplace coordination service.

**Key Features**:
- Provider registry
- Health monitoring
- Marketplace search
- Quote aggregation

[📖 Read the full guide →](./DISCOVERY_SERVICE.md)

### 3. carbide-ios-sdk
**Language**: Swift
Native iOS/macOS SDK for integrating with Carbide Network.

**Key Features**:
- Provider discovery
- File upload/download
- Client-side encryption
- Keychain integration

[📖 Read the full guide →](./IOS_SDK.md)

### 4. Carbide
**Language**: Swift (SwiftUI)
Premium iOS/macOS file management application.

**Key Features**:
- Intelligent storage dashboard
- Full CRUD support
- Smart categorization
- Material Design UI

[📖 Read the full guide →](./CLIENT_APPS.md#carbide---premium-file-management)

### 5. CarbideDrive
**Language**: Swift (SwiftUI)
macOS desktop client for file synchronization.

**Key Features**:
- Real-time sync
- Background operation
- Native macOS design
- Customizable settings

[📖 Read the full guide →](./CLIENT_APPS.md#carbidedrive---desktop-synchronization)

## Getting Started

### For Storage Providers

1. Download and install the Carbide Provider Node
2. Configure storage capacity and pricing
3. Start earning rewards automatically

```bash
cd carbide-node/gui
npm run tauri:build
# Install the built application
```

[📖 Full installation guide →](./PROVIDER_NODE.md#installation)

### For iOS/macOS Developers

1. Add the Carbide SDK to your project
2. Initialize the client
3. Upload and download files

```swift
import CarbideSDK

let client = CarbideClient()
let result = try await client.uploadFile(from: fileURL, encrypt: true)
```

[📖 Full integration guide →](./IOS_SDK.md#quick-start)

### For Discovery Service Operators

1. Clone the repository
2. Configure environment
3. Deploy to your cloud platform

```bash
cd carbide-discovery-service
npm install
npm run dev
```

[📖 Full deployment guide →](./DISCOVERY_SERVICE.md#deployment)

## API Reference

### Discovery Service API
- **Base URL**: `https://discovery.carbidenetwork.xyz/api/v1`
- **Provider Management**: Register, list, update, remove providers
- **Marketplace**: Search, quotes, statistics
- **Health**: Service health checks

[📖 Complete API reference →](./DISCOVERY_SERVICE.md#api-reference)

### Provider Node API
- **Base URL**: `https://provider.example.carbidenetwork.xyz/api/v1`
- **File Operations**: Upload, download, delete files
- **Provider Info**: Statistics, health, configuration

[📖 Complete API reference →](./PROVIDER_NODE.md#api-reference)

## Technology Stack

| Component | Languages | Key Technologies |
|-----------|-----------|------------------|
| Provider Node | Rust, TypeScript | Axum, Tauri, React |
| Discovery Service | TypeScript | Node.js, Fastify, Zod |
| iOS SDK | Swift | URLSession, CryptoKit |
| Carbide | Swift | SwiftUI, SwiftData |
| CarbideDrive | Swift | SwiftUI, Combine |

## Current Status (v1.1.0)

- ✅ Provider nodes with desktop GUI
- ✅ Discovery service with health monitoring
- ✅ iOS SDK with encryption, retry logic, and configurable timeouts
- ✅ macOS client applications (Carbide and CarbideDrive)
- ✅ Production-ready CarbideSDK (v1.1.0)
- ✅ Basic reputation system
- ✅ Automatic provider failover in clients
- ⏳ BLAKE3 hashing support (v1.2)
- ⏳ Multi-provider replication (v1.3)
- ⏳ Blockchain integration (Phase 3)

## Contributing

We welcome contributions to all Carbide Network repositories!

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

[📖 Contribution guidelines →](./OVERVIEW.md#contributing)

## Community

- **Documentation**: https://docs.carbide.network
- **GitHub**: https://github.com/carbide
- **Discord**: Join our community server
- **Email**: support@carbide.network

## License

All Carbide Network components are released under the MIT License.

---

## Documentation Website

### 🌐 Live Documentation Site

This repository includes a complete, production-ready documentation website!

**Quick Start**:
```bash
cd website
./serve.sh
```

Then open http://localhost:8000

**Deploy**:
- [📖 Complete Setup Guide](./WEBSITE_SETUP.md)
- Deploy to Netlify in 2 minutes
- Deploy to Vercel, GitHub Pages, or Cloudflare Pages
- Custom domain support

**Features**:
- Modern, responsive design with dark mode
- Syntax-highlighted code blocks
- Auto-generated table of contents
- Search functionality
- Mobile-friendly navigation
- Fast loading (<2s)

[🚀 Deploy Your Documentation Website](./WEBSITE_SETUP.md)

---

**Ready to get started?** Choose your path:
- 💰 [Become a storage provider](./PROVIDER_NODE.md)
- 📱 [Integrate the iOS SDK](./IOS_SDK.md)
- 🌐 [Deploy a discovery service](./DISCOVERY_SERVICE.md)
- 📚 [Host the documentation website](./WEBSITE_SETUP.md)

**Built with ❤️ by the Carbide Team**
