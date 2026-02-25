# Carbide iOS SDK - Developer Guide

## Overview

The Carbide iOS SDK (`CarbideSDK`) is a production-ready Swift library for integrating iOS and macOS applications with the Carbide decentralized storage network. It provides a simple async/await API for file operations with client-side encryption, automatic retry logic, and configurable timeouts.

## Features

- **Provider Discovery**: Find and select storage providers by region, tier, and price
- **File Upload/Download**: Async/await API with progress tracking
- **Client-Side Encryption**: AES-256-GCM encryption with Keychain key storage
- **Automatic Retry**: Exponential backoff for transient network failures (408, 429, 502-504)
- **Configurable Timeouts**: Request and resource timeout configuration
- **Zero Dependencies**: Built entirely with URLSession and CryptoKit
- **SwiftUI Integration**: Examples and helpers for SwiftUI apps

## Requirements

- iOS 16.0+ / macOS 13.0+
- Swift 5.9+
- Xcode 15.0+

## Installation

### Swift Package Manager

Add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/carbide/carbide-ios-sdk", from: "1.1.0")
]
```

Or in Xcode:
1. File > Add Package Dependencies
2. Enter the repository URL
3. Select version and add to your target

### Local Development

```swift
dependencies: [
    .package(path: "../carbide-ios-sdk")
]
```

## Quick Start

### Initialize the Client

```swift
import CarbideSDK

// Initialize with production discovery service (default)
let client = CarbideClient()

// Or specify a custom discovery service endpoint
let client = CarbideClient(
    discoveryServiceURL: URL(string: "https://discovery.carbidenetwork.xyz")!
)

// With custom HTTP configuration
let config = HTTPClientConfiguration(
    requestTimeout: 60,
    resourceTimeout: 600,
    maxRetryAttempts: 5,
    retryBaseDelay: 2.0
)
let client = CarbideClient(httpConfiguration: config)
```

### Upload a File

#### With Auto Provider Selection

```swift
let fileURL = URL(fileURLWithPath: "/path/to/file.pdf")

let result = try await client.uploadFile(
    from: fileURL,
    preferredRegion: .northAmerica,
    preferredTier: .professional,
    encrypt: true,
    progress: { progress in
        print("Upload: \(Int(progress * 100))%")
    }
)

print("File ID: \(result.fileID)")
print("Provider: \(result.providerID)")
```

#### With Specific Provider

```swift
// First, search for providers
let providers = try await client.searchProviders(
    region: .northAmerica,
    tier: .professional,
    minReputation: 0.9
)

guard let provider = providers.first else {
    throw CarbideError.noProvidersAvailable
}

// Upload to specific provider
let result = try await client.uploadFile(
    from: fileURL,
    to: provider,
    encrypt: true,
    progress: { progress in
        print("Upload progress: \(progress * 100)%")
    }
)
```

### Download a File

```swift
let fileID = "abc123..."

let data = try await client.downloadFile(
    fileID: fileID,
    from: provider,
    progress: { progress in
        print("Download: \(Int(progress * 100))%")
    }
)

// Or download directly to disk
try await client.downloadFile(
    fileID: fileID,
    from: provider,
    to: destinationURL
)
```

## API Reference

### CarbideClient

The main client for all Carbide operations. Implemented as a Swift `actor` for thread safety.

#### Initialization

```swift
public init(
    discoveryServiceURL: URL = CarbideClient.defaultDiscoveryURL,
    httpConfiguration: HTTPClientConfiguration = .default
)
```

**Default discovery URL**: `https://discovery.carbidenetwork.xyz`

### Provider Discovery

#### List Providers

```swift
func listProviders() async throws -> [Provider]
```

List all available providers in the network.

#### Search Providers

```swift
func searchProviders(
    region: Region? = nil,
    tier: ProviderTier? = nil,
    minReputation: Decimal? = nil,
    limit: Int? = nil
) async throws -> [Provider]
```

Search for providers matching specific criteria.

**Parameters**:
- `region`: Preferred geographic region (`northAmerica`, `europe`, `asia`, `southAmerica`, `africa`, `oceania`)
- `tier`: Provider tier (`home`, `professional`, `enterprise`, `globalCDN`)
- `minReputation`: Minimum reputation score (0.0-1.0)
- `limit`: Maximum number of results

#### Get Provider

```swift
func getProvider(id: String) async throws -> Provider
```

Get detailed information about a specific provider.

### File Operations

#### Upload File

```swift
// Auto provider selection
func uploadFile(
    from fileURL: URL,
    preferredRegion: Region? = nil,
    preferredTier: ProviderTier? = .home,
    maxPricePerGB: Decimal? = nil,
    encrypt: Bool = false,
    progress: ((Double) -> Void)? = nil
) async throws -> UploadResult

// Specific provider
func uploadFile(
    from fileURL: URL,
    to provider: Provider,
    encrypt: Bool = false,
    progress: ((Double) -> Void)? = nil
) async throws -> UploadResult
```

