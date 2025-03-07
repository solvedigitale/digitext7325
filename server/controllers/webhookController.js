// server/controllers/webhookController.js - Updated for webhook testing

// Meta Platform webhooks (Instagram ve Messenger) için işleme
export const handleMetaWebhook = (body, io) => {
  try {
    // Handle the messages field sample data
    if (body.field === 'messages') {
      console.log('Processing messages field sample:', body);
      
      if (io) {
        io.emit('instagram_message', {
          sender: body.value.sender,
          recipient: body.value.recipient,
          message: body.value.message,
          timestamp: body.value.timestamp,
        });
      }
      
      return;
    }
    
    // Instagram mesajları için
    if (body.object === 'instagram') {
      const entries = body.entry || [];

      for (const entry of entries) {
        if (entry.messaging) {
          console.log('Instagram mesajları işleniyor:', entry.messaging);

          for (const message of entry.messaging) {
            // Message details
            io.emit('instagram_message', {
              sender: message.sender,
              recipient: message.recipient,
              message: message.message,
              timestamp: message.timestamp,
            });
          }
        }
        
        // Handle changes field for Instagram
        if (entry.changes) {
          console.log('Instagram changes işleniyor:', entry.changes);
          
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              io.emit('instagram_message', {
                sender: { id: change.value.from?.id || change.value.sender?.id },
                recipient: { id: change.value.to?.id || change.value.recipient?.id },
                message: { 
                  text: change.value.message?.text || change.value.text?.body || "No text content" 
                },
                timestamp: change.value.timestamp,
              });
            }
          }
        }
      }
    }
    // Messenger mesajları için
    else if (body.object === 'page') {
      const entries = body.entry || [];

      for (const entry of entries) {
        if (entry.messaging) {
          console.log('Messenger mesajları işleniyor:', entry.messaging);

          for (const message of entry.messaging) {
            // Message details
            io.emit('messenger_message', {
              sender: message.sender,
              recipient: message.recipient,
              message: message.message,
              timestamp: message.timestamp,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Meta webhook işleme hatası:', error);
  }
};

// WhatsApp webhooks için işleme
export const handleWhatsAppWebhook = (body, io) => {
  try {
    // Handle unofficial WhatsApp webhook format
    if (body.from && body.text) {
      console.log('Processing unofficial WhatsApp message:', body);
      
      if (io) {
        io.emit('whatsapp_message', {
          from: body.from,
          id: body.id || `msg-${Date.now()}`,
          text: body.text,
          timestamp: body.timestamp || Date.now().toString(),
          metadata: body.metadata || {},
        });
      }
      
      return;
    }
    
    // Handle official WhatsApp webhook format
    if (body.object === 'whatsapp_business_account') {
      if (body.entry && body.entry.length > 0) {
        const entry = body.entry[0];

        if (entry.changes && entry.changes.length > 0) {
          const change = entry.changes[0];

          if (
            change.value &&
            change.field === 'messages'
          ) {
            console.log('WhatsApp mesajları işleniyor:', change.value);
            
            // Check if messages array exists
            if (change.value.messages && change.value.messages.length > 0) {
              const messages = change.value.messages;
              const metadata = change.value.metadata || {};

              for (const message of messages) {
                io.emit('whatsapp_message', {
                  from: message.from,
                  id: message.id,
                  text: message.text?.body || "No text content",
                  timestamp: message.timestamp,
                  metadata: metadata,
                });
              }
            } else {
              // Handle direct message format
              io.emit('whatsapp_message', {
                from: change.value.from?.id || change.value.sender?.id || "unknown",
                id: change.value.id || "unknown",
                text: change.value.text?.body || change.value.message?.text || "No text content",
                timestamp: change.value.timestamp,
                metadata: change.value.metadata || {},
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('WhatsApp webhook işleme hatası:', error);
  }
};

// Process messages from third-party WhatsApp services
export const handleUnofficialWhatsAppWebhook = (body, io) => {
  try {
    // Extract the essential information regardless of the format
    const from = body.from || body.sender || body.phone || body.number || 'unknown';
    const text = body.text || body.message || body.content || body.body || 'No content';
    const timestamp = body.timestamp || Date.now().toString();
    const id = body.id || `msg-${Date.now()}`;
    
    console.log('Processing unofficial WhatsApp message:', { from, text });
    
    if (io) {
      io.emit('whatsapp_message', {
        from,
        id,
        text,
        timestamp,
        metadata: {
          service: 'unofficial-whatsapp',
          ...body.metadata
        },
      });
    }
  } catch (error) {
    console.error('Unofficial WhatsApp webhook işleme hatası:', error);
  }
};