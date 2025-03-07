import React, { useState } from 'react';

export function WebhookTesting() {
  const [activeTab, setActiveTab] = useState<'meta' | 'whatsapp'>('meta');
  const [webhookUrl, setWebhookUrl] = useState('https://digitext-backend.onrender.com/webhook');
  const [verifyToken, setVerifyToken] = useState('digitext_webhook_verification_123');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [testMode, setTestMode] = useState<'verification' | 'message'>('verification');
  
  // Sample webhook payload for testing
  const metaPayload = {
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
  };
  
  const whatsappPayload = {
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
      const payload = activeTab === 'meta' ? metaPayload : whatsappPayload;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      let responseText;
      try {
        const data = await response.json();
        responseText = JSON.stringify(data, null, 2);
      } catch (e) {
        responseText = await response.text();
      }
      
      if (response.ok) {
        setTestResponse(`✅ Message sent successfully!\nStatus: ${response.status}\nResponse: ${responseText}\n\nCheck the socket response in your application.`);
      } else {
        setTestResponse(`❌ Message delivery failed!\nStatus: ${response.status}\nResponse: ${responseText}`);
      }
    } catch (error) {
      console.error('Webhook message test failed:', error);
      setTestResponse(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Webhook Testing</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Webhook Testing Tools</h2>
          <p className="mt-1 text-sm text-gray-500">
            Test your webhook endpoints for different messaging platforms
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div className="flex space-x-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('meta')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'meta' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Meta Platform
              </button>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'whatsapp' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                WhatsApp
              </button>
            </div>
            
            <div className="pt-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verify Token
                  </label>
                  <input
                    type="text"
                    value={verifyToken}
                    onChange={(e) => setVerifyToken(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
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
                        {JSON.stringify(activeTab === 'meta' ? metaPayload : whatsappPayload, null, 2)}
                      </pre>
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
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Testing...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
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
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Webhook Setup Guide</h2>
          <p className="mt-1 text-sm text-gray-500">
            How to configure webhooks for Meta platforms
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Meta Platform Webhook Setup</h3>
              <ol className="mt-2 space-y-2 list-decimal pl-5 text-gray-700">
                <li>Go to your Meta Developer Dashboard</li>
                <li>Select your app and navigate to the Webhooks section</li>
                <li>Click "Add Subscription" and select the product (Instagram, Messenger)</li>
                <li>Enter your webhook URL: <code className="bg-gray-100 px-1 py-0.5 rounded">https://digitext-backend.onrender.com/webhook</code></li>
                <li>Enter your verify token: <code className="bg-gray-100 px-1 py-0.5 rounded">digitext_webhook_verification_123</code></li>
                <li>Select the fields you want to subscribe to (e.g., messages, messaging_postbacks)</li>
                <li>Click "Verify and Save"</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">WhatsApp Webhook Setup</h3>
              <ol className="mt-2 space-y-2 list-decimal pl-5 text-gray-700">
                <li>Go to your WhatsApp Business Platform dashboard</li>
                <li>Navigate to the Webhooks section</li>
                <li>Enter your webhook URL: <code className="bg-gray-100 px-1 py-0.5 rounded">https://digitext-backend.onrender.com/webhooks/whatsapp</code></li>
                <li>Enter your verify token: <code className="bg-gray-100 px-1 py-0.5 rounded">digitext_webhook_verification_123</code></li>
                <li>Select the fields you want to subscribe to (e.g., messages, message_status_updates)</li>
                <li>Click "Verify and Save"</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}