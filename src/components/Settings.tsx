import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, Mail, Lock, Eye, EyeOff, Bell, Shield, 
  MessageCircle, Facebook, Instagram, LogOut, Plus, BarChart2, Database,
  Server, Users, Settings as SettingsIcon, BarChart, Smartphone
} from 'lucide-react';
import { useStore } from '../store';
import { metaApi, whatsappApi } from '../services/api';
import { Dashboard } from '../admin/Dashboard';
import { ApiConnections } from '../admin/ApiConnections';
import { WebhookSettings } from '../admin/WebhookSettings';
import { UserManagement } from '../admin/UserManagement';
import { SystemLogs } from '../admin/SystemLogs';
import { SecuritySettings } from '../admin/SecuritySettings';
import { NotificationSettings } from '../admin/NotificationSettings';
import { AgentAnalytics } from '../admin/AgentAnalytics';
import { Permission } from '../types';
import { ApiConnectionWizard } from './ApiConnectionWizard';
import { WhatsAppWebSettings } from './WhatsAppWebSettings';

export function Settings() {
  const navigate = useNavigate();
  const { currentUser, logout, hasPermission } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showConnectionWizard, setShowConnectionWizard] = useState(false);
  
  // Form state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [connectionForm, setConnectionForm] = useState({
    name: '',
    platform: 'instagram' as 'instagram' | 'whatsapp' | 'messenger',
    accessToken: '',
    pageId: '',
    igUserId: '',
    phoneNumberId: '',
    businessId: '',
  });
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic
    alert('Profile updated successfully!');
  };
  
  const handleConnectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add connection logic
    const { name, platform, accessToken, pageId, igUserId, phoneNumberId, businessId } = connectionForm;
    
    const newAccount = {
      id: `${platform}-${Date.now()}`,
      name,
      platform,
      avatar: 'https://ui-avatars.com/api/?name=IG&background=E1306C&color=fff',
      unreadCount: 0,
      accessToken,
      pageId: platform === 'messenger' || platform === 'instagram' ? pageId : undefined,
      igUserId: platform === 'instagram' ? igUserId : undefined,
      phoneNumberId: platform === 'whatsapp' ? phoneNumberId : undefined,
      businessId,
    };
    
    // Add to store
    useStore.getState().addAccount(newAccount);
    
    // Reset form and close modal
    setConnectionForm({
      name: '',
      platform: 'instagram',
      accessToken: '',
      pageId: '',
      igUserId: '',
      phoneNumberId: '',
      businessId: '',
    });
    setShowConnectionForm(false);
    setTestResult(null);
    
    alert('Connection added successfully!');
  };
  
  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const { platform, accessToken, pageId, igUserId, phoneNumberId } = connectionForm;
      
      if (platform === 'instagram' && accessToken && igUserId) {
        // Test Instagram connection
        await metaApi.getInstagramAccounts(accessToken, pageId || '');
        setTestResult({ success: true, message: 'Instagram connection successful!' });
      } else if (platform === 'messenger' && accessToken && pageId) {
        // Test Messenger connection
        await metaApi.getPages(accessToken);
        setTestResult({ success: true, message: 'Messenger connection successful!' });
      } else if (platform === 'whatsapp' && accessToken && phoneNumberId) {
        // Test WhatsApp connection
        await whatsappApi.getBusinessProfile(accessToken, phoneNumberId);
        setTestResult({ success: true, message: 'WhatsApp connection successful!' });
      } else {
        setTestResult({ success: false, message: 'Please fill in all required fields for the selected platform.' });
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult({ success: false, message: 'Connection test failed. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Admin panel tabs with permission requirements
  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart2 className="mr-3 h-5 w-5 text-gray-500" />, permission: null }, // Available to all users
    { id: 'analytics', label: 'Temsilci Analitiği', icon: <BarChart className="mr-3 h-5 w-5 text-gray-500" />, permission: 'analytics:view' as Permission },
    { id: 'api-connections', label: 'API Connections', icon: <Database className="mr-3 h-5 w-5 text-gray-500" />, permission: 'api:manage' as Permission },
    { id: 'webhooks', label: 'Webhook Settings', icon: <Server className="mr-3 h-5 w-5 text-gray-500" />, permission: 'webhooks:manage' as Permission },
    { id: 'users', label: 'User Management', icon: <Users className="mr-3 h-5 w-5 text-gray-500" />, permission: 'users:manage' as Permission },
    { id: 'security', label: 'Security', icon: <Shield className="mr-3 h-5 w-5 text-gray-500" />, permission: 'security:manage' as Permission },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="mr-3 h-5 w-5 text-gray-500" />, permission: null }, // Available to all users
    { id: 'logs', label: 'System Logs', icon: <Server className="mr-3 h-5 w-5 text-gray-500" />, permission: 'logs:view' as Permission },
  ];
  
  // Filter admin tabs based on user permissions
  const availableAdminTabs = adminTabs.filter(tab => 
    tab.permission === null || hasPermission(tab.permission)
  );
  
  // Render admin content based on active tab
  const renderAdminContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <AgentAnalytics />;
      case 'api-connections':
        return <ApiConnections />;
      case 'webhooks':
        return <WebhookSettings />;
      case 'users':
        return <UserManagement />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'logs':
        return <SystemLogs />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to App
              </button>
            </div>
            <div className="flex items-center">
              {currentUser && (
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={currentUser.avatar}
                    alt={currentUser.name}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">{currentUser.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Settings</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your account settings and preferences.
                </p>
                
                <nav className="mt-5 space-y-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                      activeTab === 'profile'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <User className="mr-3 h-5 w-5 text-gray-500" />
                    Profile
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('whatsapp-web')}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                      activeTab === 'whatsapp-web'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone className="mr-3 h-5 w-5 text-gray-500" />
                    WhatsApp Web
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('api-connections')}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                      activeTab === 'api-connections'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <MessageCircle className="mr-3 h-5 w-5 text-gray-500" />
                    API Connections
                  </button>
                  
                  {/* Admin section - only visible to users with admin permissions */}
                  {availableAdminTabs.length > 0 && (
                    <>
                      <div className="pt-2 pb-1">
                        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Admin Panel
                        </p>
                      </div>
                      
                      {availableAdminTabs.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                            activeTab === tab.id
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {tab.icon}
                          {tab.label}
                        </button>
                      ))}
                    </>
                  )}
                  
                  <div className="pt-2">
                    <button
                      onClick={handleLogout}
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-5 w-5 text-red-500" />
                      Logout
                    </button>
                  </div>
                </nav>
              </div>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              {/* Profile settings */}
              {activeTab === 'profile' && (
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Update your account profile information and email.
                      </p>
                    </div>
                    
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="Your name"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Change Password</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Update your password to a new secure one.
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="current-password"
                            id="current-password"
                            value={profileForm.currentPassword}
                            onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="Current password"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="new-password"
                            id="new-password"
                            value={profileForm.newPassword}
                            onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="New password"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="confirm-password"
                            id="confirm-password"
                            value={profileForm.confirmPassword}
                            onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Save className="h-5 w-5 mr-2" />
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {/* WhatsApp Web Integration */}
              {activeTab === 'whatsapp-web' && (
                <WhatsAppWebSettings />
              )}
              
              {/* API Connections */}
              {activeTab === 'api-connections' && (
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">API Connections</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Manage your connections to messaging platforms
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-md font-medium text-gray-700">Connected Accounts</h4>
                        <button
                          onClick={() => setShowConnectionWizard(true)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          Add Connection
                        </button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {useStore.getState().accounts.length > 0 ? (
                          useStore.getState().accounts.map((account) => (
                            <div key={account.id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className={`p-2 rounded-full text-white ${
                                    account.platform === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                    account.platform === 'whatsapp' ? 'bg-green-500' :
                                    'bg-blue-500'
                                  }`}>
                                    {account.platform === 'instagram' ? <Instagram className="h-5 w-5" /> :
                                     account.platform === 'whatsapp' ? <MessageCircle className="h-5 w-5" /> :
                                     <Facebook className="h-5 w-5" />}
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{account.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{account.platform}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to remove ${account.name}?`)) {
                                        useStore.getState().removeAccount(account.id);
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-gray-500">No API connections configured</p>
                            <button
                              onClick={() => setShowConnectionWizard(true)}
                              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Connection
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">About API Connections</h4>
                      <p className="text-sm text-blue-700">
                        Connect your messaging accounts to receive and send messages through Digitext. 
                        We support Instagram, WhatsApp, and Facebook Messenger.
                      </p>
                      <p className="mt-2 text-sm text-blue-700">
                        For WhatsApp, you can use either the official WhatsApp Business API or our WhatsApp Web integration.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Admin panel content */}
              {availableAdminTabs.some(tab => tab.id === activeTab) && renderAdminContent()}
              
              {/* Connection Wizard Modal */}
              {showConnectionWizard && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                  <ApiConnectionWizard 
                    onComplete={() => setShowConnectionWizard(false)} 
                    onCancel={() => setShowConnectionWizard(false)} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}