Upload a file to the network. When encryption is enabled, the key is automatically stored in the Keychain.

**Returns**: `UploadResult` containing file ID, size, provider info, and encryption key.

#### Download File

```swift
func downloadFile(
    fileID: String,
    from provider: Provider,
    decryptionKey: Data? = nil,
    progress: ((Double) -> Void)? = nil
) async throws -> Data

func downloadFile(
    fileID: String,
    from provider: Provider,
    to destinationURL: URL,
    decryptionKey: Data? = nil,
    progress: ((Double) -> Void)? = nil
) async throws
```

Download a file from a provider. If the file was encrypted, the decryption key is automatically retrieved from the Keychain unless explicitly provided.

#### List Files

```swift
func listFiles(on provider: Provider) async throws -> [FileMetadata]
```

List all files stored on a specific provider.

#### Delete File

```swift
func deleteFile(
    fileID: String,
    from provider: Provider,
    deleteKey: Bool = true
) async throws
```

Delete a file from a provider. Optionally removes the associated encryption key from the Keychain.

### Encryption Utilities

```swift
static func generateEncryptionKey() -> Data
static func encryptFile(data: Data, key: Data) throws -> Data
static func decryptFile(data: Data, key: Data) throws -> Data
static func deriveKey(from password: String, salt: Data) throws -> Data
static func generateSalt() -> Data
```

### Key Management

```swift
static func saveEncryptionKey(_ key: Data, for fileID: String) throws
static func getEncryptionKey(for fileID: String) throws -> Data
static func deleteEncryptionKey(for fileID: String) throws
static func encryptionKeyExists(for fileID: String) -> Bool
```

### Health Checks

```swift
func checkDiscoveryHealth() async throws -> HealthResponse
func checkProviderHealth(provider: Provider) async throws -> HealthResponse
```

### Marketplace

```swift
func getMarketplaceStats() async throws -> MarketplaceStats
```

## Data Models

### Provider

```swift
struct Provider: Codable, Identifiable, Sendable {
    let id: String
    let name: String
    let tier: ProviderTier
    let region: Region
    let endpoint: String
    let availableCapacity: UInt64
    let totalCapacity: UInt64
    let pricePerGBMonth: Decimal
    let reputation: ReputationScore
    let lastSeen: Date
    let metadata: [String: String]?
}
```

### ProviderTier

```swift
enum ProviderTier: String, Codable, Sendable, Hashable {
    case home = "Home"
    case professional = "Professional"
    case enterprise = "Enterprise"
    case globalCDN = "GlobalCDN"

    var displayName: String  // Human-readable name
}
```

### Region

```swift
enum Region: String, Codable, Sendable, Hashable {
    case northAmerica = "NorthAmerica"
    case europe = "Europe"
    case asia = "Asia"
    case southAmerica = "SouthAmerica"
    case africa = "Africa"
    case oceania = "Oceania"

    var displayName: String  // Human-readable name
}
```

### UploadResult

```swift
struct UploadResult: Sendable {
    let fileID: String
    let fileSize: UInt64
    let providerID: String
    let providerEndpoint: String
    let encryptionKey: Data?
    let uploadedAt: Date
}
```

### ReputationScore

```swift
struct ReputationScore: Codable, Sendable {
    let overall: Decimal
    let uptime: Decimal
    let dataIntegrity: Decimal
    let responseTime: Decimal
    let contractCompliance: Decimal
    let communityFeedback: Decimal
    let contractsCompleted: Int
    let lastUpdated: Date
}
```

### MarketplaceStats

```swift
struct MarketplaceStats: Codable, Sendable {
    let totalProviders: Int
    let onlineProviders: Int
    let totalCapacityBytes: UInt64
    let availableCapacityBytes: UInt64
    let averagePricePerGB: Decimal
    let totalRequests: Int?
    let lastUpdated: Date
}
```

### HTTPClientConfiguration

```swift
struct HTTPClientConfiguration: Sendable {
    var requestTimeout: TimeInterval     // Default: 30s
    var resourceTimeout: TimeInterval    // Default: 300s
    var maxRetryAttempts: Int            // Default: 3
    var retryBaseDelay: TimeInterval     // Default: 1.0s
}
```

## Error Handling

### CarbideError

```swift
enum CarbideError: Error, LocalizedError, Sendable {
    // Network
    case networkError(String)
    case invalidURL(String)
    case requestFailed(statusCode: Int, message: String)
    case timeout
    case noInternetConnection
    case rateLimited

    // Provider
    case providerNotFound
    case providerRejected(reason: String)
    case insufficientCapacity
    case providerUnavailable

    // File
    case fileNotFound
    case fileReadError(String)
    case fileTooLarge(maxSize: UInt64)
    case invalidFileID
    case uploadFailed(String)
    case downloadFailed(String)

    // Encryption
    case encryptionFailed(String)
    case decryptionFailed(String)
    case invalidKey
    case keychainError(String)

    // Validation
    case invalidResponse
    case decodingError(String)
    case encodingError(String)
    case missingData(String)

    // Discovery
    case discoveryServiceUnavailable
    case noProvidersAvailable
}
```

