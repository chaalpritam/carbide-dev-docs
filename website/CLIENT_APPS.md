# Carbide Client Applications - Developer Guide

This guide covers the two main client applications in the Carbide ecosystem:
1. **Carbide**: Premium iOS/macOS file management application
2. **CarbideDrive**: macOS desktop synchronization client

## Carbide - Premium File Management

### Overview

Carbide is a premium mobile and desktop experience that combines the best features of modern cloud storage with the Carbide Network. It provides a sleek, modern interface inspired by Google Drive for managing files, monitoring storage, and collaborating.

### Technology Stack

- **Framework**: SwiftUI
- **Data Persistence**: SwiftData
- **Platform**: iOS 17.0+ / macOS 13.0+
- **Language**: Swift 5.9+
- **Design**: Material Design principles

### Features

- **Intelligent Storage Dashboard**: Real-time visualization of storage usage
- **Full CRUD Support**: Create, rename, and delete files and folders
- **Smart Categorization**: Quick-access filters (Images, Videos, Documents, Audio)
- **SwiftData Persistence**: Instant syncing across the app
- **Premium Aesthetics**: Google-inspired color palettes and glassmorphism

### Project Structure

```
Carbide/
├── Carbide/
│   ├── CarbideApp.swift           # App entry point
│   ├── ContentView.swift          # Main navigation
│   ├── HomeView.swift             # Home dashboard
│   ├── FilesView.swift            # File browser
│   ├── FileDetailView.swift       # File details
│   ├── SharedView.swift           # Shared files
│   ├── SettingsView.swift         # App settings
│   ├── FileItem.swift             # Data model
│   ├── StorageManager.swift       # Storage logic
│   ├── Theme.swift                # Design system
│   ├── FileComponents.swift       # Reusable UI components
│   └── StorageHeaderView.swift    # Storage visualization
├── CarbideTests/
└── CarbideUITests/
```

### Installation

#### Prerequisites

- Xcode 15.0+
- macOS 13.0+ or iOS 17.0+
- Swift 5.9+

#### Setup

1. **Clone the Repository**:
   ```bash
   git clone <carbide-repo>
   cd Carbide
   ```

2. **Open in Xcode**:
   ```bash
   open Carbide.xcodeproj
   ```

3. **Select Target Device**:
   - iOS Simulator or Mac from scheme selector

4. **Build and Run**:
   - Press ⌘R or click Run
   - App will seed with demo data on first launch

### Key Components

#### CarbideApp.swift

Main app entry point:

```swift
@main
struct CarbideApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: FileItem.self)
    }
}
```

#### FileItem Model

SwiftData model for file storage:

```swift
@Model
class FileItem {
    var id: UUID
    var name: String
    var size: Int64
    var type: FileType
    var createdAt: Date
    var modifiedAt: Date
    var isShared: Bool
    var isFavorite: Bool

    init(name: String, size: Int64, type: FileType) {
        self.id = UUID()
        self.name = name
        self.size = size
        self.type = type
        self.createdAt = Date()
        self.modifiedAt = Date()
        self.isShared = false
        self.isFavorite = false
    }
}

enum FileType: String, Codable {
    case image
    case video
    case document
    case audio
    case other
}
```

#### Theme System

Consistent design system:

```swift
struct CarbideTheme {
    // Primary Colors
    static let primary = Color(hex: "1A73E8")
    static let secondary = Color(hex: "34A853")

    // Storage Colors
    static let driveColor = Color(hex: "4285F4")
    static let gmailColor = Color(hex: "EA4335")
    static let photosColor = Color(hex: "FBBC04")

    // Typography
    static let titleFont = Font.system(.largeTitle, design: .rounded)
    static let headlineFont = Font.system(.headline, design: .rounded)
    static let bodyFont = Font.system(.body, design: .default)

    // Effects
    static func glassMorphism() -> some View {
        RoundedRectangle(cornerRadius: 16)
            .fill(.ultraThinMaterial)
            .shadow(color: .black.opacity(0.1), radius: 10)
    }
}
```

### Integrating with Carbide Network

To connect Carbide with the Carbide Network using the iOS SDK:

1. **Add SDK Dependency**:
   ```swift
   dependencies: [
       .package(url: "https://github.com/carbide/carbide-ios-sdk", from: "1.0.0")
   ]
   ```

