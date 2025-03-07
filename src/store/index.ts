import { create } from 'zustand';
import { Platform, Account, Contact, Message, Label, Order, Template, User, Permission } from '../types';
import { metaApi, whatsappApi } from '../services/api';
import { getStoredUserSession, clearUserSession, getUserAccounts } from '../services/auth';
import supabase from '../lib/supabase';

interface State {
  // Authentication
  isAuthenticated: boolean;
  currentUser: User | null;
  
  // UI state
  currentView: 'chat' | 'settings' | 'admin';
  selectedAccount: string | null;
  selectedContact: string | null;
  sidebarOpen: boolean;
  allAccountsSelected: boolean;
  
  // Data
  accounts: Account[];
  contacts: Contact[];
  messages: Record<string, Message[]>;
  labels: Label[];
  templates: Template[];
  users: User[];
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  setCurrentView: (view: 'chat' | 'settings' | 'admin') => void;
  selectAccount: (accountId: string) => void;
  selectAllAccounts: () => void;
  selectContact: (contactId: string) => void;
  toggleSidebar: () => void;
  
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  
  // Account actions
  addAccount: (account: Account) => void;
  removeAccount: (accountId: string) => void;
  updateAccount: (accountId: string, data: Partial<Account>) => void;
  loadUserAccounts: (userId: string) => Promise<void>;
  setAccounts: (accounts: Account[]) => void;
  
  // Contact actions
  addContact: (contact: Contact) => void;
  removeContact: (contactId: string) => void;
  updateContact: (contactId: string, data: Partial<Contact>) => void;
  loadContactsForAccount: (accountId: string) => Promise<void>;
  
  // Message actions
  addMessage: (contactId: string, message: Message) => void;
  markMessagesAsRead: (contactId: string) => void;
  sendMessage: (contactId: string, content: string) => void;
  loadMessagesForContact: (contactId: string) => Promise<void>;
  
  // Label actions
  addLabel: (contactId: string, label: Label) => void;
  removeLabel: (contactId: string, labelId: string) => void;
  loadLabelsForUser: (userId: string) => Promise<void>;
  
  // Notes actions
  updateNotes: (contactId: string, notes: string) => void;
  
  // Order actions
  addOrder: (contactId: string, order: Order) => void;
  updateOrder: (contactId: string, orderId: string, data: Partial<Order>) => void;
  markOrderAsReturned: (contactId: string, orderId: string, reason: string) => void;
  loadOrdersForContact: (contactId: string) => Promise<void>;
  
  // Template actions
  addTemplate: (template: Template) => void;
  updateTemplate: (templateId: string, name: string, content: string) => void;
  removeTemplate: (templateId: string) => void;
  loadTemplatesForUser: (userId: string) => Promise<void>;
  
  // User actions
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  updateUserPermissions: (userId: string, permissions: Permission[]) => void;

  // API Connection state
  apiConnections: APIConnection[];
  activeConnectionId: string | null;
  
  // API Connection actions
  saveAPIConnection: (connection: APIConnection) => void;
  removeAPIConnection: (connectionId: string) => void;
  setActiveConnection: (connectionId: string) => void;
  getAPIConnections: () => APIConnection[];
  loadSavedConnections: () => void;
}

// API Connection interface'i
interface APIConnection {
  id: string;
  name: string;
  pageId: string;
  pageAccessToken: string;
  platform: Platform;
  instagramAccountId?: string;
  instagramUsername?: string;
  profilePictureUrl?: string;
  createdAt: number;
}



// Default permissions for roles
const DEFAULT_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'dashboard:view',
    'analytics:view',
    'api:manage',
    'webhooks:manage',
    'users:manage',
    'security:manage',
    'notifications:manage',
    'logs:view'
  ],
  agent: [
    'dashboard:view'
  ]
};

// Mock data
const mockAccounts: Account[] = [];

const mockLabels: Label[] = [
  { id: 'label-1', name: 'VIP', color: 'bg-red-500' },
  { id: 'label-2', name: 'Yeni Müşteri', color: 'bg-green-500' },
  { id: 'label-3', name: 'Sipariş Verdi', color: 'bg-blue-500' },
  { id: 'label-4', name: 'Beklemede', color: 'bg-yellow-500' },
  { id: 'label-5', name: 'İade', color: 'bg-purple-500' },
];