### Error Handling Example

```swift
do {
    let result = try await client.uploadFile(from: fileURL, to: provider)
    print("Success: \(result.fileID)")
} catch CarbideError.providerRejected(let reason) {
    print("Provider rejected: \(reason)")
} catch CarbideError.rateLimited {
    print("Rate limited - retry later")
} catch CarbideError.noInternetConnection {
    print("No internet connection")
} catch CarbideError.timeout {
    print("Request timed out")
} catch CarbideError.encryptionFailed(let message) {
    print("Encryption failed: \(message)")
} catch {
    print("Unexpected error: \(error.localizedDescription)")
}
```

## SwiftUI Integration

### File Upload View

```swift
import SwiftUI
import CarbideSDK
import PhotosUI

struct FileUploadView: View {
    @State private var client = CarbideClient()
    @State private var selectedPhoto: PhotosPickerItem?
    @State private var uploadProgress: Double = 0.0
    @State private var isUploading = false
    @State private var uploadedFileID: String?

    var body: some View {
        VStack(spacing: 20) {
            PhotosPicker(selection: $selectedPhoto, matching: .images) {
                Label("Select Photo", systemImage: "photo")
            }
            .onChange(of: selectedPhoto) { _, newValue in
                Task { await uploadPhoto(newValue) }
            }

            if isUploading {
                ProgressView(value: uploadProgress, total: 1.0)
                Text("\(Int(uploadProgress * 100))% uploaded")
                    .font(.caption)
            }

            if let fileID = uploadedFileID {
                Text("Uploaded! File ID: \(fileID)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
    }

    func uploadPhoto(_ item: PhotosPickerItem?) async {
        guard let item = item,
              let data = try? await item.loadTransferable(type: Data.self) else {
            return
        }

        isUploading = true
        uploadProgress = 0.0

        let tempURL = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
            .appendingPathExtension("jpg")

        do {
            try data.write(to: tempURL)
            let result = try await client.uploadFile(
                from: tempURL,
                preferredRegion: .northAmerica,
                encrypt: true,
                progress: { progress in
                    Task { @MainActor in uploadProgress = progress }
                }
            )
            uploadedFileID = result.fileID
            try? FileManager.default.removeItem(at: tempURL)
        } catch {
            print("Upload failed: \(error)")
        }

        isUploading = false
    }
}
```

## Advanced Usage

### Custom Progress Tracking

```swift
@MainActor
class UploadManager: ObservableObject {
    @Published var progress: Double = 0.0
    @Published var status: String = "Ready"

    let client = CarbideClient()

    func upload(fileURL: URL) async throws {
        status = "Finding providers..."

        let providers = try await client.searchProviders(
            region: .northAmerica,
            tier: .professional
        )

        guard let provider = providers.first else {
            throw CarbideError.noProvidersAvailable
        }

        status = "Uploading to \(provider.name)..."

        let result = try await client.uploadFile(
            from: fileURL,
            to: provider,
            encrypt: true,
            progress: { [weak self] progress in
                Task { @MainActor in
                    self?.progress = progress
                }
            }
        )

        status = "Upload complete: \(result.fileID)"
    }
}
```

### Batch Upload

```swift
func uploadMultipleFiles(_ urls: [URL], client: CarbideClient) async throws -> [UploadResult] {
    let providers = try await client.searchProviders(
        region: .northAmerica,
        tier: .professional,
        minReputation: 0.9
    )

    guard let provider = providers.first else {
        throw CarbideError.noProvidersAvailable
    }

    var results: [UploadResult] = []
    for url in urls {
        let result = try await client.uploadFile(
            from: url,
            to: provider,
            encrypt: true
        )
        results.append(result)
    }

    return results
}
```

## Known Limitations

- **SHA-256 vs BLAKE3**: Uses SHA-256 for file hashing; BLAKE3 support planned for v1.2
- **Single Provider**: Uploads to one provider at a time (no automatic replication)
- **No Background Transfers**: Upload/download interrupted when app is backgrounded

## Roadmap

- [ ] BLAKE3 hash integration
- [ ] Multi-provider replication
- [ ] Background upload/download support
- [ ] Proof-of-storage verification
- [ ] Quote aggregation from multiple providers

## Testing

```bash
swift test
```

## Contributing

Contributions are welcome! Please:

1. Follow Swift API Design Guidelines
2. Write unit tests for new features
3. Update documentation as needed
4. Submit PR with clear description

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: https://docs.carbide.network
- **Issues**: https://github.com/carbide/carbide-ios-sdk/issues
- **Email**: support@carbide.network
