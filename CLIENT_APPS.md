# Carbide Client Applications - Developer Guide

This guide covers the two main client applications in the Carbide ecosystem:
1. **Carbide**: iOS/macOS file management application
2. **CarbideDrive**: macOS desktop synchronization client

Both applications use **CarbideSDK** for all network operations with the Carbide decentralized storage network.

## Carbide - File Management

### Overview

Carbide is a mobile and desktop file management experience that combines modern cloud storage UI with the Carbide decentralized network. It provides a Google Drive-inspired interface for managing files, monitoring storage, and uploading/downloading with end-to-end encryption.

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | SwiftUI |
| Data Persistence | SwiftData |
| Network | CarbideSDK |
| Platform | iOS 18.1+ / macOS 13.0+ |
| Language | Swift 5.9+ |

### Features

- **Storage Dashboard**: Real-time visualization of storage usage across categories
- **File Management**: Upload, rename, delete, star, and share files
- **Smart Categorization**: Quick-access filters (Images, Documents, etc.)
- **Provider Integration**: Automatic provider discovery and selection via CarbideSDK
- **Client-Side Encryption**: Optional AES-256-GCM encryption before upload
- **SwiftData Persistence**: Local metadata synced with CarbideSDK operations

### Project Structure

```
Carbide/
├── Carbide/
│   ├── CarbideApp.swift           # App entry point with SwiftData container
│   ├── ContentView.swift          # Tab-based navigation (Home, Files, Shared, Settings)
│   ├── HomeView.swift             # Dashboard with storage header and recent files
│   ├── FilesView.swift            # File browser with list/grid view, upload, rename, delete
│   ├── FileDetailView.swift       # File metadata display and actions
│   ├── SharedView.swift           # Shared files list
│   ├── SettingsView.swift         # User profile, storage info, preferences
│   ├── FileItem.swift             # SwiftData @Model with Carbide metadata fields
│   ├── StorageManager.swift       # CarbideSDK wrapper for network operations
│   ├── Theme.swift                # Design system (colors, typography, shapes)
│   ├── FileComponents.swift       # FileCardView and FolderRowView UI components
│   └── StorageHeaderView.swift    # Storage usage progress bar and breakdown
├── CarbideTests/
└── CarbideUITests/
```

### Installation

#### Prerequisites

- Xcode 16.0+
- iOS 18.1+ or macOS 13.0+
- Swift 5.9+
- CarbideSDK (local package at `../carbide-ios-sdk`)

#### Setup

1. Clone the repository and ensure `carbide-ios-sdk` is in the sibling directory
2. Open `Carbide.xcodeproj` in Xcode
3. Select target device (iOS Simulator or Mac)
4. Build and Run (Cmd + R)

### Key Components

#### StorageManager

The `StorageManager` bridges the app UI to CarbideSDK:

```swift
import CarbideSDK

@MainActor
class StorageManager: ObservableObject {
    @Published var isUploading = false
    @Published var uploadProgress: Double = 0.0

    private let client: CarbideClient

    init() {
        let discoveryURL = URL(string: "https://discovery.carbidenetwork.xyz")!
        self.client = CarbideClient(discoveryServiceURL: discoveryURL)
    }

    func uploadFile(from fileURL: URL, encrypt: Bool = true) async throws -> UploadResult {
        isUploading = true
        defer { isUploading = false }

        return try await client.uploadFile(
            from: fileURL,
            preferredRegion: .northAmerica,
            encrypt: encrypt,
            progress: { [weak self] progress in
                Task { @MainActor in
                    self?.uploadProgress = progress
                }
            }
        )
    }

    func downloadFile(fileID: String, provider: Provider) async throws -> Data {
        try await client.downloadFile(fileID: fileID, from: provider)
    }
}
```

#### FileItem Model

SwiftData model with Carbide-specific fields:

```swift
@Model
class FileItem {
    var id: UUID
    var name: String
    var fileSize: Int64
    var fileType: String
    var createdAt: Date
    var modifiedAt: Date
    var isShared: Bool
    var isFavorite: Bool

    // Carbide Network fields
    var carbideFileID: String?
    var providerID: String?
    var providerEndpoint: String?
    var isEncrypted: Bool
}
```

---

## CarbideDrive - Desktop Synchronization

### Overview

