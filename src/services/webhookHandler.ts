import { Socket } from 'socket.io';
import { useStore } from '../store';

// Handler for Meta Platform webhooks (Instagram and Messenger)
export const handleMetaWebhook = (body: any, io: Socket) => {
  // Check if this is an Instagram webhook
  if (body.object === 'instagram') {
    handleInstagramWebhook(body, io);
  } 
  // Check if this is a Messenger webhook
  else if (body.object === 'page') {
    handleMessengerWebhook(body, io);
  }
};

// Handler for Instagram webhooks
const handleInstagramWebhook = (body: any, io: Socket) => {
  const entries = body.entry || [];
  
  for (const entry of entries) {
    // Process Instagram messages
    const messages = entry.messaging || [];
    
    for (const message of messages) {
      console.log('Instagram message received:', message);
      
      // Extract message details
      const senderId = message.sender?.id;
      const recipientId = message.recipient?.id;
      const messageText = message.message?.text;
      const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
      
      if (senderId && messageText) {
        // Find the corresponding account in our system
        const store = useStore.getState();
        const account = store.accounts.find(acc => 
          acc.platform === 'instagram' && acc.igUserId === recipientId
        );
        
        if (account) {
          // Check if we already have this contact
          let contact = store.contacts.find(c => 
            c.accountId === account.id && 
            c.externalId === senderId
          );
          
          // If not, create a new contact
          if (!contact) {
            const newContact = {
              id: `contact-${Date.now()}`,
              name: `Instagram User ${senderId.substring(0, 6)}`,
              avatar: `https://ui-avatars.com/api/?name=IG&background=E1306C&color=fff`,
              lastMessage: messageText,
              lastMessageTime: timestamp,
              unreadCount: 1,
              platform: 'instagram',
              accountId: account.id,
              labels: [],
              externalId: senderId
            };
            
            store.addContact(newContact);
            
            // Create a new message
            const newMessage = {
              id: `msg-${Date.now()}`,
              content: messageText,
              timestamp,
              sender: 'contact',
              isRead: false,
            };
            
            store.addMessage(newContact.id, newMessage);
            
            // Emit to connected clients
            io.emit('new_message', {
              contactId: newContact.id,
              message: newMessage
            });
          } else {
            // Update existing contact
            store.updateContact(contact.id, {
              lastMessage: messageText,
              lastMessageTime: timestamp,
              unreadCount: contact.unreadCount + 1
            });
            
            // Add new message
            const newMessage = {
              id: `msg-${Date.now()}`,
              content: messageText,
              timestamp,
              sender: 'contact',
              isRead: false,
            };
            
            store.addMessage(contact.id, newMessage);
            
            // Emit to connected clients
            io.emit('new_message', {
              contactId: contact.id,
              message: newMessage
            });
          }
        }
      }
    }
  }
};

// Handler for Messenger webhooks
const handleMessengerWebhook = (body: any, io: Socket) => {
  const entries = body.entry || [];
  
  for (const entry of entries) {
    // Process Messenger messages
    const messages = entry.messaging || [];
    
    for (const message of messages) {
      console.log('Messenger message received:', message);
      
      // Extract message details
      const senderId = message.sender?.id;
      const recipientId = message.recipient?.id; // This is the page ID
      const messageText = message.message?.text;
      const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
      
      if (senderId && messageText) {
        // Find the corresponding account in our system
        const store = useStore.getState();
        const account = store.accounts.find(acc => 
          acc.platform === 'messenger' && acc.pageId === recipientId
        );
        
        if (account) {
          // Check if we already have this contact
          let contact = store.contacts.find(c => 
            c.accountId === account.id && 
            c.externalId === senderId
          );
          
          // If not, create a new contact
          if (!contact) {
            const newContact = {
              id: `contact-${Date.now()}`,
              name: `Messenger User ${senderId.substring(0, 6)}`,
              avatar: `https://ui-avatars.com/api/?name=FB&background=0084FF&color=fff`,
              lastMessage: messageText,
              lastMessageTime: timestamp,
              unreadCount: 1,
              platform: 'messenger',
              accountId: account.id,
              labels: [],
              externalId: senderId
            };
            
            store.addContact(newContact);
            
            // Create a new message
            const newMessage = {
              id: `msg-${Date.now()}`,
              content: messageText,
              timestamp,
              sender: 'contact',
              isRead: false,
            };
            
            store.addMessage(newContact.id, newMessage);
            
            // Emit to connected clients
            io.emit('new_message', {
              contactId: newContact.id,
              message: newMessage
            });
          } else {
            // Update existing contact
            store.updateContact(contact.id, {
              lastMessage: messageText,
              lastMessageTime: timestamp,
              unreadCount: contact.unreadCount + 1
            });
            
            // Add new message
            const newMessage = {
              id: `msg-${Date.now()}`,
              content: messageText,
              timestamp,
              sender: 'contact',
              isRead: false,
            };
            
            store.addMessage(contact.id, newMessage);
            
            // Emit to connected clients
            io.emit('new_message', {
              contactId: contact.id,
              message: newMessage
            });
          }
        }
      }
    }
  }
};

