# Carbide iOS SDK - Developer Guide

## Overview

The Carbide iOS SDK is a native Swift library for integrating iOS and macOS applications with the Carbide decentralized storage network. It provides a simple, async/await API for file operations with optional client-side encryption.

## Features

- **Provider Discovery**: Find and select storage providers by region, tier, and price
- **File Upload/Download**: Simple async/await API with progress tracking
- **Optional Encryption**: AES-256-GCM client-side encryption
- **Secure Key Storage**: Encryption keys stored in iOS Keychain
- **Progress Tracking**: Monitor upload and download progress
- **Zero Dependencies**: Built with native URLSession and CryptoKit
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
    .package(url: "https://github.com/carbide/carbide-ios-sdk", from: "1.0.0")
]
```

Or in Xcode:
1. File → Add Package Dependencies
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

// Initialize with default localhost (development)
let client = CarbideClient()

// Or specify production discovery service
let client = CarbideClient(
    discoveryServiceURL: URL(string: "https://discovery.carbide.network")!
)
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

// Save to disk
let documentsURL = FileManager.default.urls(
    for: .documentDirectory,
    in: .userDomainMask
)[0]
let destinationURL = documentsURL.appendingPathComponent("downloaded.pdf")
try data.write(to: destinationURL)
```

## API Reference

### CarbideClient

The main client for all Carbide operations.

#### Initialization

```swift
init(discoveryServiceURL: URL = URL(string: "http://localhost:9090")!)
```

### Provider Discovery

#### List Providers

```swift
func listProviders() async throws -> [Provider]
```

List all available providers in the network.

**Example**:
```swift
let allProviders = try await client.listProviders()
for provider in allProviders {
    print("\(provider.name) - $\(provider.pricePerGBMonth)/GB/month")
}
```

#### Search Providers

```swift
func searchProviders(
    region: Region? = nil,
    tier: ProviderTier? = nil,
    minReputation: Double = 0.0,
    maxPricePerGB: Decimal? = nil,
    limit: Int = 10
) async throws -> [Provider]
```

Search for providers matching specific criteria.

**Parameters**:
- `region`: Preferred geographic region
- `tier`: Provider tier (home, professional, enterprise)
- `minReputation`: Minimum reputation score (0.0-1.0)
- `maxPricePerGB`: Maximum price per GB/month
- `limit`: Maximum number of results

**Example**:
```swift
let providers = try await client.searchProviders(
    region: .europe,
    tier: .enterprise,
    minReputation: 0.95,
    maxPricePerGB: 0.01,
    limit: 5
)
```

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
    preferredTier: ProviderTier? = nil,
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

Upload a file to the network.

**Parameters**:
- `fileURL`: Local file URL to upload
- `provider`: Target provider (or auto-select)
- `encrypt`: Enable client-side encryption
- `progress`: Progress callback (0.0-1.0)

**Returns**: `UploadResult` containing file ID and metadata

**Example**:
```swift
let result = try await client.uploadFile(
    from: fileURL,
    preferredRegion: .asia,
    encrypt: true,
    progress: { progress in
        DispatchQueue.main.async {
            self.uploadProgress = progress
        }
    }
)

print("Uploaded: \(result.fileID)")
```

#### Download File

```swift
func downloadFile(
    fileID: String,
    from provider: Provider,
    decryptionKey: Data? = nil,
    progress: ((Double) -> Void)? = nil
) async throws -> Data
```

Download a file from a provider.

**Parameters**:
- `fileID`: Unique file identifier
- `provider`: Provider hosting the file
- `decryptionKey`: Optional decryption key (auto-retrieved from keychain)
- `progress`: Progress callback (0.0-1.0)

**Returns**: File data

