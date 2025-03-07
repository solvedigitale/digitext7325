import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Settings, Users, MessageCircle, BarChart2, Database, Server, Shield, Bell, Menu, X, BarChart, LogOut, Webhook, Phone, Smartphone } from 'lucide-react';
import { Dashboard } from './admin/Dashboard';
import { ApiConnections } from './admin/ApiConnections';
import { WebhookSettings } from './admin/WebhookSettings';
import { WebhookTesting } from './admin/WebhookTesting';
import { WhatsAppReceiver } from './admin/WhatsAppReceiver';
import { WhatsAppWebIntegration } from './admin/WhatsAppWebIntegration';
import { UserManagement } from './admin/UserManagement';
import { SystemLogs } from './admin/SystemLogs';
import { SecuritySettings } from './admin/SecuritySettings';
import { NotificationSettings } from './admin/NotificationSettings';
import { AgentAnalytics } from './admin/AgentAnalytics';
import { initializeSocket, getSocket } from './services/socket';
import { useStore } from './store';

export function AdminApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const { logout, currentUser, isAuthenticated } = useStore();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Initialize socket connection
    const socket = initializeSocket();
    
    socket.on('connect', () => {
      setConnectionStatus('connected');
    });
    
    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });
    
    // Handle window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If not authenticated, don't render anything (redirect handled by useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link to="/admin" className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Admin Panel</span>
            </Link>
            {isMobile && (
              <button onClick={toggleSidebar} className="md:hidden">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <BarChart2 className="h-5 w-5 mr-3 text-gray-500" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/analytics"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <BarChart className="h-5 w-5 mr-3 text-gray-500" />
                  <span>Temsilci Analitiği</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/api-connections"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Database className="h-5 w-5 mr-3 text-gray-500" />
                  <span>API Connections</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/webhooks"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Server className="h-5 w-5 mr-3 text-gray-500" />
                  <span>Webhook Settings</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/webhook-testing"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Webhook className="h-5 w-5 mr-3 text-gray-500" />
                  <span>Webhook Testing</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/whatsapp-receiver"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Phone className="h-5 w-5 mr-3 text-gray-500" />
                  <span>WhatsApp Receiver</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/whatsapp-web"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Smartphone className="h-5 w-5 mr-3 text-gray-500" />
                  <span>WhatsApp Web</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Users className="h-5 w-5 mr-3 text-gray-500" />
                  <span>User Management</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/security"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Shield className="h-5 w-5 mr-3 text-gray-500" />
                  <span>Security</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/notifications"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Bell className="h-5 w-5 mr-3 text-gray-500" />
                  <span>Notifications</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/logs"
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Server className="h-5 w-5 mr-3 text-gray-500" />
                  <span>System Logs</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-500">
                {connectionStatus === 'connected' ? 'Server Connected' : 'Server Disconnected'}
              </span>
            </div>
            <div className="mt-4 flex flex-col space-y-2">
              <Link
                to="/"
                className="flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Back to App</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4">
          {isMobile && (
            <button onClick={toggleSidebar} className="mr-4">
              <Menu className="h-6 w-6 text-gray-500" />
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
          {currentUser && (
            <div className="ml-auto flex items-center">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="h-8 w-8 rounded-full"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">{currentUser.name}</span>
            </div>
          )}
        </header>
        
        <main className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<AgentAnalytics />} />
            <Route path="/api-connections" element={<ApiConnections />} />
            <Route path="/webhooks" element={<WebhookSettings />} />
            <Route path="/webhook-testing" element={<WebhookTesting />} />
            <Route path="/whatsapp-receiver" element={<WhatsAppReceiver />} />
            <Route path="/whatsapp-web" element={<WhatsAppWebIntegration />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/security" element={<SecuritySettings />} />
            <Route path="/notifications" element={<NotificationSettings />} />
            <Route path="/logs" element={<SystemLogs />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}