2. **Create Storage Service**:
   ```swift
   import CarbideSDK

   @Observable
   class CarbideStorageService {
       let client: CarbideClient

       init() {
           client = CarbideClient(
               discoveryServiceURL: URL(string: "https://discovery.carbide.network")!
           )
       }

       func uploadFile(_ item: FileItem, data: Data) async throws -> String {
           // Save to temporary file
           let tempURL = FileManager.default.temporaryDirectory
               .appendingPathComponent(item.id.uuidString)

           try data.write(to: tempURL)

           // Upload to network
           let result = try await client.uploadFile(
               from: tempURL,
               preferredRegion: .northAmerica,
               encrypt: true
           )

           // Clean up
           try? FileManager.default.removeItem(at: tempURL)

           return result.fileID
       }

       func downloadFile(fileID: String, provider: Provider) async throws -> Data {
           return try await client.downloadFile(
               fileID: fileID,
               from: provider
           )
       }
   }
   ```

3. **Inject into Views**:
   ```swift
   @main
   struct CarbideApp: App {
       @State private var storageService = CarbideStorageService()

       var body: some Scene {
           WindowGroup {
               ContentView()
                   .environment(storageService)
           }
           .modelContainer(for: FileItem.self)
       }
   }
   ```

### Customization

#### Changing Theme Colors

Edit `Theme.swift`:

```swift
static let primary = Color(hex: "YOUR_COLOR")
static let secondary = Color(hex: "YOUR_COLOR")
```

#### Adding New File Types

1. Update `FileType` enum
2. Add icon mapping in `FileComponents.swift`
3. Update filters in `FilesView.swift`

## CarbideDrive - Desktop Synchronization

### Overview

CarbideDrive is a premium macOS cloud storage client that provides seamless file synchronization across the Carbide Network. It offers a native macOS experience with real-time sync and beautiful Material 3-inspired design.

### Technology Stack

- **Framework**: SwiftUI
- **Data Persistence**: SwiftData
- **Reactive Programming**: Combine
- **Platform**: macOS 14.0+
- **API Integration**: REST

### Features

- **Real-time Sync**: Automatic background folder synchronization
- **Flexible Views**: Grid and List views with dynamic icons
- **Smart File Browser**: Real-time status indicators
- **Premium Branding**: Carbide Network status with environment badges
- **Customizable Settings**: Sync intervals and provider configuration
- **Native Experience**: Pure SwiftUI for smooth macOS feel

### Project Structure

```
CarbideDrive/
├── CarbideDrive/
│   ├── CarbideDriveApp.swift      # App entry point
│   ├── ContentView.swift          # Main interface
│   ├── Models/
│   │   ├── FileItem.swift         # File model
│   │   └── SyncSettings.swift     # Settings model
│   ├── Services/
│   │   ├── SyncService.swift      # Sync logic
│   │   └── CloudStorageService.swift  # API client
│   ├── Views/
│   │   ├── FileListView.swift     # File browser
│   │   ├── SettingsView.swift     # Settings panel
│   │   └── StatusBar.swift        # Status indicator
│   └── Utilities/
│       └── FileMonitor.swift      # File system monitoring
└── Assets.xcassets/
```

### Installation

#### Prerequisites

- macOS 14.0+
- Xcode 15.1+

#### Setup

1. **Clone the Repository**:
   ```bash
   git clone <carbide-drive-repo>
   cd CarbideDrive
   ```

2. **Open in Xcode**:
   ```bash
   open CarbideDrive.xcodeproj
   ```

3. **Build and Run**:
   - Press ⌘R
   - Configure sync folder and API endpoint in Settings

### Configuration

#### Settings Model

```swift
@Model
class SyncSettings {
    var apiEndpoint: String
    var accessToken: String
    var syncInterval: TimeInterval
    var syncFolderPath: String

    init() {
        self.apiEndpoint = "http://localhost:9090"
        self.accessToken = ""
        self.syncInterval = 300 // 5 minutes
        self.syncFolderPath = FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("CarbideDrive")
            .path
    }
}
```

#### User Configuration

Access via Settings (⌘,):

- **API Endpoint**: Carbide Network discovery service URL
- **Access Token**: Authentication token
- **Sync Interval**: Frequency of synchronization (seconds)
- **Sync Folder**: Local folder to synchronize

### Sync Service

#### Real-time File Monitoring

