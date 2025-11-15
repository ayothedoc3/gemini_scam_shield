import React, { useState } from 'react';
import { Code, Copy, Check, Webhook, Zap, Shield, Bot } from 'lucide-react';

const APIIntegrationView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const webhookExample = `// Integrate CallGuard into your AI agent workflow
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
}`;

  const webhookCallbackExample = `// Receive real-time alerts via webhook
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
});`;

  const pythonExample = `import requests

# Protect your AI agent from voice scams
def analyze_call(audio_stream, agent_id):
    response = requests.post(
        'https://api.callguard.ai/v1/analyze',
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'audioStream': audio_stream,
            'agentId': agent_id,
            'agentType': 'ai',
            'realtime': True
        }
    )

    analysis = response.json()

    # Implement custom security logic
    if analysis['riskScore'] > 70:
        handle_threat(analysis)

    return analysis`;

  const CodeBlock = ({ code, language, section }: { code: string; language: string; section: string }) => (
    <div className="relative">
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <span className="text-xs text-gray-500 uppercase">{language}</span>
        <button
          onClick={() => copyToClipboard(code, section)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          {copiedSection === section ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      <pre className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 overflow-x-auto text-sm">
        <code className="text-gray-300">{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">API Integration</h1>
        <p className="text-gray-400">
          Integrate CallGuard protection directly into your AI agent infrastructure
        </p>
      </div>

      {/* Integration Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="bg-indigo-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Real-Time Protection</h3>
          <p className="text-sm text-gray-400">
            Stream audio directly to our API for instant threat detection during live calls
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Webhook className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Webhook Alerts</h3>
          <p className="text-sm text-gray-400">
            Receive instant notifications when threats are detected - automate your response
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="bg-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Bot className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI Agent Ready</h3>
          <p className="text-sm text-gray-400">
            Purpose-built for protecting autonomous AI agents from voice-based attacks
          </p>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Quick Start - JavaScript/TypeScript</h2>
        </div>
        <CodeBlock code={webhookExample} language="TypeScript" section="webhook" />
      </div>

      {/* Webhook Callbacks */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Webhook className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Receive Webhook Alerts</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Configure your endpoint to receive real-time threat notifications
        </p>
        <CodeBlock code={webhookCallbackExample} language="JavaScript" section="callback" />
      </div>

      {/* Python Example */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-green-400" />
          <h2 className="text-xl font-bold text-white">Python Integration</h2>
        </div>
        <CodeBlock code={pythonExample} language="Python" section="python" />
      </div>

      {/* API Response Format */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">API Response Format</h2>
        <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`{
  "riskScore": 87,
  "threat": "CEO Fraud Attempt",
  "confidence": 0.94,
  "agentId": "support-bot-alpha",
  "timestamp": "2024-01-15T10:30:45Z",
  "analysis": {
    "spectral": {
      "score": 82,
      "details": "Frequency anomalies detected"
    },
    "biometric": {
      "score": 91,
      "details": "Synthetic voice patterns identified"
    },
    "contextual": {
      "score": 85,
      "details": "High-risk keywords: urgent, wire transfer, CEO"
    },
    "intelligence": {
      "score": 90,
      "details": "AI-generated speech patterns detected"
    }
  },
  "transcript": "This is the CEO. I need you to process an urgent wire transfer...",
  "recommendation": "TERMINATE_CALL"
}`}
          </pre>
        </div>
      </div>

      {/* Enterprise Features */}
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-lg">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Enterprise Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-semibold text-indigo-300 mb-2">Security & Compliance</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• SOC 2 Type II Certified</li>
                  <li>• End-to-end encryption</li>
                  <li>• GDPR & CCPA compliant</li>
                  <li>• Audit logs & compliance reports</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-indigo-300 mb-2">Performance & Scale</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 99.99% uptime SLA</li>
                  <li>• &lt;100ms analysis latency</li>
                  <li>• Auto-scaling infrastructure</li>
                  <li>• Unlimited agent protection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-800/50 border border-indigo-500/50 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Ready to Protect Your AI Agents?</h3>
        <p className="text-gray-400 mb-4">
          Get your API key and start integrating enterprise-grade scam protection today
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Get API Key
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            View Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default APIIntegrationView;
