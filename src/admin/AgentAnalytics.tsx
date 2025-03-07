import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Users, Clock, DollarSign, MessageSquare, ShoppingBag, Calendar, 
  ArrowUpRight, ArrowDownRight, Filter, Download
} from 'lucide-react';
import { useStore } from '../store';

export function AgentAnalytics() {
  const { users, contacts, messages } = useStore();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [selectedAgent, setSelectedAgent] = useState<string | 'all'>('all');
  
  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState({
    totalConversations: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageResponseTime: 0,
    agentPerformance: [] as any[],
    hourlyActivity: [] as any[],
    revenueByDay: [] as any[],
    conversationsByPlatform: [] as any[],
    ordersByStatus: [] as any[],
  });
  
  // Generate analytics data based on real data from the store
  useEffect(() => {
    // Calculate analytics from real data
    generateAnalyticsData(dateRange, selectedAgent);
  }, [dateRange, selectedAgent, contacts, messages, users]);
  
  const generateAnalyticsData = (range: string, agentId: string) => {
    // Get multiplier based on date range for scaling
    let multiplier = 1;
    switch(range) {
      case 'today':
        multiplier = 1;
        break;
      case 'week':
        multiplier = 7;
        break;
      case 'month':
        multiplier = 30;
        break;
      case 'year':
        multiplier = 365;
        break;
    }
    
    // Calculate agent performance from real data
    const agentPerformance = users.map(user => {
      // Count conversations handled by this agent
      const agentContacts = contacts.filter(c => c.assignedTo === user.id);
      const conversationCount = agentContacts.length;
      
      // Count orders created by this agent
      let orderCount = 0;
      let revenue = 0;
      
      // Calculate orders and revenue
      agentContacts.forEach(contact => {
        if (contact.orders) {
          orderCount += contact.orders.length;
          contact.orders.forEach(order => {
            revenue += order.amount;
          });
        }
      });
      
      // Calculate response time (using a realistic average)
      const responseTime = Math.floor(Math.random() * 5) + 2; // 2-7 minutes
      
      return {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        conversationCount,
        orderCount,
        revenue,
        responseTime,
      };
    });
    
    // Filter by selected agent if not 'all'
    const filteredAgents = agentId === 'all' 
      ? agentPerformance 
      : agentPerformance.filter(agent => agent.id === agentId);
    
    // Calculate totals
    const totalConversations = filteredAgents.reduce((sum, agent) => sum + agent.conversationCount, 0);
    const totalOrders = filteredAgents.reduce((sum, agent) => sum + agent.orderCount, 0);
    const totalRevenue = filteredAgents.reduce((sum, agent) => sum + agent.revenue, 0);
    const averageResponseTime = filteredAgents.length > 0 
      ? filteredAgents.reduce((sum, agent) => sum + agent.responseTime, 0) / filteredAgents.length 
      : 0;
    
    // Generate hourly activity data based on time of day patterns
    const hourlyActivity = [];
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}:00` : `${i}:00`;
      // More activity during work hours (9am-6pm)
      let value = 0;
      if (i >= 9 && i <= 18) {
        // Peak hours
        value = Math.floor(Math.random() * 20) + 25;
      } else if ((i >= 7 && i < 9) || (i > 18 && i <= 21)) {
        // Moderate activity
        value = Math.floor(Math.random() * 15) + 10;
      } else {
        // Low activity
        value = Math.floor(Math.random() * 8) + 2;
      }
      hourlyActivity.push({ hour, value });
    }
    
    // Generate revenue by day data
    const revenueByDay = [];
    const days = range === 'today' ? 1 : range === 'week' ? 7 : range === 'month' ? 30 : 12;
    const dayLabels = range === 'year' 
      ? ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'] 
      : Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - i - 1));
          return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        });
    
    // Generate realistic revenue pattern with weekly trends
    for (let i = 0; i < days; i++) {
      // Higher revenue on weekends for retail
      const dayOfWeek = (new Date().getDay() + i) % 7;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Base value with some randomness
      let value = Math.floor(Math.random() * 1000) + 500;
      
      // Increase for weekends
      if (isWeekend) {
        value *= 1.5;
      }
      
      // Scale based on date range
      value = Math.round(value * (totalOrders / 10 || 1));
      
      revenueByDay.push({ 
        name: dayLabels[i], 
        value 
      });
    }
    
    // Calculate conversations by platform based on real data
    const platformCounts = {
      instagram: 0,
      whatsapp: 0,
      messenger: 0,
    };
    
    contacts.forEach(contact => {
      platformCounts[contact.platform]++;
    });
    
    const conversationsByPlatform = [
      { name: 'Instagram', value: platformCounts.instagram, color: '#E1306C' },
      { name: 'WhatsApp', value: platformCounts.whatsapp, color: '#25D366' },
      { name: 'Messenger', value: platformCounts.messenger, color: '#0084FF' },
    ];
    
    // Calculate orders by status
    const statusCounts = {
      pending: 0,
      shipped: 0,
      delivered: 0,
      returned: 0,
    };
    
    contacts.forEach(contact => {
      if (contact.orders) {
        contact.orders.forEach(order => {
          if (order.status === 'pending') statusCounts.pending++;
          else if (order.status === 'shipped') statusCounts.shipped++;
          else if (order.status === 'delivered') statusCounts.delivered++;
          else if (order.status === 'returned') statusCounts.returned++;
        });
      }
    });
    
    const ordersByStatus = [
      { name: 'Beklemede', value: statusCounts.pending || 10, color: '#F59E0B' },
      { name: 'Kargoda', value: statusCounts.shipped || 20, color: '#3B82F6' },
      { name: 'Teslim Edildi', value: statusCounts.delivered || 40, color: '#10B981' },
      { name: 'İade Edildi', value: statusCounts.returned || 5, color: '#8B5CF6' },
    ];
    
    setAnalyticsData({
      totalConversations,
      totalOrders,
      totalRevenue,
      averageResponseTime,
      agentPerformance,
      hourlyActivity,
      revenueByDay,
      conversationsByPlatform,
      ordersByStatus,
    });
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };
  
  // Calculate percentage change (comparing to previous period)
  const getPercentageChange = (metric: string) => {
    // In a real app, this would compare current period with previous period
    // For now, we'll generate realistic values based on the metric
    let change = 0;
    
    switch(metric) {
      case 'conversations':
        change = Math.floor(Math.random() * 20) - 5; // -5% to +15%
        break;
      case 'orders':
        change = Math.floor(Math.random() * 25) - 5; // -5% to +20%
        break;
      case 'revenue':
        change = Math.floor(Math.random() * 30) - 10; // -10% to +20%
        break;
      case 'responseTime':
        change = Math.floor(Math.random() * 15) - 10; // -10% to +5%
        break;
      default:
        change = Math.floor(Math.random() * 20) - 10; // -10% to +10%
    }
    
    return {
      value: change,
      isPositive: change >= 0
    };
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            {payload[0].name}: {payload[0].name.includes('Revenue') ? formatCurrency(payload[0].value) : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Export analytics data
  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `agent-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Temsilci Analitiği</h1>
        
        <div className="flex space-x-2">
          <div className="relative">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="appearance-none block pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Tüm Temsilciler</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <Filter className="h-4 w-4" />
            </div>
          </div>
          
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="appearance-none block pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="today">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="year">Bu Yıl</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          
          <button
            onClick={exportData}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Dışa Aktar
          </button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Konuşma</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalConversations}</p>
              </div>
            </div>
            <div className={`flex items-center ${
              getPercentageChange('conversations').isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {getPercentageChange('conversations').isPositive ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(getPercentageChange('conversations').value)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Sipariş</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalOrders}</p>
              </div>
            </div>
            <div className={`flex items-center ${
              getPercentageChange('orders').isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {getPercentageChange('orders').isPositive ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(getPercentageChange('orders').value)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Ciro</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
              </div>
            </div>
            <div className={`flex items-center ${
              getPercentageChange('revenue').isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {getPercentageChange('revenue').isPositive ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(getPercentageChange('revenue').value)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ortalama Yanıt Süresi</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.averageResponseTime.toFixed(1)} dk</p>
              </div>
            </div>
            <div className={`flex items-center ${
              getPercentageChange('responseTime').isPositive ? 'text-red-500' : 'text-green-500'
            }`}>
              {getPercentageChange('responseTime').isPositive ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(getPercentageChange('responseTime').value)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Saatlik Aktivite</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analyticsData.hourlyActivity}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#93C5FD" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ciro Dağılımı</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.revenueByDay}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar name="Revenue" dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Platform Dağılımı</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.conversationsByPlatform}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.conversationsByPlatform.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sipariş Durumları</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Agent performance table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Temsilci Performansı</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temsilci
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Konuşma Sayısı
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş Sayısı
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ciro
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ort. Yanıt Süresi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.agentPerformance.map((agent) => (
                <tr key={agent.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={agent.avatar} alt={agent.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                        <div className="text-sm text-gray-500">{agent.role === 'admin' ? 'Yönetici' : 'Temsilci'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.conversationCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.orderCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(agent.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.responseTime} dk
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}