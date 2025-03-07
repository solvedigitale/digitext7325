import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { initializeWebhookListener } from './services/webhookService';
import { socket, reconnectSocket } from './services/socket';

// Initialize webhook listener
const webhookSocket = initializeWebhookListener();

// Add error handling for socket connections
window.addEventListener('online', () => {
  console.log('İnternet bağlantısı yeniden kuruldu, socket bağlantısını yeniden başlatıyorum...');
  reconnectSocket();
});

// Handle socket errors globally
if (socket) {
  socket.on('error', (error) => {
    console.error('Socket genel hata:', error);
  });
}

if (webhookSocket) {
  webhookSocket.on('error', (error) => {
    console.error('Webhook socket genel hata:', error);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);