CarbideDrive is a macOS cloud storage client that provides seamless file synchronization across the Carbide decentralized network. It monitors local file changes in real-time and automatically syncs them to selected Carbide providers with configurable encryption.

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | SwiftUI |
| Data Persistence | SwiftData |
| Reactive Programming | Combine |
| Network | CarbideSDK |
| Platform | macOS 14.0+ |

### Features

- **Real-time Sync**: File system monitoring via FSEvents with automatic upload on change
- **Provider Discovery**: Automatic provider selection based on region, tier, price, reputation
- **Provider Failover**: Automatic re-discovery when a provider becomes unavailable
- **AES-256-GCM Encryption**: Optional client-side encryption with macOS Keychain storage
- **Conflict Resolution**: Timestamp-based detection for local vs remote changes
- **Flexible Views**: Grid and List views with search, filtering, and sorting
- **Configurable Settings**: Sync interval, provider preferences, encryption toggle

### Project Structure

```
CarbideDrive/
├── CarbideDrive/
│   ├── CarbideDriveApp.swift      # App entry point with SwiftData container
│   ├── ContentView.swift           # Root view with default settings seeding
│   ├── FileBrowserView.swift       # Main UI: sidebar, file grid/list, status bar, detail panel
│   ├── FileSyncManager.swift       # Core sync engine: provider discovery, upload, download, failover
│   ├── FileSystemMonitor.swift     # DispatchSource-based file system monitoring (kqueue/FSEvents)
│   ├── SyncedFile.swift            # SwiftData model: file metadata, sync status, paths
│   ├── SyncSettings.swift          # SwiftData model: discovery URL, provider prefs, encryption
│   ├── SettingsView.swift          # Two-tab settings: General (sync) and Account (Carbide config)
│   ├── AddFolderView.swift         # NSOpenPanel folder picker with recursive enumeration
│   ├── DummyData.swift             # Default settings seeding
│   └── Theme.swift                 # Material Design 3 color tokens, typography, shapes
├── CarbideDriveTests/
└── CarbideDriveUITests/
```

### Installation

#### Prerequisites

- macOS 14.0+
- Xcode 16.0+
- CarbideSDK (local package at `../carbide-ios-sdk`)

#### Setup

1. Clone the repository and ensure `carbide-ios-sdk` is in the sibling directory
2. Open `CarbideDrive.xcodeproj` in Xcode
3. Build and Run (Cmd + R)
4. Configure discovery service URL and provider preferences in Settings

### Configuration

#### SyncSettings Model

```swift
@Model
final class SyncSettings {
    var syncFolderPath: String?
    var autoSyncEnabled: Bool               // Default: true
    var syncInterval: TimeInterval          // Default: 60s

    // Carbide Network
    var discoveryServiceURL: String?        // Default: "https://discovery.carbidenetwork.xyz"
    var selectedProviderID: String?
    var selectedProviderEndpoint: String?

    // Provider Preferences
    var maxPricePerGB: Double?              // Default: $0.10
    var preferredRegion: String?
    var preferredTier: String?              // Default: "Home"
    var minReputation: Double?              // Default: 0.5

    // Security
    var encryptionEnabled: Bool             // Default: true

    // Provider Cache
    var lastProviderRefresh: Date?
    var providerCacheValidMinutes: Int      // Default: 60
    var isProviderCacheValid: Bool          // Computed property
}
```

#### User Configuration

Access via Settings in the app:

**General Tab**:
- Auto sync toggle
- Sync interval (seconds)

**Account Tab**:
- Discovery Service URL
- Max price per GB/month
- Preferred region (Any, North America, Europe, Asia, etc.)
- Preferred tier (Home, Professional, Enterprise, Global CDN)
- Minimum reputation threshold (0.0 - 1.0)
- Encryption toggle (AES-256-GCM)
- Current provider info with refresh button

### Sync Architecture

#### FileSyncManager

The sync engine handles provider discovery, file upload/download, and automatic failover:

```swift
@MainActor
class FileSyncManager: ObservableObject {
    @Published var isSyncing = false
    @Published var syncProgress: Double = 0.0
    @Published var currentSyncFile: String?
    @Published var syncError: String?

    // Configures CarbideClient from SyncSettings
    func configure(with settings: SyncSettings, modelContext: ModelContext) async

    // Discovers and caches a provider matching preferences
    private func discoverAndSelectProvider() async

    // Syncs all tracked files
    func syncAll() async

    // Handles individual file sync with conflict detection
    private func syncFile(_ file: SyncedFile, provider: Provider, client: CarbideClient) async

    // Automatic failover on provider errors
    // Re-discovers provider on: providerRejected, insufficientCapacity, providerUnavailable
}
```

