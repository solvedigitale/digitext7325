import React, { useState, useEffect } from 'react';
import { Instagram, MessageCircle, Facebook, RefreshCw, CheckCircle, XCircle, Edit, Trash2, Plus } from 'lucide-react';
import { useStore } from '../store';
import { Platform } from '../types';
import { metaApi, whatsappApi } from '../services/api';
import { ApiConnectionWizard } from '../components/ApiConnectionWizard';

export function ApiConnections() {
  const { accounts, addAccount, removeAccount } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    platform: 'instagram' as Platform,
    accessToken: '',
    pageId: '',
    igUserId: '',
    phoneNumberId: '',
    businessId: '',
  });
  
  const platformIcons: Record<Platform, React.ReactNode> = {
    instagram: <Instagram className="h-5 w-5" />,
    whatsapp: <MessageCircle className="h-5 w-5" />,
    messenger: <Facebook className="h-5 w-5" />,
  };
  
  const platformColors: Record<Platform, string> = {
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    whatsapp: 'bg-green-500',
    messenger: 'bg-blue-500',
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      platform: 'instagram',
      accessToken: '',
      pageId: '',
      igUserId: '',
      phoneNumberId: '',
      businessId: '',
    });
  };
  
  const handleAddAccount = () => {
    setShowAddWizard(true);
  };
  
  const handleEditAccount = (account: any) => {
    setEditingAccount(account.id);
    setFormData({
      name: account.name,
      platform: account.platform,
      accessToken: account.accessToken || '',
      pageId: account.pageId || '',
      igUserId: account.igUserId || '',
      phoneNumberId: account.phoneNumberId || '',
      businessId: account.businessId || '',
    });
    setShowEditForm(true);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAccount = {
      id: editingAccount || `${formData.platform}-${Date.now()}`,
      name: formData.name,
      platform: formData.platform,
      avatar: 'https://ui-avatars.com/api/?name=IG&background=E1306C&color=fff',
      unreadCount: 0,
      accessToken: formData.accessToken,
      pageId: formData.platform === 'messenger' || formData.platform === 'instagram' ? formData.pageId : undefined,
      igUserId: formData.platform === 'instagram' ? formData.igUserId : undefined,
      phoneNumberId: formData.platform === 'whatsapp' ? formData.phoneNumberId : undefined,
      businessId: formData.businessId,
    };
    
    if (editingAccount) {
      // Update existing account
      removeAccount(editingAccount);
    }
    
    addAccount(newAccount);
    setEditingAccount(null);
    setShowEditForm(false);
    resetForm();
  };
  
  const testConnection = async (account: any) => {
    setIsLoading(true);
    setTestResults({ ...testResults, [account.id]: false });
    
    try {
      if (account.platform === 'instagram' && account.accessToken && account.igUserId) {
        // Test Instagram connection
        await metaApi.getInstagramAccounts(account.accessToken, account.pageId || '');
        setTestResults({ ...testResults, [account.id]: true });
      } else if (account.platform === 'messenger' && account.accessToken && account.pageId) {
        // Test Messenger connection
        await metaApi.getPages(account.accessToken);
        setTestResults({ ...testResults, [account.id]: true });
      } else if (account.platform === 'whatsapp' && account.accessToken && account.phoneNumberId) {
        // Test WhatsApp connection
        await whatsappApi.getBusinessProfile(account.accessToken, account.phoneNumberId);
        setTestResults({ ...testResults, [account.id]: true });
      } else {
        setTestResults({ ...testResults, [account.id]: false });
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResults({ ...testResults, [account.id]: false });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">API Connections</h1>
        <button
          onClick={handleAddAccount}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Connected Accounts</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your API connections to messaging platforms
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <div key={account.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full text-white ${platformColors[account.platform]}`}>
                      {platformIcons[account.platform]}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500">
                        {account.platform === 'instagram' && 'Instagram Business API'}
                        {account.platform === 'messenger' && 'Facebook Messenger API'}
                        {account.platform === 'whatsapp' && 'WhatsApp Business API'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {testResults[account.id] !== undefined && (
                      <span className="flex items-center">
                        {testResults[account.id] ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-1" />
                        )}
                      </span>
                    )}
                    
                    <button
                      onClick={() => testConnection(account)}
                      disabled={isLoading}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Test
                    </button>
                    
                    <button
                      onClick={() => handleEditAccount(account)}
                      className="p-1 text-gray-400 hover:text-gray-500"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => removeAccount(account.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Connection details */}
                <div className="mt-2 text-xs text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {account.platform === 'instagram' && (
                    <>
                      <div>
                        <span className="font-medium">Instagram User ID:</span> {account.igUserId || 'Not set'}
                      </div>
                      <div>
                        <span className="font-medium">Business ID:</span> {account.businessId || 'Not set'}
                      </div>
                    </>
                  )}
                  
                  {account.platform === 'messenger' && (
                    <>
                      <div>
                        <span className="font-medium">Page ID:</span> {account.pageId || 'Not set'}
                      </div>
                      <div>
                        <span className="font-medium">Business ID:</span> {account.businessId || 'Not set'}
                      </div>
                    </>
                  )}
                  
                  {account.platform === 'whatsapp' && (
                    <>
                      <div>
                        <span className="font-medium">Phone Number ID:</span> {account.phoneNumberId || 'Not set'}
                      </div>
                      <div>
                        <span className="font-medium">Business ID:</span> {account.businessId || 'Not set'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500">No API connections configured</p>
              <button
                onClick={handleAddAccount}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Connection
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Connection Wizard Modal */}
      {showAddWizard && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <ApiConnectionWizard 
            onComplete={() => setShowAddWizard(false)} 
            onCancel={() => setShowAddWizard(false)} 
          />
        </div>
      )}
      
      {/* Edit Account Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Connection
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Connection Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">
                  Access Token
                </label>
                <input
                  type="password"
                  id="accessToken"
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="businessId" className="block text-sm font-medium text-gray-700">
                  Business ID
                </label>
                <input
                  type="text"
                  id="businessId"
                  value={formData.businessId}
                  onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              {formData.platform === 'instagram' && (
                <>
                  <div>
                    <label htmlFor="pageId" className="block text-sm font-medium text-gray-700">
                      Facebook Page ID
                    </label>
                    <input
                      type="text"
                      id="pageId"
                      value={formData.pageId}
                      onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="igUserId" className="block text-sm font-medium text-gray-700">
                      Instagram User ID
                    </label>
                    <input
                      type="text"
                      id="igUserId"
                      value={formData.igUserId}
                      onChange={(e) => setFormData({ ...formData, igUserId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </>
              )}
              
              {formData.platform === 'messenger' && (
                <div>
                  <label htmlFor="pageId" className="block text-sm font-medium text-gray-700">
                    Facebook Page ID
                  </label>
                  <input
                    type="text"
                    id="pageId"
                    value={formData.pageId}
                    onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}
              
              {formData.platform === 'whatsapp' && (
                <div>
                  <label htmlFor="phoneNumberId" className="block text-sm font-medium text-gray-700">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    id="phoneNumberId"
                    value={formData.phoneNumberId}
                    onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}