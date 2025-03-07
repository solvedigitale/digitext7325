import React, { useState, useEffect } from 'react';
import { Send, Copy, CheckCircle, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { socket } from '../services/socket';

interface WebhookTesterProps {
  webhookUrl: string;
  platform: 'meta' | 'whatsapp';
}

export function WebhookTester({ webhookUrl, platform }: WebhookTesterProps) {
  const [url, setUrl] = useState(webhookUrl);
  const [verifyToken, setVerifyToken] = useState('digitext_webhook_verification_123');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [testMode, setTestMode] = useState<'verification' | 'message'>('verification');
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Sample webhook payload for testing
  const samplePayload = platform === 'meta' ? {
    "field": "messages",
    "value": {
      "sender": {
        "id": "12334"
      },
      "recipient": {
        "id": "23245"
      },
      "timestamp": new Date().getTime().toString(),
      "message": {
        "mid": "test_message_id",
        "text": "This is a test message from webhook tester"
      }
    }
  } : {
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "+1555123456",
            "phone_number_id": "PHONE_NUMBER_ID"
          },
          "contacts": [{
            "profile": {
              "name": "Test User"
            },
            "wa_id": "PHONE_NUMBER"
          }],
          "messages": [{
            "from": "PHONE_NUMBER",
            "id": "wamid.ID",
            "timestamp": new Date().getTime().toString(),
            "text": {
              "body": "This is a test WhatsApp message"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  };
  
  // Connect to socket to listen for responses
  useEffect(() => {
    const onConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
    };
    
    const onDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };
    
    const onInstagramMessage = (data: any) => {
      console.log('Instagram message received:', data);
      setReceivedMessages(prev => [
        { 
          id: Date.now(), 
          platform: 'instagram', 
          data, 
          timestamp: new Date().toLocaleTimeString() 
        }, 
        ...prev
      ]);
      
      setTestResponse(prev => 
        `${prev || ''}\n\nReceived webhook response via socket:\n${JSON.stringify(data, null, 2)}`
      );
    };
    
    const onWhatsAppMessage = (data: any) => {
      console.log('WhatsApp message received:', data);
      setReceivedMessages(prev => [
        { 
          id: Date.now(), 
          platform: 'whatsapp', 
          data, 
          timestamp: new Date().toLocaleTimeString() 
        }, 
        ...prev
      ]);
      
      setTestResponse(prev => 
        `${prev || ''}\n\nReceived webhook response via socket:\n${JSON.stringify(data, null, 2)}`
      );
    };
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    
    if (platform === 'meta') {
      socket.on('instagram_message', onInstagramMessage);
    } else {
      socket.on('whatsapp_message', onWhatsAppMessage);
    }
    
    // Check initial connection state
    setIsConnected(socket.connected);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      
      if (platform === 'meta') {
        socket.off('instagram_message', onInstagramMessage);
      } else {
        socket.off('whatsapp_message', onWhatsAppMessage);
      }
    };
  }, [platform]);
  
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
      const verificationUrl = `${url}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=CHALLENGE_ACCEPTED`;
      
      const response = await fetch(verificationUrl);
      const text = await response.text();
      
      if (response.ok) {
        setTestResponse(`✅ Verification successful!\nStatus: ${response.status}\nResponse: ${text}`);
      } else {
        setTestResponse(`❌ Verification failed!\nStatus: ${response.status}\nResponse: ${text}`);
      }
    } catch (error) {
      console.error('Webhook verification test failed:', error);
      setTestResponse(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const testMessageWebhook = async () => {
    setIsLoading(true);
    setTestResponse(null);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(samplePayload),
      });
      
      const text = await response.text();
      
      if (response.ok) {
        setTestResponse(`✅ Message sent successfully!\nStatus: ${response.status}\nResponse: ${text}\n\nWaiting for socket response...`);
      } else {
        setTestResponse(`❌ Message delivery failed!\nStatus: ${response.status}\nResponse: ${text}`);
      }
      
      // Add the sent message to the list
      setReceivedMessages(prev => [
        { 
          id: Date.now(), 
          platform: platform === 'meta' ? 'instagram' : 'whatsapp', 
          data: samplePayload, 
          timestamp: new Date().toLocaleTimeString(),
          sent: true
        }, 
        ...prev
      ]);
    } catch (error) {
      console.error('Webhook message test failed:', error);
      setTestResponse(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearMessages = () => {
    setReceivedMessages([]);
    setTestResponse(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">
          {platform === 'meta' ? 'Meta Platform' : 'WhatsApp'} Webhook Tester
        </h1>
        
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-500">
            {isConnected ? 'Connected to server' : 'Disconnected from server'}
          </span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook URL
            </label>
            <div className="flex">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                onClick={() => copyToClipboard(url, 'url')}
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
          
          <div className="flex justify-between">
            <button
              onClick={clearMessages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Clear Results
            </button>
            
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
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Webhook Events</h2>
        
        <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
          {receivedMessages.length > 0 ? (
            receivedMessages.map((msg) => (
              <div key={msg.id} className="py-3">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className={`p-1 rounded-full ${
                      msg.platform === 'instagram' ? 'bg-pink-100 text-pink-600' :
                      msg.platform === 'messenger' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <Info className="h-4 w-4" />
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                      {msg.platform} {msg.sent ? 'Sent' : 'Received'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{msg.timestamp}</span>
                </div>
                
                <div className="mt-1 text-sm text-gray-700">
                  {msg.data?.value?.message?.text && (
                    <p>Message: {msg.data.value.message.text}</p>
                  )}
                  {msg.data?.messages?.[0]?.text?.body && (
                    <p>Message: {msg.data.messages[0].text.body}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500">No webhook events yet</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          {platform === 'meta' ? 'Meta Platform' : 'WhatsApp'} Webhook Testing Instructions
        </h3>
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