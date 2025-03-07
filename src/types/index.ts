export type Platform = 'instagram' | 'whatsapp' | 'messenger';

export type Account = {
  id: string;
  name: string;
  platform: Platform;
  avatar: string;
  unreadCount: number;
  // API credentials
  accessToken?: string;
  pageId?: string;
  igUserId?: string;
  phoneNumberId?: string;
  businessId?: string;
  externalId?: string;
};

export type Contact = {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  platform: Platform;
  accountId: string;
  labels: Label[];
  notes?: string;
  orders?: Order[];
  externalId?: string; // ID from external platform (e.g., WhatsApp phone number)
  assignedTo?: string; // User ID of the agent assigned to this contact
};

export type Message = {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'contact';
  attachments?: Attachment[];
  isRead: boolean;
  agentId?: string; // ID of the agent who sent/received this message
};

export type Attachment = {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
};

export type Label = {
  id: string;
  name: string;
  color: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  amount: number;
  shippingCompany?: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  createdAt: Date;
  returnReason?: string;
  returnDate?: Date;
  agentId?: string; // ID of the agent who created this order
};

export type Template = {
  id: string;
  name: string;
  content: string;
};

export type Permission = 
  | 'dashboard:view'
  | 'analytics:view'
  | 'api:manage'
  | 'webhooks:manage'
  | 'users:manage'
  | 'security:manage'
  | 'notifications:manage'
  | 'logs:view';

export type Role = {
  id: string;
  name: string;
  permissions: Permission[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  permissions?: Permission[];
  avatar: string;
  workingHours?: {
    start: string; // Format: "HH:MM"
    end: string; // Format: "HH:MM"
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  };
  stats?: {
    conversationCount: number;
    orderCount: number;
    revenue: number;
    responseTime: number; // in minutes
  };
};

export type AgentAnalytics = {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  conversationCount: number;
  messageCount: number;
  orderCount: number;
  revenue: number;
  averageResponseTime: number;
  activeHours: { hour: number; count: number }[];
  platformDistribution: { platform: Platform; count: number }[];
};