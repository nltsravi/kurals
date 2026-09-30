# திருக்குறள் (Thirukkural) Mobile Application

A production-quality, fast, minimal, cross-platform mobile application for **iOS** and **Android** dedicated to reading, searching, collecting, and exporting all 1,330 couplets of the ancient Tamil masterpiece **Thirukkural** by Thiruvalluvar.

The application is **100% offline-first**, reading directly from bundled local JSON datasets with **zero backend or server dependencies**.

---

## 📱 Features

- **Master Dataset (1330 Kurals)**:
  - All 1,330 Kurals with Tamil couplets (`Line1`, `Line2`).
  - English transliterations (`transliteration1`, `transliteration2`).
  - English translations and classic couplet renditions (Rev. G. U. Pope).
  - Renowned Tamil commentaries:
    - மு. வரதராசனார் (Mu. Varadarajan - `mv`)
    - சாலமன் பாப்பையா (Solomon Pappaiah - `sp`)
    - கலைஞர் மு. கருணாநிதி (M. Karunanidhi - `mk`)
- **Hierarchical Browsing**:
  - **3 பால் (Sections / Categories)**: அறத்துப்பால் (Virtue), பொருட்பால் (Wealth), காமத்துப்பால் (Love).
  - **13 இயல் (Chapter Groups)**: பாயிரவியல், இல்லறவியல், துறவறவியல், etc.
  - **133 அதிகாரம் (Chapters)**: Dynamic derivation from canonical metadata.
- **High-Performance In-Memory Search**:
  - Case-insensitive, Unicode-aware, whitespace-normalized, partial matching.
  - Search across Kural numbers (1–1330), chapter numbers (1–133), Tamil chapter names, English chapter names & transliterations, categories, Tamil couplet text, and English transliterations.
  - Multi-tiered relevance ranking.
  - Debounced input (200ms) with empty-state suggestions and no-results guidance.
- **Custom Collections & Persistence**:
  - Create, rename, delete custom collections (e.g. *Favorites*, *Morning Reading*, *School Kurals*).
  - Add / remove Kurals.
  - Reorder Kurals with move up/down controls.
  - Persisted locally with `@react-native-async-storage/async-storage`.
- **Document Export & Native Sharing**:
  - Export single Kural or entire collection as **PDF** (custom typography, A4 formatting, print-ready, Unicode Tamil fonts).
  - Export single Kural or entire collection as **DOCX** (structured Microsoft Word document).
  - Native OS Share Sheet integration (`expo-sharing`, `Share` API) for WhatsApp, Telegram, Files, Google Drive, iCloud, Email, etc.
  - Clipboard quick-copy: *Copy Tamil*, *Copy Transliteration*, *Copy Both*.
- **Theming & Accessibility**:
  - System, Light, and Dark modes with persistent selection.
  - Minimum 48px touch targets, high contrast, and accessibility labels.

---

## 🛠️ Technology Stack

- **Mobile Framework**: React Native + Expo (SDK 57)
- **Language**: TypeScript (strict mode enabled)
- **Routing & Navigation**: Expo Router (typed file-based routes)
- **Local Persistence**: `@react-native-async-storage/async-storage`
- **PDF Generation**: `expo-print`
- **DOCX Generation**: `docx`
- **File System**: `expo-file-system`
- **Sharing & Clipboard**: `expo-sharing`, `expo-clipboard`
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Test Runner**: Jest + `ts-jest`

---

## 📂 Project Architecture

