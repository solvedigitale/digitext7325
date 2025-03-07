import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MessageCircle, Instagram, Facebook, Users, AlertCircle } from 'lucide-react';
import { useStore } from '../store';

export function Dashboard() {
  const { accounts, contacts, messages } = useStore();
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalContacts: contacts.length,
    activeAccounts: accounts.length,
    unreadMessages: 0,
  });
  
  const [messagesByPlatform, setMessagesByPlatform] = useState<any[]>([]);
  const [messageActivity, setMessageActivity] = useState<any[]>([]);
  
  useEffect(() => {
    // Calculate total messages and unread messages
    let totalCount = 0;
    let unreadCount = 0;
    
    Object.values(messages).forEach(messageList => {
      totalCount += messageList.length;
      unreadCount += messageList.filter(msg => !msg.isRead && msg.sender === 'contact').length;
    });
    
    setStats({
      totalMessages: totalCount,
      totalContacts: contacts.length,
      activeAccounts: accounts.length,
      unreadMessages: unreadCount,
    });
    
    // Calculate messages by platform
    const platformCounts = {
      instagram: 0,
      whatsapp: 0,
      messenger: 0,
    };
    
    contacts.forEach(contact => {
      const contactMessages = messages[contact.id] || [];
      platformCounts[contact.platform] += contactMessages.length;
    });
    
    setMessagesByPlatform([
      { name: 'Instagram', value: platformCounts.instagram, color: '#E1306C' },
      { name: 'WhatsApp', value: platformCounts.whatsapp, color: '#25D366' },
      { name: 'Messenger', value: platformCounts.messenger, color: '#0084FF' },
    ]);
    
    // Generate message activity data (last 7 days)
    const activityData = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      let count = 0;
      Object.values(messages).forEach(messageList => {
        count += messageList.filter(msg => {
          const msgDate = new Date(msg.timestamp);
          return msgDate.getDate() === date.getDate() && 
                 msgDate.getMonth() === date.getMonth() &&
                 msgDate.getFullYear() === date.getFullYear();
        }).length;
      });
      
      activityData.push({
        name: dayStr,
        messages: count,
      });
    }
    
    setMessageActivity(activityData);
  }, [accounts, contacts, messages]);
  
  const COLORS = ['#E1306C', '#25D366', '#0084FF'];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Messages</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMessages}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Contacts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalContacts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Instagram className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Accounts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeAccounts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unread Messages</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.unreadMessages}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Message Activity</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={messageActivity}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Messages by Platform</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={messagesByPlatform}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {messagesByPlatform.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {Object.entries(messages).slice(0, 5).map(([contactId, messageList]) => {
            const contact = contacts.find(c => c.id === contactId);
            if (!contact || messageList.length === 0) return null;
            
            const latestMessage = messageList[messageList.length - 1];
            
            return (
              <div key={contactId} className="px-4 py-4 sm:px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={contact.avatar}
                      alt={contact.name}
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(latestMessage.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{latestMessage.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}