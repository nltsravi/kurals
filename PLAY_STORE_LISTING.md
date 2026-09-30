# 🚀 Google Play Store Submission & Listing Kit

This document contains everything needed to publish **திருக்குறள் (Thirukkural)** to the **Google Play Console** (`play.google.com/console`).

---

## 1. App Identity & Configuration

| Property | Value | Notes |
| :--- | :--- | :--- |
| **App Name** | `திருக்குறள் - Thirukkural` | 25 chars (max 30 chars) |
| **Package Name / Application ID** | `com.nltsravi.kurals` | Configured in `app.json` |
| **Version Name** | `1.0.0` | Initial production release |
| **Version Code** | `1` | Increments with each release |
| **Target Platforms** | Android (Phones, Tablets, Foldables) | Architecture: ARM64-v8a, x86_64 |
| **Permissions** | `permissions: []` | **Zero dangerous permissions** |
| **Offline Capability** | 100% Offline-First | 1,330 couplets locally bundled |

---

## 2. Store Listing Metadata (Copy & Paste)

### 📌 App Title (Max 30 characters)
```text
திருக்குறள் - Thirukkural
```

---

### 📌 Short Description (Max 80 characters)
*Choose English or Tamil for your default language:*

**English (79 chars):**
```text
1330 Thirukkural with explanations in Tamil & English. 100% offline & ad-free.
```

**Tamil (73 chars):**
```text
1330 திருக்குறள் மற்றும் விரிவான தமிழ், ஆங்கில உரைகள். ஆஃப்லைனில் படிக்கலாம்.
```

---

### 📌 Full Description (Max 4,000 characters)

```text
Explore the timeless ethical wisdom of the Tirukkuṟaḷ (திருக்குறள்), universally revered as the 'Ulaga Podhu Marai' (Universal Veda), composed by the immortal Tamil sage Thiruvalluvar.

This application provides a fast, minimal, beautiful, and 100% offline reading experience for all 1,330 sacred couplets, complete with multiple revered Tamil commentaries and English translations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ KEY HIGHLIGHTS & FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 COMPLETE 1,330 THIRUKKURALS
• Organized across all 3 Sections (பால்):
  1. அறத்துப்பால் (Virtue / Ethics)
  2. பொருட்பால் (Wealth / Governance)
  3. காமத்துப்பால் (Love / Relationships)
• Structured cleanly into all 133 Chapters (அதிகாரம்) with 10 couplets each.

💬 4 RENOWNED COMMENTARIES INCLUDED
• மு. வரதராசனார் (Mu. Varadarajan) - Clear, authoritative, classical Tamil commentary.
• சாலமன் பாப்பையா (Solomon Pappaiah) - Simple, modern conversational Tamil explanations.
• மு. கருணாநிதி (Kalaignar Karunanidhi) - Eloquent, literary Tamil interpretations.
• Rev. G.U. Pope - Classic poetic English couplet translation & explanation.

🔍 INSTANT BILINGUAL SEARCH
• Search effortlessly by Kural Number (e.g. 1, 46, 391).
• Search by Tamil keywords or phrases in the couplet text.
• Search by English terms and meaning across Pope's explanations.

📁 PERSONAL COLLECTIONS & BOOKMARKS
• Bookmark your favorite couplets for daily contemplation.
• Create personalized collections (e.g. "Leadership", "Friendship", "Wisdom", "Family").
• Easily organize and manage your reading lists.

📤 CLEAN EXPORT (TEXT, JSON, & WORD DOCX)
• Export your collections or favourite Kurals cleanly.
• Formats supported: TXT, JSON, and Microsoft Word (.docx).
• Pure bilingual format containing only the couplets and their English translations for easy sharing, assignments, or presentations.

🎨 THOUGHTFUL & ACCESSIBLE UI
• Saffron / Sandalwood inspired warm aesthetic (#FF7C0A).
• Full Dark Mode & Light Mode support for comfortable day and night reading.
• High contrast, large legible typography optimized for mobile devices and tablets.

🔒 100% AD-FREE & PRIVATE
• No ads. No tracking. No spyware.
• Works completely offline without needing mobile data or Wi-Fi.
• Zero personal data collected or shared.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 பற்றி (ABOUT TIRUKKURAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Tirukkural is an ancient masterpiece of Tamil literature, consisting of 1,330 couplets (kurals) composed with profound brevity and universal humanist ethics. Over two millennia after its writing, its teachings on virtue, leadership, friendship, love, and life remain universally applicable to people of all cultures and backgrounds.

Developed with reverence and care by NLTS Ravi.
Open-source repository: https://github.com/nltsravi/kurals
```

