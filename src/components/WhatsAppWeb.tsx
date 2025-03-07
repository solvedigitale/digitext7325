// src/components/WhatsAppWeb.jsx
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { socket } from '../services/socket';

const WhatsAppWeb = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Socket bağlantısını kur
  useEffect(() => {
    // Socket bağlantısı kuruldu mu kontrol et
    if (!socket.connected) {
      socket.connect();
    }

    // Socket olaylarını dinle
    socket.on('connect', handleConnect);
    socket.on('whatsapp_web_qr', handleQrCode);
    socket.on('whatsapp_web_status', handleStatusUpdate);
    socket.on('whatsapp_message', handleMessage);
    socket.on('connect_error', handleConnectionError);

    // Bağlantı durumunu kontrol et
    checkConnectionStatus();

    // Temizlik fonksiyonu
    return () => {
      socket.off('connect', handleConnect);
      socket.off('whatsapp_web_qr', handleQrCode);
      socket.off('whatsapp_web_status', handleStatusUpdate);
      socket.off('whatsapp_message', handleMessage);
      socket.off('connect_error', handleConnectionError);
    };
  }, []);

  // Socket bağlantı olayları
  const handleConnect = () => {
    console.log('Socket bağlantısı kuruldu');
    checkConnectionStatus();
  };

  const handleQrCode = (data) => {
    console.log('QR kodu alındı');
    if (data && data.qrCode) {
      setQrCode(data.qrCode);
      setLoading(false);
    }
  };

  const handleStatusUpdate = (data) => {
    console.log('Bağlantı durumu güncellendi:', data);
    // Veri güvenliği için null kontrolü
    const status = data?.status || 'disconnected';
    const phone = data?.phoneNumber || null;
    
    setConnectionStatus(status);
    setPhoneNumber(phone);
    
    if (status === 'connected') {
      setQrCode(null);
    }
    setLoading(false);
  };

  const handleMessage = (message) => {
    console.log('Mesaj alındı:', message);
    // Burada mesajları işleyebilirsiniz
  };

  const handleConnectionError = (err) => {
    console.error('Socket bağlantı hatası:', err);
    setError('Bağlantı hatası oluştu. Lütfen sayfayı yenileyin.');
    setLoading(false);
  };

  // WhatsApp Web bağlantı durumunu kontrol et
  const checkConnectionStatus = () => {
    if (socket.connected) {
      console.log('WhatsApp bağlantı durumu kontrol ediliyor');
      socket.emit('check_whatsapp_status');
    }
  };

  // QR kodu iste
  const requestQrCode = () => {
    setLoading(true);
    setError(null);
    console.log('QR kodu isteniyor');
    socket.emit('request_whatsapp_qr');
  };

  // WhatsApp bağlantısını kes
  const disconnectWhatsApp = () => {
    setLoading(true);
    setError(null);
    console.log('WhatsApp bağlantısı kesiliyor');
    socket.emit('disconnect_whatsapp');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">WhatsApp Web Bağlantısı</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-6">
        {/* Bağlantı Durumu */}
        <div>
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <p className="text-sm font-medium text-gray-900">
              {connectionStatus === 'connected' ? 'Bağlı' : 
               connectionStatus === 'connecting' ? 'Bağlanıyor...' : 'Bağlı Değil'}
            </p>
          </div>
          
          {phoneNumber && (
            <p className="mt-1 text-sm text-gray-500">
              Telefon Numarası: {phoneNumber}
            </p>
          )}
        </div>
        
        {/* QR Kodu */}
        {qrCode && connectionStatus !== 'connected' && (
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-4">
              WhatsApp Web'e bağlanmak için aşağıdaki QR kodu telefonunuzdan tarayın:
            </p>
            <div className="flex justify-center">
              <QRCodeSVG value={qrCode} size={200} />
            </div>
            <p className="text-xs text-gray-500 mt-4">
              1. WhatsApp uygulamasını açın<br />
              2. Ayarlar veya Bağlı Cihazlar'a gidin<br />
              3. "Cihaz Ekle" seçeneğine tıklayın<br />
              4. Yukarıdaki QR kodu telefonunuzla tarayın
            </p>
          </div>
        )}
        
        {/* Butonlar */}
        <div className="flex space-x-4">
          {connectionStatus !== 'connected' ? (
            <button
              onClick={requestQrCode}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'İşleniyor...' : 'QR Kodu Al'}
            </button>
          ) : (
            <button
              onClick={disconnectWhatsApp}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'İşleniyor...' : 'Bağlantıyı Kes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppWeb;