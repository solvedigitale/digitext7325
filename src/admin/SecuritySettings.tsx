import React, { useState } from 'react';
import { Shield, Key, Lock, RefreshCw } from 'lucide-react';

export function SecuritySettings() {
  const [apiKey, setApiKey] = useState('sk_test_WH1tELabPr0ductI0nK3y');
  const [webhookSecret, setWebhookSecret] = useState('whsec_M3ssag1ngPlatf0rmS3cr3t');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const regenerateApiKey = () => {
    if (window.confirm('Are you sure you want to regenerate the API key? All existing integrations will need to be updated.')) {
      setIsRegenerating(true);
      
      // Simulate API call
      setTimeout(() => {
        setApiKey(`sk_test_${Math.random().toString(36).substring(2, 15)}`);
        setIsRegenerating(false);
      }, 1500);
    }
  };
  
  const regenerateWebhookSecret = () => {
    if (window.confirm('Are you sure you want to regenerate the webhook secret? All webhook configurations will need to be updated.')) {
      setIsRegenerating(true);
      
      // Simulate API call
      setTimeout(() => {
        setWebhookSecret(`whsec_${Math.random().toString(36).substring(2, 15)}`);
        setIsRegenerating(false);
      }, 1500);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">API Security</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage API keys and webhook secrets
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-md font-medium text-gray-900">API Key</h3>
                <p className="text-sm text-gray-500">Used for authenticating API requests</p>
              </div>
              
              <button
                onClick={regenerateApiKey}
                disabled={isRegenerating}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center"
              >
                {isRegenerating ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Regenerate
              </button>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    readOnly
                    className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <p className="mt-2 text-xs text-gray-500">
                Keep this key secure. Do not share it in public repositories or client-side code.
              </p>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-md font-medium text-gray-900">Webhook Secret</h3>
                <p className="text-sm text-gray-500">Used to verify webhook payloads</p>
              </div>
              
              <button
                onClick={regenerateWebhookSecret}
                disabled={isRegenerating}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center"
              >
                {isRegenerating ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Regenerate
              </button>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center">
                <div className="flex-1 relative">
                  <input
                    type={showWebhookSecret ? 'text' : 'password'}
                    value={webhookSecret}
                    readOnly
                    className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showWebhookSecret ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <p className="mt-2 text-xs text-gray-500">
                This secret is used to verify that webhook requests are coming from our service.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Security Recommendations</h2>
          <p className="mt-1 text-sm text-gray-500">
            Best practices for securing your messaging platform
          </p>
        </div>
        
        <div className="px-4 py-5 sm:px-6">
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Use HTTPS for all API endpoints</p>
                <p className="text-sm text-gray-500">
                  Ensure all communication with the API is encrypted using HTTPS.
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Rotate API keys regularly</p>
                <p className="text-sm text-gray-500">
                  Regenerate your API keys every 90 days to minimize the risk of unauthorized access.
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Implement IP restrictions</p>
                <p className="text-sm text-gray-500">
                  Limit API access to specific IP addresses or ranges for additional security.
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Enable two-factor authentication</p>
                <p className="text-sm text-gray-500">
                  Require two-factor authentication for all admin users.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}