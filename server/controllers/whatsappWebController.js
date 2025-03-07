// server/controllers/whatsappWebController.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Aktif WhatsApp Web istemcileri
const activeClients = {};
const socketConnections = {};
const pendingQrRequests = {};

// Oturum dizinini kontrol et ve oluştur
const sessionDir = path.join(process.cwd(), '.wwebjs_auth');
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
  console.log('Oturum dizini oluşturuldu:', sessionDir);
}

// WhatsApp Web istemcisi oluşturma
const createWhatsAppClient = (userId) => {
  try {
    console.log(`WhatsApp Web istemcisi oluşturuluyor: ${userId}`);
    
    // Mevcut istemciyi temizle
    if (activeClients[userId]) {
      try {
        activeClients[userId].destroy();
      } catch (err) {
        console.error(`Önceki istemciyi kapatırken hata: ${err.message}`);
      }
      delete activeClients[userId];
    }

    const client = new Client({
      authStrategy: new LocalAuth({ 
        clientId: userId,
        dataPath: sessionDir
      }),
      puppeteer: {
        headless: true,
        executablePath: '/usr/bin/chromium-browser', // Sisteminizde kurulu Chromium yolu
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
      }
    });

    // WhatsApp Web QR kodu olayı
    client.on('qr', (qrCode) => {
      console.log(`QR kodu oluşturuldu: ${userId}`);
      
      // QR kodunu socket ile gönder
      const userSocket = socketConnections[userId];
      if (userSocket) {
        userSocket.emit('whatsapp_web_qr', { qrCode });
      }
      
      // Bekleyen QR isteklerini işle
      if (pendingQrRequests[userId]) {
        pendingQrRequests[userId].forEach(callback => {
          callback({ qrCode, userId });
        });
        delete pendingQrRequests[userId];
      }
    });

    // WhatsApp Web hazır olayı
    client.on('ready', () => {
      console.log(`WhatsApp Web bağlantısı hazır: ${userId}`);
      
      // Socket ile durum bilgisi gönder
      const userSocket = socketConnections[userId];
      if (userSocket) {
        client.getState().then(state => {
          userSocket.emit('whatsapp_web_status', {
            status: 'connected',
            phoneNumber: client.info ? client.info.wid.user : null,
            userId
          });
        });
      }
    });

    // WhatsApp Web mesaj olayı
    client.on('message', async (message) => {
      console.log(`WhatsApp mesajı alındı: ${message.body}`);
      
      // Socket ile mesaj gönder
      const userSocket = socketConnections[userId];
      if (userSocket) {
        userSocket.emit('whatsapp_message', message);
      }
    });

    // Bağlantıyı başlat
    client.initialize().catch(err => {
      console.error(`İstemci başlatılırken hata: ${err.message}`);
    });

    // Aktif istemcilere ekle
    activeClients[userId] = client;
    
    return client;
  } catch (error) {
    console.error(`WhatsApp Web istemcisi oluşturulurken hata: ${error.message}`);
    return null;
  }
};

