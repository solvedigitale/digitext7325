// server/index.js
import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Route imports
import webhookRoutes from './routes/webhooks.js';
import apiRoutes from './routes/api.js';

// WhatsApp Web Controller
import { createWhatsAppClient, requestQrCode, checkConnectionStatus, disconnectWhatsApp, sendMessage } from './controllers/whatsappWebController.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://app.digitext.io",
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

// Make io globally available
global.io = io;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://app.digitext.io",
  credentials: false
}));
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Error handling for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
});

// Attach io to request object so routes can access it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/webhooks', webhookRoutes);
app.use('/api', apiRoutes);

// Direct webhook routes for easier access
app.get('/webhook', (req, res) => {
  // Forward to meta webhook handler
  req.url = '/webhooks/meta';
  app.handle(req, res);
});

app.post('/webhook', (req, res) => {
  // Forward to meta webhook handler
  req.url = '/webhooks/meta';
  app.handle(req, res);
});

// Unofficial WhatsApp webhook endpoint
app.post('/whatsapp-webhook', (req, res) => {
  // Forward to unofficial WhatsApp webhook handler
  req.url = '/webhooks/unofficial-whatsapp';
  app.handle(req, res);
});

// Basic route
app.get('/', (req, res) => {
  res.send('Digitext API is running');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  // WhatsApp Web QR kod isteği
  socket.on('request_whatsapp_web_qr', async (data, callback) => {
    try {
      console.log('QR code requested by client:', socket.id);
      
      // Kullanıcı ID'si (gerçek uygulamada kimlik doğrulama kullanmalısınız)
      const userId = socket.id; // Veya daha kalıcı bir kimlik
      
      // QR kodu iste
      requestQrCode(userId, socket);
  
      if (callback) callback({ success: true });
    } catch (error) {
      console.error('Error generating QR code:', error);
      if (callback) callback({ error: error.message || 'Failed to generate QR code' });
    }
  });
  
  // Check WhatsApp Web connection status
  socket.on('check_whatsapp_web_status', (data, callback) => {
    try {
      // Kullanıcı ID'si
      const userId = socket.id;
      
      // Bağlantı durumunu kontrol et
      const status = checkConnectionStatus(userId, socket);
      
      if (callback) callback({ success: true, status });
    } catch (error) {
      console.error('Error checking WhatsApp Web status:', error);
      if (callback) callback({ error: error.message || 'Failed to check WhatsApp Web status' });
    }
  });

  // WhatsApp Web bağlantısını kesme
  socket.on('disconnect_whatsapp_web', async (data, callback) => {
    try {
      // Kullanıcı ID'si
      const userId = socket.id;
      
      // Bağlantıyı kes
      const result = await disconnectWhatsApp(userId);
      
      if (callback) callback(result);
    } catch (error) {
      console.error('Error disconnecting WhatsApp Web:', error);
      if (callback) callback({ success: false, error: error.message || 'Failed to disconnect WhatsApp Web' });
    }
  });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});