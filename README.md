<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Scam Shield - AI-Powered Voice Scam Detector

Real-time voice deepfake and scam detection powered by Google Gemini AI. A fully-featured Progressive Web App (PWA) that protects you from phone scams and AI-generated voice fraud.

View your app in AI Studio: https://ai.studio/apps/drive/1YPwXv9JFc9ZRKEhHiw8pBYOn8wtktzqC

## Features

✅ **Live Protection** - Real-time audio analysis during phone calls (speakerphone mode)
✅ **Audio Upload** - Analyze pre-recorded voicemails and audio files
✅ **4-Method Detection** - Spectral, biometric, contextual, and AI pattern analysis
✅ **PWA Support** - Install as native app on mobile/desktop with offline support
✅ **Analysis History** - Review past detections and risk assessments
✅ **Alert System** - Automatic warnings for high-risk detections (≥85% score)

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your Gemini API key
   ```
   Get your API key from: https://aistudio.google.com/apikey

3. **Run the app:**
   ```bash
   npm run dev
   ```
   App will be available at http://localhost:3000

4. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

## PWA Installation

### Desktop (Chrome/Edge/Brave)
1. Visit the app URL
2. Click the install icon in the address bar
3. Or use the in-app install prompt
4. App launches as standalone application

### Mobile (Android)
1. Open in Chrome browser
2. Tap "Add to Home Screen" from menu
3. App installs with icon on home screen

### Mobile (iOS/Safari)
1. Open in Safari browser
2. Tap Share button → "Add to Home Screen"
3. App appears on home screen

For detailed PWA features and implementation, see [PWA_IMPLEMENTATION.md](PWA_IMPLEMENTATION.md)

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **AI**: Google Gemini 2.5 Flash (Live API & Standard API)
- **Build Tool**: Vite 6 with PWA plugin
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PWA**: Workbox service worker with advanced caching

## How It Works

### Detection Methods (Weighted Scoring)
1. **Spectral Analysis (30%)** - Detects unusual harmonics and artificial frequency patterns
2. **Voice Biometric Analysis (35%)** - Identifies irregular breathing, flat tone, robotic pacing
3. **Contextual Analysis (20%)** - Scans for scam keywords (e.g., "verify account", "IRS", "urgent")
4. **Audio Intelligence (15%)** - Catches unnaturally consistent speech patterns

### Aggregate Risk Score
- **0-40**: Low Risk (likely legitimate)
- **40-70**: Medium Risk (proceed with caution)
- **70-85**: High Risk (strong scam indicators)
- **85-100**: Critical Risk (automatic alert triggered)

## Project Structure

```
gemini_scam_shield/
├── components/          # React components
│   ├── ProtectView.tsx     # Live protection interface
│   ├── UploadView.tsx      # Audio file upload & analysis
│   ├── HistoryView.tsx     # Analysis history
│   └── ...
├── hooks/
│   └── useScamShield.ts    # Core detection logic & Gemini integration
├── public/              # Static assets & PWA icons
├── types.ts             # TypeScript type definitions
├── vite.config.ts       # Build & PWA configuration
└── manifest.json        # PWA manifest
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is open source and available under the MIT License.
