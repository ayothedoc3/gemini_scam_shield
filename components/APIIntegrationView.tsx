import React, { useState } from 'react';
import { Code, Copy, Check, Webhook, Zap, Shield, Bot, Plug } from 'lucide-react';

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

      {/* One-Click VoIP/CRM Integrations */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plug className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">One-Click Platform Integrations</h2>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Connect CallGuard to your existing VoIP and CRM infrastructure with pre-built integrations
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Twilio */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-500/30 transition-colors">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#F22F46">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 21c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm3-13.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-6 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
                </svg>
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Twilio</h4>
              <span className="text-xs text-green-400 font-medium">Available Now</span>
            </div>
          </div>

          {/* RingCentral */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-500/30 transition-colors">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#FF6600">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">RingCentral</h4>
              <span className="text-xs text-green-400 font-medium">Available Now</span>
            </div>
          </div>

          {/* Zoom Phone */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-500/30 transition-colors">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#2D8CFF">
                  <path d="M3 7a1 1 0 011-1h4a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7zm12-4a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1h-4a1 1 0 01-1-1V3z"/>
                </svg>
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Zoom Phone</h4>
              <span className="text-xs text-green-400 font-medium">Available Now</span>
            </div>
          </div>

          {/* Microsoft Teams */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-500/30 transition-colors">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#5059C9">
                  <rect x="2" y="2" width="9" height="9" rx="1"/>
                  <rect x="13" y="2" width="9" height="9" rx="1"/>
                  <rect x="2" y="13" width="9" height="9" rx="1"/>
                  <rect x="13" y="13" width="9" height="9" rx="1"/>
                </svg>
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">MS Teams</h4>
              <span className="text-xs text-yellow-400 font-medium">Coming Soon</span>
            </div>
          </div>

          {/* Salesforce */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-cyan-500/30 transition-colors">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#00A1E0">
                  <path d="M10.5 3C6.4 3 3 6.4 3 10.5c0 1.8.6 3.4 1.7 4.7l-.9 3.4 3.5-.9c1.3 1 2.9 1.6 4.7 1.6 4.1 0 7.5-3.4 7.5-7.5S14.6 3 10.5 3z"/>
                </svg>
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Salesforce</h4>
              <span className="text-xs text-green-400 font-medium">Available Now</span>
            </div>
          </div>

          {/* HubSpot */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-500/30 transition-colors">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#FF7A59">
                  <circle cx="18" cy="6" r="3"/>
                  <circle cx="6" cy="18" r="3"/>
                  <path d="M12 9L12 15M9 12L15 12" stroke="#FF7A59" strokeWidth="2"/>
                </svg>
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">HubSpot</h4>
              <span className="text-xs text-green-400 font-medium">Available Now</span>
            </div>
          </div>

          {/* Genesys Cloud */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-500/30 transition-colors">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#A020F0">
                  <path d="M12 2L2 7v10c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5z"/>
                </svg>
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Genesys</h4>
              <span className="text-xs text-yellow-400 font-medium">Coming Soon</span>
            </div>
          </div>

          {/* Five9 */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-500/30 transition-colors">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#00B140">
                  <text x="4" y="18" fontSize="16" fontWeight="bold">5</text>
                  <text x="12" y="18" fontSize="16" fontWeight="bold">9</text>
                </svg>
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Five9</h4>
              <span className="text-xs text-yellow-400 font-medium">Coming Soon</span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4">
          <p className="text-sm text-indigo-200">
            <strong>Enterprise Integration Support:</strong> Need a custom integration for your platform? Our team can build custom connectors for your specific infrastructure. Contact sales for details.
          </p>
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
