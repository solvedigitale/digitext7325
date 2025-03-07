import React, { useState } from 'react';
import { Copy, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export function WebhookSettings() {
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [webhookStatus, setWebhookStatus] = useState<Record<string, 'active' | 'inactive' | 'error'>>({
    meta: 'inactive',
    whatsapp: 'inactive',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Use window.location to determine the base URL
  const baseUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3002' 
    : 'https://digitext-backend.onrender.com';
  
  // Use hardcoded values instead of process.env
  const META_VERIFY_TOKEN = 'digitext_webhook_verification_123';
  
  const webhooks = [
    {
      id: 'meta',
      name: 'Meta Platform Webhook',
      description: 'For Instagram and Facebook Messenger',
      url: `${baseUrl}/webhooks/meta`,
      verifyToken: META_VERIFY_TOKEN,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business Webhook',
      description: 'For WhatsApp Business API',
      url: `${baseUrl}/webhooks/whatsapp`,
      verifyToken: META_VERIFY_TOKEN,
    },
  ];
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [id]: true });
    setTimeout(() => {
      setCopied({ ...copied, [id]: false });
    }, 2000);
  };
  
  const checkWebhookStatus = async (id: string) => {
    setIsLoading(true);
    
    // Simulate API call to check webhook status
    setTimeout(() => {
      // Random status for demo purposes
      const statuses: Array<'active' | 'inactive' | 'error'> = ['active', 'inactive', 'error'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      setWebhookStatus({ ...webhookStatus, [id]: randomStatus });
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Webhook Settings</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Webhook Configuration</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure webhooks to receive real-time updates from messaging platforms
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-md font-medium text-gray-900">{webhook.name}</h3>
                  <p className="text-sm text-gray-500">{webhook.description}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {webhookStatus[webhook.id] === 'active' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  )}
                  
                  {webhookStatus[webhook.id] === 'inactive' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                  
                  {webhookStatus[webhook.id] === 'error' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Error
                    </span>
                  )}
                  
                  <button
                    onClick={() => checkWebhookStatus(webhook.id)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Check Status
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Webhook URL</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow">
                      <input
                        type="text"
                        value={webhook.url}
                        readOnly
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(webhook.url, `${webhook.id}-url`)}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                    >
                      {copied[`${webhook.id}-url`] ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500">Verify Token</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow">
                      <input
                        type="text"
                        value={webhook.verifyToken}
                        readOnly
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(webhook.verifyToken, `${webhook.id}-token`)}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                    >
                      {copied[`${webhook.id}-token`] ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Setup Instructions</h4>
                <div className="mt-2 text-sm text-gray-500 space-y-2">
                  <p>1. Go to your Meta Developer Dashboard or WhatsApp Business Dashboard</p>
                  <p>2. Navigate to Webhooks section and add a new webhook</p>
                  <p>3. Enter the Webhook URL and Verify Token shown above</p>
                  <p>4. Subscribe to the following webhook events:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {webhook.id === 'meta' && (
                      <>
                        <li>messages</li>
                        <li>messaging_postbacks</li>
                        <li>message_deliveries</li>
                        <li>message_reads</li>
                      </>
                    )}
                    {webhook.id === 'whatsapp' && (
                      <>
                        <li>messages</li>
                        <li>message_status_updates</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}