const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Karşılama Mesajı',
    content: 'Merhaba! Size nasıl yardımcı olabilirim?',
  },
  {
    id: 'template-2',
    name: 'Sipariş Bilgisi',
    content: 'Siparişiniz oluşturuldu! Sipariş numaranız: {{orderNumber}}. Toplam tutar: {{amount}} TL. Kargo firması: {{shippingCompany}}',
  },
  {
    id: 'template-3',
    name: 'Teşekkür Mesajı',
    content: 'Bizimle iletişime geçtiğiniz için teşekkür ederiz. İyi günler dileriz!',
  },
];

const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    permissions: DEFAULT_PERMISSIONS.admin,
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
  },
  {
    id: 'user2',
    name: 'Support Agent',
    email: 'agent@example.com',
    role: 'agent',
    permissions: DEFAULT_PERMISSIONS.agent,
    avatar: 'https://ui-avatars.com/api/?name=Support+Agent&background=F59E0B&color=fff',
  },
];

// Check for stored session
const { user: storedUser, metaData } = getStoredUserSession();

export const useStore = create<State>((set, get) => ({
  // Initial state
  isAuthenticated: !!storedUser,
  currentUser: storedUser,
  currentView: 'chat',
  selectedAccount: null,
  selectedContact: null,
  sidebarOpen: true,
  allAccountsSelected: true,
  
  accounts: mockAccounts,
  contacts: [],
  messages: {},
  labels: mockLabels,
  templates: mockTemplates,
  users: mockUsers,
  
  // Authentication actions
  login: (user) => {
    // Ensure user has default permissions for their role if none are specified
    if (!user.permissions) {
      user.permissions = DEFAULT_PERMISSIONS[user.role] || [];
    }
    
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    set({ isAuthenticated: true, currentUser: user });
    
    // Load user data
    if (user.id) {
      get().loadUserAccounts(user.id);
      get().loadLabelsForUser(user.id);
      get().loadTemplatesForUser(user.id);
    }
     get().loadSavedConnections();
  },

// API Connection işlemleri
apiConnections: [],
activeConnectionId: null,

// Kaydedilmiş bağlantıları local storage'dan yükle
loadSavedConnections: () => {
  try {
    const connectionsJson = localStorage.getItem('api_connections');
    const connections = connectionsJson ? JSON.parse(connectionsJson) : [];
    
    const activeConnectionId = localStorage.getItem('active_api_connection');
    
    set({ 
      apiConnections: connections,
      activeConnectionId: activeConnectionId
    });
    
    console.log('API bağlantıları yüklendi:', connections.length);
  } catch (error) {
    console.error('API bağlantılarını yüklerken hata:', error);
  }
},

  // API bağlantısını kaydet
saveAPIConnection: (connection) => {
  set(state => {
    // Mevcut bağlantılar içinde bu ID'ye sahip olanı bul
    const existingIndex = state.apiConnections.findIndex(conn => conn.id === connection.id);
    
    // Yeni bağlantılar listesi oluştur
    let newConnections = [...state.apiConnections];
    
    if (existingIndex >= 0) {
      // Varsa güncelle
      newConnections[existingIndex] = connection;
    } else {
      // Yoksa ekle
      newConnections.push(connection);
    }
    
    // Local storage'a kaydet
    localStorage.setItem('api_connections', JSON.stringify(newConnections));
    
    // Aktif bağlantı yoksa bu bağlantıyı aktif yap
    if (!state.activeConnectionId) {
      localStorage.setItem('active_api_connection', connection.id);
      return {
        apiConnections: newConnections,
        activeConnectionId: connection.id
      };
    }
    
    return { apiConnections: newConnections };
  });
},

// API bağlantısını sil
removeAPIConnection: (connectionId) => {
  set(state => {
    // Bağlantıyı çıkar
    const newConnections = state.apiConnections.filter(conn => conn.id !== connectionId);
    
    // Local storage'a kaydet
    localStorage.setItem('api_connections', JSON.stringify(newConnections));
    
    // Eğer silinen bağlantı aktifse aktif bağlantıyı sıfırla
    if (state.activeConnectionId === connectionId) {
      localStorage.removeItem('active_api_connection');
      return {
        apiConnections: newConnections,
        activeConnectionId: null
      };
    }
    
    return { apiConnections: newConnections };
  });
},

  // Aktif bağlantıyı ayarla
setActiveConnection: (connectionId) => {
  localStorage.setItem('active_api_connection', connectionId);
  set({ activeConnectionId: connectionId });
},

// Tüm API bağlantılarını getir
getAPIConnections: () => {
  return get().apiConnections;
},

  
  logout: () => {
    // Clear localStorage
    localStorage.removeItem('user');
    clearUserSession();
    
    set({ 
      isAuthenticated: false, 
      currentUser: null,
      accounts: [],
      contacts: [],
      messages: {}
    });
  },
  
  // Permission check
  hasPermission: (permission) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    
    // Admins have all permissions by default
    if (currentUser.role === 'admin' && !currentUser.permissions) {
      return true;
    }
    
    return currentUser.permissions?.includes(permission) || false;
  },
  
  // UI actions
  setCurrentView: (view) => set({ currentView: view }),
  
  selectAccount: (accountId) => set({ 
    selectedAccount: accountId, 
    allAccountsSelected: false,
    selectedContact: null,
  }),
  
  selectAllAccounts: () => set({ 
    selectedAccount: null, 
    allAccountsSelected: true,
    selectedContact: null,
  }),
  
  selectContact: (contactId) => {
    const { contacts, messages } = get();
    const contact = contacts.find(c => c.id === contactId);
    
    if (contact) {
      set({ 
        selectedContact: contactId,
        selectedAccount: contact.accountId,
        allAccountsSelected: false,
      });
      
      // Mark messages as read
      const contactMessages = messages[contactId] || [];
      const updatedMessages = contactMessages.map(msg => ({
        ...msg,
        isRead: true,
      }));
      
      set(state => ({
        messages: {
          ...state.messages,
          [contactId]: updatedMessages,
        },
        contacts: state.contacts.map(c => 
          c.id === contactId 
            ? { ...c, unreadCount: 0 }
            : c
        ),
      }));
      
      // Load messages if not already loaded
      if (!messages[contactId] || messages[contactId].length === 0) {
        get().loadMessagesForContact(contactId);
      }
      
      // Load orders if contact has any
      get().loadOrdersForContact(contactId);
    }
  },
  
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  
  // Account actions
  addAccount: (account) => set(state => {
    const newAccounts = [...state.accounts, account];
    localStorage.setItem('user_accounts', JSON.stringify(newAccounts));
    return { accounts: newAccounts };
  }),
  
  setAccounts: (accounts) => set({ accounts }),
  
  removeAccount: (accountId) => set(state => {
    const newAccounts = state.accounts.filter(a => a.id !== accountId);
    localStorage.setItem('user_accounts', JSON.stringify(newAccounts));
    return {
      accounts: newAccounts,
      // If the removed account was selected, clear selection
      selectedAccount: state.selectedAccount === accountId ? null : state.selectedAccount,
      allAccountsSelected: state.selectedAccount === accountId ? true : state.allAccountsSelected,
    };
  }),
  
  updateAccount: (accountId, data) => set(state => {
    const newAccounts = state.accounts.map(account => 
      account.id === accountId 
        ? { ...account, ...data }
        : account
    );
    localStorage.setItem('user_accounts', JSON.stringify(newAccounts));
    return { accounts: newAccounts };
  }),
  
  loadUserAccounts: async (userId: string) => {
    try { 
      // Önce localStorage'dan yükle
      const storedAccounts = localStorage.getItem('user_accounts');
      if (storedAccounts) {
        try {
          const accounts = JSON.parse(storedAccounts);
          if (Array.isArray(accounts) && accounts.length > 0) {
            set({ accounts });
            console.log('API bağlantıları yüklendi:', accounts.length);
            return;
          }
        } catch (error) {
          console.error('Error parsing stored accounts:', error);
        }
      }
      
      // If no accounts, add a mock account
      if (mockAccounts.length === 0) {
        const instagramAccount: Account = {
          id: 'account-instagram-1',
          name: 'Instagram Business',
          platform: 'instagram',
          avatar: 'https://ui-avatars.com/api/?name=IG&background=E1306C&color=fff',
          unreadCount: 0,
          accessToken: 'mock-token',
          igUserId: 'mock-ig-user-id',
          pageId: 'mock-page-id',
        };
      
        const whatsappAccount: Account = {
          id: 'account-whatsapp-1',
          name: 'WhatsApp Business',
          platform: 'whatsapp',
          avatar: 'https://ui-avatars.com/api/?name=WA&background=25D366&color=fff',
          unreadCount: 0,
          accessToken: 'mock-token',
          phoneNumberId: 'mock-phone-number-id',
        };
        
        const messengerAccount: Account = {
          id: 'account-messenger-1',
          name: 'Facebook Messenger',
          platform: 'messenger',
          avatar: 'https://ui-avatars.com/api/?name=FB&background=0084FF&color=fff',
          unreadCount: 0,
          accessToken: 'mock-token',
          pageId: 'mock-page-id',
        };
        
        const newAccounts = [instagramAccount, whatsappAccount, messengerAccount];
        set({ accounts: newAccounts });
        localStorage.setItem('user_accounts', JSON.stringify(newAccounts));
        
        // Add mock contacts
        const mockContacts: Contact[] = [
          {
            id: 'contact-1',
            name: 'John Doe',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
            lastMessage: 'Hello, I have a question about my order.',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
            unreadCount: 2,
            platform: 'instagram',
            accountId: instagramAccount.id,
            labels: [mockLabels[0], mockLabels[2]],
            notes: 'VIP customer, always responds quickly.',
            externalId: 'mock-external-id-1',
          },
          {
            id: 'contact-2',
            name: 'Jane Smith',
            avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
            lastMessage: 'When will my order be shipped?',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
            unreadCount: 0,
            platform: 'whatsapp',
            accountId: whatsappAccount.id,
            labels: [mockLabels[1]],
            notes: 'New customer, first order placed yesterday.',
            externalId: 'mock-external-id-2',
          },
          {
            id: 'contact-3',
            name: 'Robert Johnson',
            avatar: 'https://ui-avatars.com/api/?name=Robert+Johnson&background=random',
            lastMessage: 'Thanks for your help!',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
            unreadCount: 0,
            platform: 'messenger',
            accountId: messengerAccount.id,
            labels: [mockLabels[2], mockLabels[3]],
            notes: 'Regular customer, prefers messenger for communication.',
            externalId: 'mock-external-id-3',
          },
        ];
        
        set({ contacts: mockContacts });
        
        // Add mock messages
        const mockMessages: Record<string, Message[]> = {
          'contact-1': [
            {
              id: 'msg-1-1',
              content: 'Hello, I have a question about my order.',
              timestamp: new Date(Date.now() - 1000 * 60 * 5),
              sender: 'contact',
              isRead: false,
            },
            {
              id: 'msg-1-2',
              content: 'I ordered the blue shirt but received a red one.',
              timestamp: new Date(Date.now() - 1000 * 60 * 4),
              sender: 'contact',
              isRead: false,
            },
          ],
          'contact-2': [
            {
              id: 'msg-2-1',
              content: 'Hi, I just placed an order.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60),
              sender: 'contact',
              isRead: true,
            },
            {
              id: 'msg-2-2',
              content: 'When will my order be shipped?',
              timestamp: new Date(Date.now() - 1000 * 60 * 30),
              sender: 'contact',
              isRead: true,
            },
            {
              id: 'msg-2-3',
              content: 'Your order will be shipped tomorrow. You will receive a tracking number via email.',
              timestamp: new Date(Date.now() - 1000 * 60 * 25),
              sender: 'user',
              isRead: true,
            },
          ],
          'contact-3': [
            {
              id: 'msg-3-1',
              content: 'I need help with my return.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
              sender: 'contact',
              isRead: true,
            },
            {
              id: 'msg-3-2',
              content: 'I can help you with that. What is your order number?',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.9),
              sender: 'user',
              isRead: true,
            },
            {
              id: 'msg-3-3',
              content: 'Order #12345',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.8),
              sender: 'contact',
              isRead: true,
            },
            {
              id: 'msg-3-4',
              content: 'I have processed your return. You will receive a refund within 3-5 business days.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.7),
              sender: 'user',
              isRead: true,
            },
            {
              id: 'msg-3-5',
              content: 'Thanks for your help!',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
              sender: 'contact',
              isRead: true,
            },
          ],
        };
        
        set({ messages: mockMessages });
        
        // Add mock orders
        const mockOrders: Order[] = [
          {
            id: 'order-1',
            orderNumber: '12345',
            amount: 99.99,
            shippingCompany: 'FedEx',
            status: 'delivered',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          },
          {
            id: 'order-2',
            orderNumber: '12346',
            amount: 149.99,
            shippingCompany: 'UPS',
            status: 'shipped',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
          {
            id: 'order-3',
            orderNumber: '12347',
            amount: 79.99,
            shippingCompany: 'DHL',
            status: 'returned',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            returnReason: 'Wrong size',
            returnDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
          },
        ];
        
        // Add orders to contacts
        set(state => ({
          contacts: state.contacts.map((contact, index) => {
            if (index === 0) {
              return {
                ...contact,
                orders: [mockOrders[0]],
              };
            } else if (index === 1) {
              return {
                ...contact,
                orders: [mockOrders[1]],
              };
            } else if (index === 2) {
              return {
                ...contact,
                orders: [mockOrders[2]],
              };
            }
            return contact;
          }),
        }));
      }
    } catch (error) {
      console.error('Error loading user accounts:', error);
    }
  },
  
  // Contact actions
  addContact: (contact) => set(state => ({
    contacts: [...state.contacts, contact],
  })),
  
  removeContact: (contactId) => set(state => ({
    contacts: state.contacts.filter(c => c.id !== contactId),
    // If the removed contact was selected, clear selection
    selectedContact: state.selectedContact === contactId ? null : state.selectedContact,
  })),
  
  updateContact: (contactId, data) => set(state => ({
    contacts: state.contacts.map(contact => 
      contact.id === contactId 
        ? { ...contact, ...data }
        : contact
    ),
  })),
  
  loadContactsForAccount: async (accountId) => {
    try {
      // For demo purposes, we'll use the contacts already loaded
      // In a real app, you would fetch contacts from Supabase
    } catch (error) {
      console.error('Error loading contacts for account:', error);
    }
  },
  
  // Message actions
  addMessage: (contactId, message) => set(state => ({
    messages: {
      ...state.messages,
      [contactId]: [...(state.messages[contactId] || []), message],
    },
  })),
  
  markMessagesAsRead: (contactId) => set(state => {
    const contactMessages = state.messages[contactId] || [];
    const updatedMessages = contactMessages.map(msg => ({
      ...msg,
      isRead: true,
    }));
    
    return {
      messages: {
        ...state.messages,
        [contactId]: updatedMessages,
      },
      contacts: state.contacts.map(c => 
        c.id === contactId 
          ? { ...c, unreadCount: 0 }
          : c
      ),
    };
  }),
  
  sendMessage: async (contactId, content) => {
    const { contacts, messages, currentUser } = get();
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) return;
    
    // Create new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date(),
      sender: 'user',
      isRead: true,
    };
    
    // Add message to state
    set(state => ({
      messages: {
        ...state.messages,
        [contactId]: [...(state.messages[contactId] || []), newMessage],
      },
      contacts: state.contacts.map(c => 
        c.id === contactId 
          ? { 
              ...c, 
              lastMessage: content,
              lastMessageTime: new Date(),
            }
          : c
      ),
    }));
    
    try {
      // In a real app, you would save the message to Supabase
      // and send it via the appropriate API
      
      // Send message via API based on platform
      const account = get().accounts.find(a => a.id === contact.accountId);
      
      if (account) {
        try {
          if (contact.platform === 'instagram' && account.accessToken && account.igUserId && contact.externalId) {
            console.log('Sending Instagram message:', content);
            // metaApi.sendInstagramMessage(account.accessToken, account.igUserId, contact.externalId, content);
          } else if (contact.platform === 'messenger' && account.accessToken && account.pageId && contact.externalId) {
            console.log('Sending Messenger message:', content);
            // metaApi.sendMessengerMessage(account.accessToken, account.pageId, contact.externalId, content);
          } else if (contact.platform === 'whatsapp' && contact.externalId) {
            console.log('Sending WhatsApp message:', content);
            // whatsappApi.sendMessage(contact.externalId, content, account.accessToken, account.phoneNumberId);
          }
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    } catch (error) {
      console.error('Error in database operations:', error);
    }
  },
  
  loadMessagesForContact: async (contactId) => {
    try {
      // For demo purposes, we'll use the messages already loaded
      // In a real app, you would fetch messages from Supabase
    } catch (error) {
      console.error('Error loading messages for contact:', error);
    }
  },
  
  // Label actions
  addLabel: async (contactId, label) => {
    set(state => ({
      contacts: state.contacts.map(contact => 
        contact.id === contactId 
          ? { 
              ...contact, 
              labels: [...contact.labels.filter(l => l.id !== label.id), label],
            }
          : contact
      ),
    }));
    
    try {
      // In a real app, you would save the label to Supabase
    } catch (error) {
      console.error('Error in database operations:', error);
    }
  },
  
  removeLabel: async (contactId, labelId) => {
    set(state => ({
      contacts: state.contacts.map(contact => 
        contact.id === contactId 
          ? { 
              ...contact, 
              labels: contact.labels.filter(l => l.id !== labelId),
            }
          : contact
      ),
    }));
    
    try {
      // In a real app, you would remove the label from Supabase
    } catch (error) {
      console.error('Error in database operations:', error);
    }
  },
  
  loadLabelsForUser: async (userId) => {
    try {
      // For demo purposes, we'll use mock labels
      // In a real app, you would fetch labels from Supabase
      set({ labels: mockLabels });
    } catch (error) {
      console.error('Error loading labels for user:', error);
    }
  },
  
  // Notes actions
  updateNotes: async (contactId, notes) => {
    set(state => ({
      contacts: state.contacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, notes }
          : contact
      ),
    }));
    
    try {
      // In a real app, you would update notes in Supabase
    } catch (error) {
      console.error('Error in database operations:', error);
    }
  },
  
  // Order actions
  addOrder: async (contactId, order) => {
    set(state => ({
      contacts: state.contacts.map(contact => 
        contact.id === contactId 
          ? { 
              ...contact, 
              orders: [...(contact.orders || []), order],
            }
          : contact
      ),
    }));
    
    try {
      // In a real app, you would save the order to Supabase
    } catch (error) {
      console.error('Error in database operations:', error);
    }
  },
  
  updateOrder: async (contactId, orderId, data) => {
    set(state => ({
      contacts: state.contacts.map(contact => 
        contact.id === contactId && contact.orders
          ? { 
              ...contact, 
              orders: contact.orders.map(order => 
                order.id === orderId
                  ? { ...order, ...data }
                  : order
              ),
            }
          : contact
      ),
    }));
    
    try {
      // In a real app, you would update the order in Supabase
    } catch (error) {
      console.error('Error in database operations:', error);
    }
  },
  
  markOrderAsReturned: async (contactId, orderId, reason) => {
    set(state => ({
      contacts: state.contacts.map(contact => 
        contact.id === contactId && contact.orders
          ? { 
              ...contact, 
              orders: contact.orders.map(order => 
                order.id === orderId
                  ? { 
                      ...order, 
                      status: 'returned',
                      returnReason: reason,
                      returnDate: new Date(),
                    }
                  : order
              ),
            }
          : contact
      ),
    }));
    
    try {
      // In a real app, you would update the order in Supabase
    } catch (error) {
      console.error('Error in database operations:', error);
    }
  },
  
  loadOrdersForContact: async (contactId) => {
    try {
      // For demo purposes, we'll use the orders already loaded
      // In a real app, you would fetch orders from Supabase
    } catch (error) {
      console.error('Error loading orders for contact:', error);
    }
  },
  
  // Template actions
  addTemplate: async (template) => {
    set(state => ({
      templates: [...state.templates, template],
    }));
    
    try {
      // In a real app, you would save the template to Supabase
    } catch (error) {
      console.error('Error in database operations:', error);
    }
  },
  
  updateTemplate: async (templateId, name, content) => {
    set(state => ({
      templates: state.templates.map(template => 
        template.id === templateId
          ? { ...template, name, content }
          : template
      ),
    }));
    
    try {
      // In a real app, you would update the template in Supabase
    } catch (error) {
      console.error('Error in database operations:', error);
    }
  },
  
  removeTemplate: async (templateId) => {
    set(state => ({
      templates: state.templates.filter(t => t.id !== templateId),
    }));
    
    try {
      // In a real app, you would delete the template from Supabase
    } catch (error) {
      console.error('Error in database operations:', error);
    }
  },
  
  loadTemplatesForUser: async (userId) => {
    try {
      // For demo purposes, we'll use mock templates
      // In a real app, you would fetch templates from Supabase
      set({ templates: mockTemplates });
    } catch (error) {
      console.error('Error loading templates for user:', error);
    }
  },
  
  // User actions
  addUser: (user) => set(state => ({
    users: [...state.users, user],
  })),
  
  removeUser: (userId) => set(state => ({
    users: state.users.filter(u => u.id !== userId),
  })),
  
  updateUser: (userId, data) => set(state => ({
    users: state.users.map(user => 
      user.id === userId
        ? { ...user, ...data }
        : user
    ),
  })),
  
  updateUserPermissions: (userId, permissions) => set(state => ({
    users: state.users.map(user => 
      user.id === userId
        ? { ...user, permissions }
        : user
    ),
  })),
}));