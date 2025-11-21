# CallGuard Mobile - React Native Setup Guide

Complete guide for building the CallGuard mobile app for iOS and Android with real phone call audio interception.

## 🚀 Quick Start

```bash
# Create React Native project
npx react-native@latest init CallGuardMobile
cd CallGuardMobile

# Install dependencies
npm install @react-native-voice/voice react-native-sound react-native-permissions axios
```

## 📱 What You'll Build

A native mobile app that:
- ✅ Intercepts real phone call audio (Android & iOS)
- ✅ Streams audio to CallGuard API for analysis
- ✅ Shows real-time threat detection
- ✅ Alerts users to scam calls automatically
- ✅ Works for NordVPN integration

---

## Part 1: Setup React Native Project

### Step 1: Initialize Project

```bash
npx react-native@latest init CallGuardMobile
cd CallGuardMobile
```

### Step 2: Install Required Packages

```bash
# Audio & Permissions
npm install @react-native-voice/voice
npm install react-native-sound
npm install react-native-permissions
npm install react-native-fs

# API & State Management
npm install axios
npm install @react-native-async-storage/async-storage
npm install react-native-gesture-handler react-native-reanimated

# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# UI Components
npm install react-native-vector-icons
```

---

## Part 2: Android Call Interception

### Step 1: Add Permissions

**`android/app/src/main/AndroidManifest.xml`:**

```xml
<manifest>
    <!-- Add these permissions -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.READ_CALL_LOG" />
    <uses-permission android:name="android.permission.MANAGE_OWN_CALLS" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

    <application>
        <!-- Add InCallService -->
        <service
            android:name=".CallGuardInCallService"
            android:permission="android.permission.BIND_INCALL_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.telecom.InCallService"/>
            </intent-filter>
        </service>
    </application>
</manifest>
```

### Step 2: Create InCallService

**`android/app/src/main/java/com/callguardmobile/CallGuardInCallService.java`:**

```java
package com.callguardmobile;

import android.media.MediaRecorder;
import android.media.AudioRecord;
import android.media.AudioFormat;
import android.telecom.Call;
import android.telecom.InCallService;
import android.util.Log;
import java.io.IOException;

public class CallGuardInCallService extends InCallService {
    private static final String TAG = "CallGuardInCall";
    private AudioRecord audioRecord;
    private boolean isRecording = false;

    @Override
    public void onCallAdded(Call call) {
        super.onCallAdded(call);
        Log.d(TAG, "Call added, starting audio capture");
        startAudioCapture();
    }

    @Override
    public void onCallRemoved(Call call) {
        super.onCallRemoved(call);
        Log.d(TAG, "Call removed, stopping audio capture");
        stopAudioCapture();
    }

    private void startAudioCapture() {
        int sampleRate = 44100;
        int bufferSize = AudioRecord.getMinBufferSize(
            sampleRate,
            AudioFormat.CHANNEL_IN_STEREO,
            AudioFormat.ENCODING_PCM_16BIT
        );

        audioRecord = new AudioRecord(
            MediaRecorder.AudioSource.VOICE_COMMUNICATION,
            sampleRate,
            AudioFormat.CHANNEL_IN_STEREO,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize
        );

        audioRecord.startRecording();
        isRecording = true;

        new Thread(() -> {
            byte[] audioData = new byte[bufferSize];
            while (isRecording) {
                int bytesRead = audioRecord.read(audioData, 0, bufferSize);
                if (bytesRead > 0) {
                    // Send to CallGuard API
                    sendToCallGuardAPI(audioData);
                }
            }
        }).start();
    }

    private void stopAudioCapture() {
        isRecording = false;
        if (audioRecord != null) {
            audioRecord.stop();
            audioRecord.release();
            audioRecord = null;
        }
    }

    private void sendToCallGuardAPI(byte[] audioData) {
        // TODO: Implement API call to CallGuard
        // This will be handled by React Native side
        Log.d(TAG, "Audio data captured: " + audioData.length + " bytes");
    }
}
```

---

## Part 3: iOS Call Interception

### Step 1: Add Permissions

**`ios/CallGuardMobile/Info.plist`:**

```xml
<dict>
    <key>NSMicrophoneUsageDescription</key>
    <string>CallGuard needs microphone access to protect you from voice scams</string>

    <key>NSSpeechRecognitionUsageDescription</key>
    <string>Analyze calls for fraud detection</string>

    <key>UIBackgroundModes</key>
    <array>
        <string>audio</string>
        <string>voip</string>
    </array>
</dict>
```

### Step 2: Create CallKit Manager

**`ios/CallGuardMobile/CallKitManager.swift`:**

