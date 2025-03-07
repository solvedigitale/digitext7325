import { io, Socket } from 'socket.io-client';
import { useStore } from '../store';

// Socket.io connection
let socket: Socket | null = null;

export const initializeSocket = () => {
  if (socket) return socket;
  
  // Socket URL
  const SOCKET_URL = import.meta.env.VITE_API_URL || "https://app.digitext.io";
  
  console.log('Initializing socket connection to:', SOCKET_URL);
  
  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ["websocket", "polling"], // Önce websocket, sonra polling deneyin
    autoConnect: true,
    path: '/socket.io', // Socket.io path'ini belirtin
    withCredentials: false // CORS için credentials devre dışı
  });
  
  socket.on("connect", () => {
    console.log("Socket.io connection established:", socket?.id);
  });
  
  socket.on("connect_error", (error) => {
    console.error("Socket.io connection error:", error.message);
    // Farklı bir transport ile yeniden bağlanmayı deneyin
    setTimeout(() => {
      if (socket) {
        console.log('Trying to reconnect with different transport...');
        socket.io.opts.transports = ["polling", "websocket"]; // Sırayı değiştirin
        socket.connect();
      }
    }, 5000);
  });
  
  socket.io.on("error", (error) => {
    console.error("Socket.io manager error:", error);
  });
  
  return socket;
};

// Handle incoming messages from any platform
const handleIncomingMessage = (platform: 'whatsapp' | 'instagram' | 'messenger', message: any) => {
  const store = useStore.getState();
  
  // Find the appropriate account
  const account = store.accounts.find(acc => acc.platform === platform);
  
  if (!account) {
    console.log(`No ${platform} account found to handle this message`);
    return;
  }
  
  // Extract message details based on platform
  let senderId = '';
  let senderName = '';
  let content = '';
  
  if (platform === 'whatsapp') {
    senderId = message.from;
    content = message.text?.body || message.text || '';
    senderName = message.contacts?.[0]?.profile?.name || senderId;
  } else if (platform === 'instagram') {
    senderId = message.sender?.id;
    content = message.message?.text || '';
    senderName = message.sender?.name || senderId;
  } else if (platform === 'messenger') {
    senderId = message.sender?.id;
    content = message.message?.text || '';
    senderName = message.sender?.name || senderId;
  }
  
  // Check if contact exists
  let contact = store.contacts.find(c => 
    c.accountId === account.id && 
    (c.externalId === senderId || c.name.includes(senderId))
  );
  
  // If contact doesn't exist, create a new one
  if (!contact) {
    const newContact = {
      id: `contact-${Date.now()}`,
      name: senderName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`,
      lastMessage: content,
      lastMessageTime: new Date(),
      unreadCount: 1,
      platform: platform,
      accountId: account.id,
      labels: [],
      externalId: senderId
    };
    
    // Add the new contact
    store.addContact(newContact);
    
    // Create a new message entry
    const newMessage = {
      id: `msg-${Date.now()}`,
      content: content,
      timestamp: new Date(),
      sender: 'contact',
      isRead: false,
    };
    
    // Add the message
    store.addMessage(newContact.id, newMessage);
  } else {
    // Update existing contact
    store.updateContact(contact.id, {
      lastMessage: content,
      lastMessageTime: new Date(),
      unreadCount: contact.unreadCount + 1
    });
    
    // Add new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      content: content,
      timestamp: new Date(),
      sender: 'contact',
      isRead: false,
    };
    
    store.addMessage(contact.id, newMessage);
  }
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Function to reconnect the socket
export const reconnectSocket = () => {
  if (socket) {
    console.log('Reconnecting socket...');
    socket.connect();
  } else {
    console.log('Initializing new socket connection...');
    initializeSocket();
  }
  return socket;
};

// Export the socket instance for direct use
export { socket };