```swift
import Combine
import Foundation

class SyncService: ObservableObject {
    @Published var isSyncing = false
    @Published var lastSyncDate: Date?

    private let cloudService: CloudStorageService
    private let fileMonitor: FileMonitor
    private var syncTimer: Timer?

    init(settings: SyncSettings) {
        self.cloudService = CloudStorageService(
            endpoint: settings.apiEndpoint,
            token: settings.accessToken
        )
        self.fileMonitor = FileMonitor(path: settings.syncFolderPath)

        setupFileMonitoring()
        startPeriodicSync(interval: settings.syncInterval)
    }

    private func setupFileMonitoring() {
        fileMonitor.onFileChange = { [weak self] url in
            Task {
                await self?.syncFile(at: url)
            }
        }
    }

    private func startPeriodicSync(interval: TimeInterval) {
        syncTimer = Timer.scheduledTimer(
            withTimeInterval: interval,
            repeats: true
        ) { [weak self] _ in
            Task {
                await self?.performFullSync()
            }
        }
    }

    func performFullSync() async {
        isSyncing = true
        defer { isSyncing = false }

        do {
            let localFiles = try fileMonitor.listFiles()
            let remoteFiles = try await cloudService.listFiles()

            // Sync logic here
            for file in localFiles {
                if !remoteFiles.contains(where: { $0.name == file.name }) {
                    try await cloudService.uploadFile(file)
                }
            }

            lastSyncDate = Date()
        } catch {
            print("Sync error: \(error)")
        }
    }

    private func syncFile(at url: URL) async {
        do {
            try await cloudService.uploadFile(url)
        } catch {
            print("Upload error: \(error)")
        }
    }
}
```

#### Cloud Storage Service

```swift
class CloudStorageService {
    private let endpoint: String
    private let token: String

    init(endpoint: String, token: String) {
        self.endpoint = endpoint
        self.token = token
    }

    func uploadFile(_ url: URL) async throws {
        var request = URLRequest(url: URL(string: "\(endpoint)/api/v1/files/upload")!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (_, response) = try await URLSession.shared.upload(
            for: request,
            fromFile: url
        )

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
    }

    func listFiles() async throws -> [FileMetadata] {
        let url = URL(string: "\(endpoint)/api/v1/files")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode([FileMetadata].self, from: data)
    }
}
```

### User Interface

#### Main View with Status Bar

```swift
struct ContentView: View {
    @State private var syncService: SyncService
    @State private var files: [FileItem] = []
    @State private var viewMode: ViewMode = .grid

    var body: some View {
        NavigationSplitView {
            VStack(spacing: 0) {
                // Status Bar
                StatusBarView(
                    isSyncing: syncService.isSyncing,
                    lastSync: syncService.lastSyncDate
                )

                // File Browser
                FileListView(
                    files: files,
                    viewMode: viewMode
                )
            }
        } detail: {
            Text("Select a file")
                .foregroundStyle(.secondary)
        }
        .toolbar {
            ToolbarItem {
                Button {
                    viewMode = viewMode == .grid ? .list : .grid
                } label: {
                    Image(systemName: viewMode == .grid ? "list.bullet" : "square.grid.2x2")
                }
            }
        }
    }
}
```

### Design Philosophy

#### Contrast over Borders

Uses depth (shadows) and color blocks instead of harsh lines:

```swift
VStack {
    // Content
}
.padding()
.background(.ultraThinMaterial)
.cornerRadius(12)
.shadow(color: .black.opacity(0.08), radius: 8, x: 0, y: 2)
```

#### Micro-interactions

Smooth transitions and spring animations:

```swift
.animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSyncing)
```

### Troubleshooting

#### Sync Not Working

1. Check API endpoint in Settings
2. Verify access token is valid
3. Check network connectivity
4. Review logs in Console.app

#### Files Not Appearing

1. Verify sync folder path
2. Check file permissions
3. Ensure sync service is running

## Development Best Practices

### Testing

#### Unit Tests

```swift
import XCTest
@testable import Carbide

class FileItemTests: XCTestCase {
    func testFileCreation() {
        let file = FileItem(
            name: "test.pdf",
            size: 1024,
            type: .document
        )

        XCTAssertEqual(file.name, "test.pdf")
        XCTAssertEqual(file.size, 1024)
        XCTAssertEqual(file.type, .document)
    }
}
```

#### UI Tests

```swift
import XCTest

class CarbideUITests: XCTestCase {
    func testFileUpload() {
        let app = XCUIApplication()
        app.launch()

        app.buttons["Upload"].tap()
        XCTAssertTrue(app.staticTexts["Uploading..."].exists)
    }
}
```

### Code Style

Follow Swift API Design Guidelines:

- Use clear, descriptive names
- Prefer value types (struct) when possible
- Use async/await for asynchronous operations
- Document public APIs with doc comments

### Performance Optimization

#### Lazy Loading

```swift
LazyVStack {
    ForEach(files) { file in
        FileRowView(file: file)
    }
}
```

#### Image Caching

```swift
AsyncImage(url: thumbnailURL) { image in
    image
        .resizable()
        .aspectRatio(contentMode: .fill)
} placeholder: {
    ProgressView()
}
```

## Contributing

Contributions are welcome! Please:

1. Follow Swift API Design Guidelines
2. Write tests for new features
3. Update documentation
4. Submit PR with clear description

## License

MIT License - see LICENSE file for details.