// QR kodu isteği işleyicisi
const requestQrCode = (userId, socket) => {
  try {
    console.log(`QR kodu isteniyor: ${userId}`);
    
    // Socket bağlantısını kaydet
    if (socket) {
      socketConnections[userId] = socket;
    }
    
    // Mevcut istemciyi kontrol et
    let client = activeClients[userId];
    
    // İstemci yoksa oluştur
    if (!client) {
      client = createWhatsAppClient(userId);
    } else {
      // İstemci durumunu kontrol et
      client.getState().then(state => {
        if (state === 'CONNECTED') {
          // Zaten bağlı, durum bilgisini gönder
          socket.emit('whatsapp_web_status', {
            status: 'connected',
            phoneNumber: client.info ? client.info.wid.user : null,
            userId
          });
        } else {
          // Bağlı değil, yeni QR kodu oluştur
          client.destroy().finally(() => {
            delete activeClients[userId];
            createWhatsAppClient(userId);
          });
        }
      }).catch(err => {
        console.error(`İstemci durumu kontrol edilirken hata: ${err.message}`);
        // Hata durumunda yeni istemci oluştur
        client.destroy().finally(() => {
          delete activeClients[userId];
          createWhatsAppClient(userId);
        });
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error(`QR kodu istenirken hata: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Bağlantı durumu kontrolü
const checkConnectionStatus = (userId, socket) => {
  try {
    console.log(`Bağlantı durumu kontrol ediliyor: ${userId}`);
    
    // Socket bağlantısını güncelle
    if (socket) {
      socketConnections[userId] = socket;
    }
    
    // İstemciyi kontrol et
    const client = activeClients[userId];
    if (!client) {
      return { status: 'disconnected', phoneNumber: null };
    }
    
    // İstemci durumunu al
    return client.getState().then(state => {
      if (state === 'CONNECTED') {
        return {
          status: 'connected',
          phoneNumber: client.info ? client.info.wid.user : null
        };
      } else {
        return { status: 'disconnected', phoneNumber: null };
      }
    }).catch(err => {
      console.error(`İstemci durumu alınırken hata: ${err.message}`);
      return { status: 'error', phoneNumber: null };
    });
  } catch (error) {
    console.error(`Bağlantı durumu kontrol edilirken hata: ${error.message}`);
    return { status: 'error', phoneNumber: null };
  }
};

// WhatsApp Web bağlantısını kesme
const disconnectWhatsApp = async (userId) => {
  try {
    console.log(`WhatsApp bağlantısı kesiliyor: ${userId}`);
    
    // İstemciyi kontrol et ve kapat
    const client = activeClients[userId];
    if (client) {
      await client.destroy();
      delete activeClients[userId];
    }
    
    // Socket bağlantısını kontrol et
    const socket = socketConnections[userId];
    if (socket) {
      socket.emit('whatsapp_web_status', {
        status: 'disconnected',
        phoneNumber: null,
        userId
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error(`WhatsApp bağlantısı kesilirken hata: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Mesaj gönderme
const sendMessage = async (userId, to, message) => {
  try {
    console.log(`Mesaj gönderiliyor (${userId}): ${to} - ${message}`);
    
    // İstemciyi kontrol et
    const client = activeClients[userId];
    if (!client) {
      return { success: false, error: 'WhatsApp bağlantısı yok' };
    }
    
    // İstemci durumunu kontrol et
    const state = await client.getState();
    if (state !== 'CONNECTED') {
      return { success: false, error: 'WhatsApp bağlantısı aktif değil' };
    }
    
    // Telefon numarasını formatla
    let formattedNumber = to.replace(/\D/g, '');
    
    // Numaranın başında + veya ülke kodu yoksa ekle
    if (!formattedNumber.startsWith('90') && !formattedNumber.startsWith('+90')) {
      formattedNumber = `90${formattedNumber}`;
    }
    
    // + işaretini kaldır
    formattedNumber = formattedNumber.replace('+', '');
    
    // Numarayı WhatsApp formatına çevir
    const chatId = `${formattedNumber}@c.us`;
    
    // Mesajı gönder
    const response = await client.sendMessage(chatId, message);
    
    return {
      success: true,
      messageId: response.id.id
    };
  } catch (error) {
    console.error(`Mesaj gönderilirken hata: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Socket.io bağlantısını ayarla
const setupSocketConnection = (socket, userId) => {
  try {
    console.log(`Socket bağlantısı kuruluyor: ${userId}`);
    
    // Socket bağlantısını kaydet
    socketConnections[userId] = socket;
    
    // QR kodu isteği
    socket.on('request_whatsapp_qr', () => {
      requestQrCode(userId, socket);
    });
    
    // Bağlantı durumu isteği
    socket.on('check_whatsapp_status', () => {
      checkConnectionStatus(userId, socket).then(status => {
        socket.emit('whatsapp_web_status', {
          ...status,
          userId
        });
      });
    });
    
    // Bağlantıyı kesme isteği
    socket.on('disconnect_whatsapp', () => {
      disconnectWhatsApp(userId);
    });
    
    // Mesaj gönderme isteği
    socket.on('send_whatsapp_message', (data) => {
      const { to, message } = data;
      sendMessage(userId, to, message).then(result => {
        socket.emit('whatsapp_message_sent', result);
      });
    });
    
    // Socket bağlantısı kopunca temizlik yap
    socket.on('disconnect', () => {
      // Socket bağlantısını temizle
      if (socketConnections[userId] === socket) {
        delete socketConnections[userId];
      }
    });
  } catch (error) {
    console.error(`Socket bağlantısı kurulurken hata: ${error.message}`);
  }
};

// Modülü dışa aktar
module.exports = {
  createWhatsAppClient,
  requestQrCode,
  checkConnectionStatus,
  disconnectWhatsApp,
  sendMessage,
  setupSocketConnection
};