**Example**:
```swift
let data = try await client.downloadFile(
    fileID: "abc123",
    from: provider,
    progress: { progress in
        print("Downloaded: \(Int(progress * 100))%")
    }
)
```

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
    deleteKey: String
) async throws
```

Delete a file from a provider.

### Encryption Utilities

#### Generate Encryption Key

```swift
static func generateEncryptionKey() -> Data
```

Generate a random AES-256 encryption key.

**Example**:
```swift
let key = CarbideClient.generateEncryptionKey()
```

#### Encrypt File

```swift
static func encryptFile(data: Data, key: Data) throws -> Data
```

Encrypt data using AES-256-GCM.

**Example**:
```swift
let fileData = try Data(contentsOf: fileURL)
let encryptedData = try CarbideClient.encryptFile(data: fileData, key: key)
```

#### Decrypt File

```swift
static func decryptFile(data: Data, key: Data) throws -> Data
```

Decrypt data using AES-256-GCM.

**Example**:
```swift
let decryptedData = try CarbideClient.decryptFile(data: encryptedData, key: key)
```

#### Derive Key from Password

```swift
static func deriveKey(from password: String, salt: Data) throws -> Data
```

Derive an encryption key from a password using PBKDF2.

**Example**:
```swift
let salt = CarbideClient.generateSalt()
let key = try CarbideClient.deriveKey(from: "mypassword", salt: salt)
```

#### Generate Salt

```swift
static func generateSalt() -> Data
```

Generate a random salt for key derivation.

### Key Management

#### Save Encryption Key

```swift
static func saveEncryptionKey(_ key: Data, for fileID: String) throws
```

Save an encryption key to the iOS Keychain.

**Example**:
```swift
try CarbideClient.saveEncryptionKey(key, for: result.fileID)
```

#### Get Encryption Key

```swift
static func getEncryptionKey(for fileID: String) throws -> Data
```

Retrieve an encryption key from the Keychain.

**Example**:
```swift
let key = try CarbideClient.getEncryptionKey(for: fileID)
```

#### Delete Encryption Key

```swift
static func deleteEncryptionKey(for fileID: String) throws
```

Delete an encryption key from the Keychain.

#### Check Key Exists

```swift
static func encryptionKeyExists(for fileID: String) -> Bool
```

Check if an encryption key exists in the Keychain.

### Health Checks

#### Check Discovery Health

```swift
func checkDiscoveryHealth() async throws -> HealthStatus
```

Check the health of the discovery service.

#### Check Provider Health

```swift
func checkProviderHealth(provider: Provider) async throws -> HealthStatus
```

Check if a provider is online and healthy.

### Marketplace

#### Get Marketplace Stats

```swift
func getMarketplaceStats() async throws -> MarketplaceStats
```

Get real-time marketplace statistics.

**Example**:
```swift
let stats = try await client.getMarketplaceStats()
print("Total providers: \(stats.totalProviders)")
print("Avg price: $\(stats.averagePricePerGB)/GB")
print("Available capacity: \(stats.availableCapacityBytes) bytes")
```

## Data Models

### Provider

```swift
struct Provider: Codable, Identifiable {
    let id: String
    let name: String
    let tier: ProviderTier
    let region: Region
    let endpoint: String
    let availableCapacity: UInt64
    let pricePerGBMonth: Decimal
    let reputation: ReputationScore
}
```

### ProviderTier

```swift
enum ProviderTier: String, Codable {
    case home
    case professional
    case enterprise
}
```

### Region

```swift
enum Region: String, Codable {
    case northAmerica = "northamerica"
    case southAmerica = "southamerica"
    case europe
    case asia
    case africa
    case oceania
}
```

### UploadResult

```swift
struct UploadResult {
    let fileID: String
    let fileSize: UInt64
    let providerID: String
    let encryptionKey: Data?
}
```

### ReputationScore

```swift
struct ReputationScore: Codable {
    let overall: Double          // 0.0-1.0
    let uptime: Double
    let dataIntegrity: Double
    let responseTime: Double
}
```

### MarketplaceStats

```swift
struct MarketplaceStats: Codable {
    let totalProviders: Int
    let activeProviders: Int
    let availableCapacityBytes: UInt64
    let averagePricePerGB: Decimal
    let averageReputation: Double
}
```

## Error Handling

### CarbideError

```swift
enum CarbideError: LocalizedError {
    case noProvidersAvailable
    case providerRejected(reason: String)
    case fileNotFound
    case encryptionFailed(message: String)
    case decryptionFailed(message: String)
    case networkError(Error)
    case invalidResponse
    case keychainError(OSStatus)

