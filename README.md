<div align="center">
<img width="1200" height="475" alt="CallGuard Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CallGuard - Enterprise AI Agent Protection

Real-time voice scam detection powered by Google Gemini AI, purpose-built to protect enterprise AI agents from voice-based attacks including CEO fraud, deepfakes, and payment manipulation attempts.

## Overview

CallGuard provides enterprise-grade protection for both human and AI agents against sophisticated voice scams. As AI agents increasingly handle customer support, payments, and sensitive operations, they become prime targets for voice-based social engineering attacks. CallGuard uses advanced multi-method detection to identify threats in real-time.

## 📊 Pitch Deck

View our interactive pitch deck to learn more about CallGuard's vision, market opportunity, and competitive advantages:

**[View Pitch Deck](public/pitch-deck.html)** | [Documentation](PITCH_DECK.md)

When running locally: `http://localhost:5173/pitch-deck.html`

The pitch deck includes:
- The $500K problem of AI agent vulnerability
- 4-method detection system explanation
- Market opportunity ($4.2B TAM)
- Competitive advantages
- Roadmap and funding ask

## Features

✅ **Enterprise Dashboard** - Real-time monitoring of protected agents (human & AI)
✅ **Live Protection** - Real-time audio analysis during phone calls
✅ **AI Agent Protection** - Specialized detection for AI-targeted attacks
✅ **4-Method Detection** - Spectral, biometric, contextual, and AI pattern analysis
✅ **API Integration** - RESTful API with webhook support for enterprise workflows
✅ **Audio Upload** - Analyze pre-recorded voicemails and audio files
✅ **Analysis History** - Review past detections and risk assessments
✅ **Alert System** - Automatic warnings for high-risk detections (≥85% score)
✅ **Bidirectional Scoring** - Scores increase for threats, decrease for legitimate calls

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

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **AI**: Google Gemini 2.5 Flash Native Audio Preview (Live API & Standard API)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts (for risk timeline visualization)

## How It Works

### Detection Methods (Weighted Scoring)
1. **Spectral Analysis (30%)** - Detects unusual harmonics and artificial frequency patterns
2. **Voice Biometric Analysis (35%)** - Identifies irregular breathing, flat tone, robotic pacing
3. **Contextual Analysis (20%)** - Scans for scam keywords (e.g., "verify account", "IRS", "urgent", "wire transfer")
4. **Audio Intelligence (15%)** - Catches unnaturally consistent speech patterns and AI-generated voices

### Bidirectional Risk Scoring
Unlike traditional systems, CallGuard uses bidirectional scoring:
- **Increases** when scam indicators are detected
- **Decreases** when trust indicators are found (natural conversation flow, legitimate context)
- Starts at neutral baseline (20-30) for fair assessment

### Risk Levels
- **0-40**: Low Risk (likely legitimate)
- **40-70**: Medium Risk (proceed with caution)
- **70-85**: High Risk (strong scam indicators)
- **85-100**: Critical Risk (automatic alert triggered)

## Enterprise API Integration

### Quick Start (JavaScript/TypeScript)
```javascript
// Integrate CallGuard into your AI agent workflow
const response = await fetch('https://api.callguard.ai/v1/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    audioStream: audioData,
    agentId: 'support-bot-alpha',
    agentType: 'ai',
    realtime: true
  })
});

const analysis = await response.json();
if (analysis.riskScore > 70) {
  // High risk detected - trigger security protocol
  await escalateToHuman(analysis);
}
```

### Webhook Alerts
```javascript
// Receive real-time alerts via webhook
app.post('/webhooks/callguard', (req, res) => {
  const { riskScore, threat, agentId, timestamp } = req.body;

  if (riskScore > 85) {
    // Critical threat - immediately terminate call
    aiAgent.terminateCall(agentId);
    securityTeam.alert({
      severity: 'critical',
      threat,
      agentId,
      timestamp
    });
  }

  res.status(200).send('OK');
});
```

For complete API documentation, see the API Integration tab in the app.

## Why AI Agents Need Protection

AI agents are **3x more vulnerable** to voice scams than humans because they:
- Lack human intuition to detect suspicious behavior
- Can be manipulated through prompt injection via voice
- Handle high-value transactions without emotional skepticism
- Operate 24/7 with consistent decision-making patterns that attackers can exploit

### Common Attack Vectors on AI Agents
- **CEO Fraud**: Impersonating executives to authorize fraudulent payments
- **Payment Manipulation**: Tricking agents into processing unauthorized wire transfers
- **Authorization Bypass**: Using deepfake voices to bypass security protocols
- **Calendar Manipulation**: Scheduling fake meetings or changing appointments
- **Data Exfiltration**: Convincing agents to share sensitive customer information

## Project Structure

```
gemini_scam_shield/
├── components/
│   ├── DashboardView.tsx       # Enterprise dashboard with agent stats
│   ├── ProtectView.tsx         # Live protection interface
│   ├── APIIntegrationView.tsx  # API documentation & examples
│   ├── UploadView.tsx          # Audio file upload & analysis
│   ├── HistoryView.tsx         # Analysis history
│   ├── CallGuardLogo.tsx       # CallGuard logo component
│   ├── RiskTimeline.tsx        # Real-time risk visualization
│   └── LiveTranscript.tsx      # Speaker-differentiated transcript
├── hooks/
│   └── useScamShield.ts        # Core detection logic & Gemini integration
├── types.ts                    # TypeScript type definitions
├── vite.config.ts              # Build configuration
└── manifest.json               # App manifest
```

## Use Cases

### Enterprise Call Centers
- Protect customer support AI agents from social engineering
- Monitor human agents for incoming scam calls
- Compliance and audit trails for all analyzed calls

### Financial Services
- Prevent wire transfer fraud via voice manipulation
- Detect deepfake CEO voices in payment authorization calls
- Real-time alerts for high-risk financial transactions

### Healthcare AI Agents
- Protect patient scheduling bots from malicious actors
- Prevent unauthorized access to medical records via voice
- Ensure HIPAA compliance with audit logs

### E-commerce & Logistics
- Protect order processing AI agents from fraudulent modifications
- Detect fake delivery confirmation calls
- Prevent unauthorized account access

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is open source and available under the MIT License.

---

**Built with Google Gemini 2.5 Flash Native Audio Preview**

Protecting the agentic economy, one call at a time. 🛡️