```swift
import CallKit
import AVFoundation

@objc(CallKitManager)
class CallKitManager: NSObject {
    private var audioEngine = AVAudioEngine()
    private var isCapturing = false

    @objc
    func startAudioCapture() {
        setupAudioSession()
        captureAudio()
    }

    @objc
    func stopAudioCapture() {
        audioEngine.stop()
        audioEngine.reset()
        isCapturing = false
    }

    private func setupAudioSession() {
        let audioSession = AVAudioSession.sharedInstance()
        try? audioSession.setCategory(.playAndRecord, mode: .voiceChat)
        try? audioSession.setActive(true)
    }

    private func captureAudio() {
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) {
            (buffer, time) in
            // Send to CallGuard API
            self.sendToCallGuardAPI(buffer: buffer)
        }

        audioEngine.prepare()
        try? audioEngine.start()
        isCapturing = true
    }

    private func sendToCallGuardAPI(buffer: AVAudioPCMBuffer) {
        // TODO: Send to React Native bridge
        print("Audio buffer captured: \\(buffer.frameLength) frames")
    }
}
```

---

## Part 4: React Native Integration

### CallGuard API Service

**`src/services/CallGuardAPI.ts`:**

```typescript
import axios from 'axios';

const API_URL = 'https://api.callguard.ai/v1';
const API_KEY = process.env.CALLGUARD_API_KEY || 'your_api_key_here';

export interface ThreatAnalysis {
  riskScore: number;
  threat: string;
  confidence: number;
  analysis: {
    spectral: { score: number; details: string };
    biometric: { score: number; details: string };
    contextual: { score: number; details: string };
    intelligence: { score: number; details: string };
  };
  transcript: string;
  recommendation: string;
}

export class CallGuardAPI {
  static async analyzeAudioStream(audioData: ArrayBuffer): Promise<ThreatAnalysis> {
    try {
      const response = await axios.post(
        `${API_URL}/analyze`,
        audioData,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/octet-stream',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('CallGuard API Error:', error);
      throw error;
    }
  }

  static async streamAudio(audioChunk: Uint8Array): Promise<void> {
    // WebSocket streaming for real-time analysis
    const ws = new WebSocket(`wss://api.callguard.ai/v1/stream`);

    ws.onopen = () => {
      ws.send(audioChunk);
    };

    ws.onmessage = (event) => {
      const analysis = JSON.parse(event.data);
      console.log('Real-time analysis:', analysis);
      // Handle threat detection
    };
  }
}
```

---

## Part 5: Testing the App

### Test on Android

```bash
# Enable developer mode on Android device
# Connect via USB
adb devices

# Run the app
npx react-native run-android

# Grant permissions manually
adb shell pm grant com.callguardmobile android.permission.RECORD_AUDIO
adb shell pm grant com.callguardmobile android.permission.READ_PHONE_STATE
```

### Test on iOS

```bash
# Install pods
cd ios && pod install && cd ..

# Run on iOS simulator
npx react-native run-ios

# Or run on real device
npx react-native run-ios --device "Your iPhone"
```

---

## Part 6: NordVPN Integration

For NordVPN, you can integrate at the VPN tunnel level:

**Android VPN Service:**
```java
public class NordVPNService extends VpnService {
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Intercept VoIP packets
        new Thread(() -> {
            PacketCapture capture = new PacketCapture();
            capture.onRTPPacket(packet -> {
                byte[] audioData = RTPParser.extractAudio(packet);
                CallGuardAPI.analyze(audioData);
            });
        }).start();

        return START_STICKY;
    }
}
```

---

## Troubleshooting

**Android: InCallService not working**
- Go to Settings > Apps > CallGuard > Set as default phone app
- Grant all permissions in app settings
- Restart the device

**iOS: Cannot capture call audio**
- iOS restricts native Phone app audio access
- Works for VoIP apps (WhatsApp, FaceTime, Zoom)
- For cellular calls, use speakerphone workaround

**API Connection Failed**
- Check internet connection
- Verify API key is correct
- Ensure CORS is enabled on API server
- Check firewall settings

---

## Next Steps

1. **Build the UI** - Create screens for dashboard, live protection, history
2. **Add Notifications** - Alert users when scams are detected
3. **Implement Background Service** - Keep protection active even when app is closed
4. **Test with Real Calls** - Make test calls to verify audio capture
5. **Submit to App Stores** - Prepare for iOS App Store and Google Play

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Android InCallService](https://developer.android.com/reference/android/telecom/InCallService)
- [iOS CallKit](https://developer.apple.com/documentation/callkit)
- [CallGuard API Docs](https://docs.callguard.ai)

## Support

Need help? Contact: support@callguard.ai