#### Sync Flow

1. **Configure**: Load settings, initialize `CarbideClient`, discover/cache provider
2. **Monitor**: `FileSystemMonitor` detects local file changes via kqueue
3. **Sync Decision**:
   - No remote ID -> Upload (new file)
   - Local deleted -> Download from cloud
   - Local newer -> Re-upload + delete old version
   - Already synced -> Skip
4. **Upload**: Via CarbideSDK with optional encryption, progress tracking
5. **Failover**: On provider errors, automatically discover new provider and retry

#### FileSystemMonitor

Real-time file monitoring using macOS kqueue events:

```swift
class FileSystemMonitor: ObservableObject {
    @Published var fileChanges: [String] = []

    func startMonitoring(path: String)  // Watch for write, delete, rename, revoke
    func stopMonitoring(path: String)
    func stopAll()
}
```

### Data Models

#### SyncedFile

```swift
@Model
final class SyncedFile {
    var id: UUID
    var localPath: String
    var remotePath: String          // Carbide file ID (content hash)
    var fileName: String
    var fileSize: Int64
    var lastModified: Date
    var lastSynced: Date?
    var syncStatus: SyncStatus      // .synced, .syncing, .pending, .error, .conflict
    var isDirectory: Bool
    var parentPath: String?
    var isStarred: Bool
    var isDeleted: Bool

    var iconName: String            // SF Symbol based on file extension
}

enum SyncStatus: String, Codable {
    case synced, syncing, pending, error, conflict
}
```

### Design System

CarbideDrive uses Material Design 3 tokens adapted for macOS:

```swift
struct Theme {
    // Primary: Google Blue (#0B57D0)
    static let primary = Color(hex: 0x0B57D0)

    // Surfaces: Light mode with off-white backgrounds
    static let surface = Color(hex: 0xFAFAFA)

    // Typography: System font with tuned weights
    struct Text {
        static let title = Font.system(size: 20, weight: .medium)
        static let bodyLarge = Font.system(size: 16, weight: .regular)
        static let bodyMedium = Font.system(size: 14, weight: .regular)
        static let labelSmall = Font.system(size: 12, weight: .regular)
    }

    // Shapes: Rounded corners
    struct Shapes {
        static let small = RoundedRectangle(cornerRadius: 8)
        static let medium = RoundedRectangle(cornerRadius: 12)
        static let large = RoundedRectangle(cornerRadius: 16)
    }
}
```

### Troubleshooting

#### Sync Not Working

1. Check discovery service URL in Settings > Account
2. Verify provider is selected (check "Current Provider" in Settings)
3. Click "Refresh Provider" to force re-discovery
4. Check network connectivity

#### Provider Errors

- **No providers available**: Adjust region, tier, or price settings
- **Provider rejected**: Automatic failover should find alternative; check settings
- **Discovery service unavailable**: Verify the service URL is correct and reachable

#### Files Not Syncing

1. Verify auto-sync is enabled in Settings > General
2. Check sync interval setting
3. Ensure files are added via the "New" button
4. Review sync status in the status bar at the bottom

## Development Best Practices

### Testing

```swift
import XCTest
@testable import CarbideDrive

class SyncSettingsTests: XCTestCase {
    func testDefaultSettings() {
        let settings = SyncSettings()
        XCTAssertTrue(settings.autoSyncEnabled)
        XCTAssertEqual(settings.syncInterval, 60.0)
        XCTAssertTrue(settings.encryptionEnabled)
        XCTAssertEqual(settings.discoveryServiceURL, "https://discovery.carbidenetwork.xyz")
    }

    func testProviderCacheValidity() {
        let settings = SyncSettings()
        XCTAssertFalse(settings.isProviderCacheValid)

        settings.lastProviderRefresh = Date()
        XCTAssertTrue(settings.isProviderCacheValid)
    }
}
```

### Code Style

- Follow Swift API Design Guidelines
- Use `@MainActor` for UI-related classes
- Use `async/await` for all network operations
- Document public APIs with Swift doc comments

## Contributing

Contributions are welcome! Please:

1. Follow Swift API Design Guidelines
2. Write tests for new features
3. Update documentation
4. Submit PR with clear description

## License

MIT License - see LICENSE file for details.