```text
kurals/
├── app/                              # Expo Router file-based screens
│   ├── _layout.tsx                   # Root Stack & Theme/Collection Providers
│   ├── (tabs)/                       # Bottom Tab Navigation
│   │   ├── _layout.tsx               # Tab bar layout & icons
│   │   ├── index.tsx                 # Home screen (App header, Random Kural, Categories)
│   │   ├── search.tsx                # Fast search with suggestions & empty states
│   │   ├── chapters.tsx              # Browse hierarchy (Paal -> Iyal -> Athikaaram)
│   │   ├── collections.tsx           # Collections list screen
│   │   └── settings.tsx              # Theme mode, Data source, About info
│   ├── kural/
│   │   └── [id].tsx                  # Kural detail (Commentaries, copy, share, export)
│   ├── chapter/
│   │   └── [id].tsx                  # Chapter view (10 kurals, chapter export)
│   └── collections/
│       ├── create.tsx                # Create new collection modal
│       └── [id].tsx                  # Collection detail (Reorder, rename, export)
│
├── assets/
│   ├── data/
│   │   ├── thirukkural.json          # Master 1330 Kurals dataset (Read-only)
│   │   └── detail.json               # Canonical 133 chapters & 3 categories hierarchy
│   ├── fonts/
│   └── images/
│
├── src/
│   ├── components/                   # Reusable UI components
│   │   ├── KuralCard.tsx             # Card with Tamil lines, translit, actions
│   │   ├── SearchBar.tsx             # Pill search bar with clear button
│   │   ├── ChapterCard.tsx           # Chapter item card
│   │   ├── CollectionCard.tsx        # Collection item with stats & actions
│   │   ├── AddToCollectionModal.tsx  # Add to collection modal sheet
│   │   ├── ExportModal.tsx           # PDF/DOCX format selector & exporter
│   │   └── EmptyState.tsx            # Clean empty & no-results states
│   │
│   ├── context/                      # React Context providers
│   │   ├── CollectionContext.tsx     # Global collections state & persistence
│   │   └── ThemeContext.tsx          # System/Light/Dark theme provider
│   │
│   ├── services/                     # Business logic & operations
│   │   ├── kuralService.ts           # Dataset parser, normalization & caching
│   │   ├── searchService.ts          # In-memory index, debouncing & ranking
│   │   ├── exportService.ts          # PDF HTML & DOCX generators
│   │   └── shareService.ts           # Native sharing sheet & clipboard
│   │
│   ├── storage/
│   │   └── collectionStorage.ts      # AsyncStorage adapter for collections
│   │
│   ├── types/
│   │   └── kural.ts                  # Strong TypeScript models
│   │
│   ├── utils/
│   │   ├── text.ts                   # Unicode normalization, sanitization & formatting
│   │   └── search.ts                 # Search helpers
│   │
│   ├── constants/
│   │   └── appConstants.ts           # App metadata, palette tokens
│   │
│   └── hooks/
│       ├── useKuralSearch.ts         # Search hook with 200ms debounce
│       └── useCollections.ts         # Hook to access collections context
│
├── tests/                            # Automated Jest test suites
│   ├── dataLoading.test.ts           # 1330 kurals, 133 chapters, immutability
│   ├── search.test.ts                # Search normalization, ranking, Tamil/Translit
│   ├── collections.test.ts           # CRUD, reordering, duplicate prevention
│   └── export.test.ts                # PDF HTML formatting & DOCX generation
│
├── package.json
├── app.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## 💾 Data & Immutability

The core dataset is stored at:
```text
assets/data/thirukkural.json
```
and its structural hierarchy is at:
```text
assets/data/detail.json
```

- **Single Source of Truth**: The master JSON files are bundled with the app and treated as strictly **read-only**.
- **No Direct Modification**: User collections and preferences are stored separately via `AsyncStorage` and reference Kurals by their unique integer numbers (`1` to `1330`).
- **Data Integrity**: Automated regression tests verify that source datasets remain untouched and cryptographically identical.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended; v22 supported)
- [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/) (bundled with `npx expo`)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/nltsravi/kurals.git
cd kurals
npm install
```

### Running Locally

To start the Expo development server:

```bash
npx expo start
```

Press:
- `a` to open in an Android Emulator / connected Android device
- `i` to open in the iOS Simulator (macOS required)
- `w` to open in the Web browser
- Or scan the QR code with **Expo Go** on your physical iPhone or Android phone.

---

## 🧪 Automated Testing

Run the automated test suite with Jest:

```bash
npm test
```

To run tests with code coverage:

```bash
npm test -- --coverage
```

### Tested Coverage Areas:
- **Data Loading**: Validates all 1330 Kurals, 133 Chapters, 3 Categories, and commentary fields.
- **Search Engine**: Exact number matches, chapter names, Tamil phrases, transliterations, case-insensitivity, whitespace normalization, and relevance scoring.
- **Collections**: Creation, renaming, deletion, duplicate prevention, and Kural reordering.
- **Document Export**: PDF HTML structure with Tamil font stacks and DOCX generation.
- **Data Immutability**: Regression check ensuring source JSON files are never modified.

---

## 📦 Building for Production

This project is configured with Expo EAS (Expo Application Services) for generating standalone APKs, AABs for Google Play Store, and IPAs for Apple App Store.

### 1. Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 2. Configure EAS Build

```bash
eas build:configure
```

### 3. Build for Android

**Build an Android APK (for testing):**
```bash
eas build -p android --profile preview
```

**Build an Android App Bundle (.aab for Google Play Store):**
```bash
eas build -p android --profile production
```

### 4. Build for iOS

**Build an iOS Simulator build:**
```bash
eas build -p ios --profile preview
```

**Build an iOS App Store build:**
```bash
eas build -p ios --profile production
```

---

## 📄 License

This project is open-source under the MIT License. Thirukkural content is part of ancient Tamil classical literature in the public domain.