---

## 3. Store Graphic Assets Checklist

| Asset | Dimensions | Format | Path in Project | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **App Icon** | 512 x 512 px | PNG (no alpha, max 1024KB) | `assets/images/play-store-icon.png` | Ready for upload |
| **Feature Graphic** | 1024 x 500 px | JPEG (no alpha, max 15MB) | `assets/images/play-store-feature-graphic.png` | Ready for upload |
| **Phone Screenshots** | 1080 x 2400 (or any 16:9 / 9:16) | PNG / JPEG (min 2, max 8) | In `assets/screenshots/` | Capture via device or emulator |
| **Tablet Screenshots** | 7-inch & 10-inch | PNG / JPEG (optional/recommended) | In `assets/screenshots/` | Meets tablet directory listing |

---

## 4. Google Play Console Questionnaire Answers

When submitting your app in the **Google Play Console**, navigate to **App Content** and use these exact answers:

### 1. Privacy Policy
* **URL:** `https://nltsravi.github.io/kurals/` (or your custom domain)
* **Status:** Verified 100% compliant with Google Play Families & Data Safety policies.

### 2. App Access
* **Option:** `All functionality is available without special access` (No login or credentials required).

### 3. Ads
* **Option:** `No, my app does not contain ads`.

### 4. Content Rating (IARC)
* **Category:** Reference, News, or Educational.
* **Violence:** No
* **Sexuality:** No
* **Offensive Language:** No
* **Controlled Substances:** No
* **Miscellaneous (User interactions, sharing physical location, digital purchases):** No
* **Resulting Certificate:** **Everyone / 3+ (PEGI 3, ESRB Everyone)**

### 5. Target Audience and Content
* **Target Age Group:** Select `13-15`, `16-17`, and `18 and over` (and optionally `Ages 9-12`).
* **Appeal to Children:** "No" (or "Neutral").

### 6. Data Safety Form (Crucial for Green Safety Badge)
* **Does your app collect or share any of the required user data types?**  
  👉 **Select "NO"**
* *Why:* The app runs 100% offline, requires no network requests for core functionality, contains no third-party tracking SDKs, and stores user bookmarks only on the local device.
* *Result:* Play Store awards the app the **"No data collected"** and **"No data shared"** safety badge.

### 7. Government Apps & Financial Features
* **Government App:** No
* **Financial Features:** No financial services.

---

## 5. Production Release Instructions

### Step 1: Download the Signed Android App Bundle (.aab)
Your build is generated via EAS Cloud:
- Expo Dashboard: https://expo.dev/accounts/ravijshankar/projects/thirukkural/builds
- Download the generated `.aab` file from the completed build.

### Step 2: Upload to Google Play Console
1. Open [Google Play Console](https://play.google.com/console).
2. Select your app (or click **Create App** with Name `திருக்குறள் - Thirukkural`, Language: `English / Tamil`, App, Free).
3. Complete the **Set up your app** checklist using the answers in Section 4 above.
4. Upload `play-store-icon.png` (512x512) and `play-store-feature-graphic.png` (1024x500).
5. Go to **Release** > **Production** > **Create new release**.
6. Upload the downloaded `.aab` file.
7. Enter Release notes:
```text
Initial release of Thirukkural (திருக்குறள்) mobile app.
• Complete 1,330 couplets across 133 chapters and 3 sections.
• 4 commentaries: Mu. Va, Solomon Pappaiah, Karunanidhi, and G.U. Pope.
• Instant bilingual search.
• Personal collections and Word (.docx) / Text export.
• 100% offline & completely ad-free.
```
8. Click **Save** > **Review release** > **Start rollout to Production**! 🎉
