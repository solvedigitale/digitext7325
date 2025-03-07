import React, { useState } from 'react';
import { Send, Copy, CheckCircle, RefreshCw } from 'lucide-react';
import { socket } from '../services/socket';

export function WebhookTester() {
  const [webhookUrl, setWebhookUrl] = useState('https://digitext-backend.onrender.com/webhooks/meta');
  const [verifyToken, setVerifyToken] = useState('digitext_webhook_verification_123');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [testMode, setTestMode] = useState<'verification' | 'message'>('verification');
  
  // Sample webhook payload for testing
  const samplePayload = {
    "field": "messages",
    "value": {
      "sender": {
        "id": "12334"
      },
      "recipient": {
        "id": "23245"
      },
      "timestamp": "1527459824",
      "message": {
        "mid": "test_message_id",
        "text": "test_message",
        "commands": [
          {
            "name": "command123"
          },
          {
            "name": "command456"
          }
        ]
      }
    }
  };
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [id]: true });
    setTimeout(() => {
      setCopied({ ...copied, [id]: false });
    }, 2000);
  };
  
  const testVerification = async () => {
    setIsLoading(true);
    setTestResponse(null);
    
    try {
      // Construct verification URL with query parameters
      const verificationUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=CHALLENGE_ACCEPTED`;
      
      const response = await fetch(verificationUrl);
      const text = await response.text();
      
      setTestResponse(`Status: ${response.status}\nResponse: ${text}`);
    } catch (error) {
      console.error('Webhook verification test failed:', error);
      setTestResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const testMessageWebhook = async () => {
    setIsLoading(true);
    setTestResponse(null);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(samplePayload),
      });
      
      const text = await response.text();
      setTestResponse(`Status: ${response.status}\nResponse: ${text}`);
      
      // Listen for socket event
      const messageHandler = (data: any) => {
        console.log('Received webhook test response via socket:', data);
        setTestResponse(prev => `${prev}\n\nSocket event received: ${JSON.stringify(data, null, 2)}`);
        // Remove listener after receiving
        socket.off('instagram_message', messageHandler);
      };
      
      socket.on('instagram_message', messageHandler);
      
      // Remove listener after timeout
      setTimeout(() => {
        socket.off('instagram_message', messageHandler);
      }, 10000);
      
    } catch (error) {
      console.error('Webhook message test failed:', error);
      setTestResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Meta Webhook Tester</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Webhook URL
          </label>
          <div className="flex">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              onClick={() => copyToClipboard(webhookUrl, 'url')}
              className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
            >
              {copied['url'] ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Verify Token
          </label>
          <div className="flex">
            <input
              type="text"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              onClick={() => copyToClipboard(verifyToken, 'token')}
              className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
            >
              {copied['token'] ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setTestMode('verification')}
            className={`px-4 py-2 rounded-md ${
              testMode === 'verification' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Verification Test
          </button>
          
          <button
            onClick={() => setTestMode('message')}
            className={`px-4 py-2 rounded-md ${
              testMode === 'message' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Message Test
          </button>
        </div>
        
        {testMode === 'message' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sample Payload
            </label>
            <div className="relative">
              <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto max-h-40 border border-gray-200">
                {JSON.stringify(samplePayload, null, 2)}
              </pre>
              <button
                onClick={() => copyToClipboard(JSON.stringify(samplePayload, null, 2), 'payload')}
                className="absolute top-2 right-2 p-1 bg-white rounded-md shadow-sm hover:bg-gray-100"
              >
                {copied['payload'] ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={testMode === 'verification' ? testVerification : testMessageWebhook}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                {testMode === 'verification' ? 'Test Verification' : 'Send Test Message'}
              </>
            )}
          </button>
        </div>
        
        {testResponse && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Response
            </label>
            <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto max-h-60 border border-gray-200">
              {testResponse}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Meta Webhook Testing Instructions</h3>
        <ol className="text-sm text-blue-700 space-y-2 list-decimal pl-5">
          <li>
            <strong>Verification Test:</strong> Tests the webhook verification process that Meta uses to confirm your endpoint.
          </li>
          <li>
            <strong>Message Test:</strong> Sends a sample message payload to your webhook endpoint to test message handling.
          </li>
          <li>
            For Meta app review, you'll need to ensure both tests work correctly before submitting.
          </li>
          <li>
            Make sure your server is publicly accessible and can receive webhook events from Meta.
          </li>
        </ol>
      </div>
    </div>
  );
}