// Handler for WhatsApp webhooks
export const handleWhatsAppWebhook = (body: any, io: Socket) => {
  if (body.object) {
    if (body.entry && body.entry.length > 0) {
      const entry = body.entry[0];
      
      if (entry.changes && entry.changes.length > 0) {
        const change = entry.changes[0];
        
        if (change.value && change.value.messages && change.value.messages.length > 0) {
          const message = change.value.messages[0];
          console.log('WhatsApp message received:', message);
          
          // Extract message details
          const phoneNumberId = change.value.metadata?.phone_number_id;
          const senderId = message.from; // This is the customer's phone number
          const messageText = message.text?.body;
          const timestamp = message.timestamp ? new Date(parseInt(message.timestamp) * 1000) : new Date();
          
          if (senderId && messageText && phoneNumberId) {
            // Find the corresponding account in our system
            const store = useStore.getState();
            const account = store.accounts.find(acc => 
              acc.platform === 'whatsapp' && acc.phoneNumberId === phoneNumberId
            );
            
            if (account) {
              // Check if we already have this contact
              let contact = store.contacts.find(c => 
                c.accountId === account.id && 
                c.externalId === senderId
              );
              
              // If not, create a new contact
              if (!contact) {
                // Try to get contact name from the message metadata if available
                const contactName = message.contacts && message.contacts.length > 0 
                  ? message.contacts[0].profile.name 
                  : `WhatsApp ${senderId.substring(senderId.length - 6)}`;
                
                const newContact = {
                  id: `contact-${Date.now()}`,
                  name: contactName,
                  avatar: `https://ui-avatars.com/api/?name=WA&background=25D366&color=fff`,
                  lastMessage: messageText,
                  lastMessageTime: timestamp,
                  unreadCount: 1,
                  platform: 'whatsapp',
                  accountId: account.id,
                  labels: [],
                  externalId: senderId
                };
                
                store.addContact(newContact);
                
                // Create a new message
                const newMessage = {
                  id: `msg-${Date.now()}`,
                  content: messageText,
                  timestamp,
                  sender: 'contact',
                  isRead: false,
                };
                
                store.addMessage(newContact.id, newMessage);
                
                // Emit to connected clients
                io.emit('new_message', {
                  contactId: newContact.id,
                  message: newMessage
                });
              } else {
                // Update existing contact
                store.updateContact(contact.id, {
                  lastMessage: messageText,
                  lastMessageTime: timestamp,
                  unreadCount: contact.unreadCount + 1
                });
                
                // Add new message
                const newMessage = {
                  id: `msg-${Date.now()}`,
                  content: messageText,
                  timestamp,
                  sender: 'contact',
                  isRead: false,
                };
                
                store.addMessage(contact.id, newMessage);
                
                // Emit to connected clients
                io.emit('new_message', {
                  contactId: contact.id,
                  message: newMessage
                });
              }
            }
          }
        }
      }
    }
  }
};