    var errorDescription: String? {
        switch self {
        case .noProvidersAvailable:
            return "No providers available matching your criteria"
        case .providerRejected(let reason):
            return "Provider rejected upload: \(reason)"
        case .fileNotFound:
            return "File not found"
        case .encryptionFailed(let message):
            return "Encryption failed: \(message)"
        case .decryptionFailed(let message):
            return "Decryption failed: \(message)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .invalidResponse:
            return "Invalid server response"
        case .keychainError(let status):
            return "Keychain error: \(status)"
        }
    }
}
```

### Error Handling Example

```swift
do {
    let result = try await client.uploadFile(from: fileURL, to: provider)
    print("Success: \(result.fileID)")
} catch CarbideError.providerRejected(let reason) {
    print("Provider rejected: \(reason)")
} catch CarbideError.fileNotFound {
    print("File not found")
} catch CarbideError.encryptionFailed(let message) {
    print("Encryption failed: \(message)")
} catch CarbideError.networkError(let error) {
    print("Network error: \(error)")
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
    @State private var errorMessage: String?

    var body: some View {
        VStack(spacing: 20) {
            PhotosPicker(selection: $selectedPhoto, matching: .images) {
                Label("Select Photo", systemImage: "photo")
                    .font(.headline)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .onChange(of: selectedPhoto) { _, newValue in
                Task { await uploadPhoto(newValue) }
            }

            if isUploading {
                VStack(spacing: 10) {
                    ProgressView(value: uploadProgress, total: 1.0)
                    Text("\(Int(uploadProgress * 100))% uploaded")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            if let fileID = uploadedFileID {
                VStack {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.largeTitle)
                        .foregroundColor(.green)
                    Text("Upload successful!")
                        .font(.headline)
                    Text("File ID: \(fileID)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            if let error = errorMessage {
                Text(error)
                    .foregroundColor(.red)
                    .font(.caption)
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
        errorMessage = nil

        // Save to temporary file
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
                    Task { @MainActor in
                        uploadProgress = progress
                    }
                }
            )

            uploadedFileID = result.fileID
            try? FileManager.default.removeItem(at: tempURL)
        } catch {
            errorMessage = error.localizedDescription
        }

        isUploading = false
    }
}
```

### Provider List View

```swift
struct ProviderListView: View {
    @State private var client = CarbideClient()
    @State private var providers: [Provider] = []
    @State private var isLoading = false

    var body: some View {
        List {
            ForEach(providers) { provider in
                VStack(alignment: .leading) {
                    Text(provider.name)
                        .font(.headline)

                    HStack {
                        Label(provider.tier.rawValue, systemImage: "star.fill")
                        Spacer()
                        Text("$\(provider.pricePerGBMonth)/GB")
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)

                    HStack {
                        Text("Reputation: \(provider.reputation.overall, specifier: "%.2f")")
                        Spacer()
                        Text(provider.region.rawValue)
                    }
                    .font(.caption2)
                }
            }
        }
        .overlay {
            if isLoading {
                ProgressView()
            }
        }
        .task {
            await loadProviders()
        }
    }

    func loadProviders() async {
        isLoading = true
        defer { isLoading = false }

        do {
            providers = try await client.searchProviders(
                minReputation: 0.8,
                limit: 20
            )
        } catch {
            print("Error loading providers: \(error)")
        }
    }
}
```

## Advanced Usage

### Custom Progress Tracking

```swift
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
func uploadMultipleFiles(_ urls: [URL]) async throws -> [UploadResult] {
    var results: [UploadResult] = []

    // Find suitable provider
    let providers = try await client.searchProviders(
        region: .northAmerica,
        tier: .professional,
        minReputation: 0.9
    )

    guard let provider = providers.first else {
        throw CarbideError.noProvidersAvailable
    }

    // Upload files sequentially
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

## Known Limitations (v1.0)

- **SHA-256 vs BLAKE3**: Currently uses SHA-256 for hashing. BLAKE3 support coming in v1.1
- **Single Provider**: Only uploads to one provider (no automatic replication)
- **No Proof-of-Storage**: File integrity verification not yet implemented
- **No Background Transfers**: Upload/download interrupted when app backgrounds

## Roadmap

- [ ] BLAKE3 hash integration
- [ ] Multi-provider replication
- [ ] Automatic provider failover
- [ ] Background upload/download support
- [ ] Proof-of-storage verification
- [ ] Quote aggregation
- [ ] Payment integration

## Testing

### Running Tests

```bash
swift test
```

### Building Documentation

```bash
swift package generate-documentation
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
