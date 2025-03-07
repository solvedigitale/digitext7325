import axios from 'axios';
import { Account } from '../types';

// API için temel URL
const API_URL = import.meta.env.VITE_API_URL || 'https://digitext-backend.onrender.com';

// Hem resmi hem de resmi olmayan entegrasyonlar için WhatsApp Servisi
const whatsappService = {
  // WhatsApp üzerinden mesaj gönder (hem resmi hem de resmi olmayan entegrasyonlarla çalışır)
  sendMessage: async (account: Account, recipientPhone: string, message: string) => {
    try {
      // Bu resmi olmayan bir entegrasyon mu kontrol et
      if (account.accessToken === 'unofficial-whatsapp-access') {
        // Resmi olmayan entegrasyonlar için farklı bir endpoint kullanıyoruz
        const response = await axios.post(`${API_URL}/api/whatsapp/unofficial-send`, {
          from: account.phoneNumberId,
          to: recipientPhone,
          message: message
        });
        return response.data;
      } else if (account.accessToken === 'whatsapp-web') {
        // WhatsApp Web entegrasyonu için
        const response = await axios.post(`${API_URL}/api/whatsapp/web-send`, {
          to: recipientPhone,
          message: message,
          from: account.phoneNumberId
        });
        return response.data;
      } else {
        // Resmi WhatsApp Business API için
        const response = await axios.post(`${API_URL}/api/whatsapp/send-message`, {
          phoneNumber: recipientPhone,
          message: message,
          accessToken: account.accessToken,
          phoneNumberId: account.phoneNumberId
        });
        return response.data;
      }
    } catch (error) {
      console.error('WhatsApp mesajı gönderilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Resmi olmayan WhatsApp entegrasyonu için telefon numarası kaydetme
  registerUnofficialNumber: async (phoneNumber: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/whatsapp/register-unofficial`, {
        phoneNumber: phoneNumber
      });
      return response.data;
    } catch (error) {
      console.error('Resmi olmayan WhatsApp numarası kaydedilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Üçüncü taraf hizmetler için webhook URL'sini al
  getWebhookUrl: () => {
    return `${API_URL}/whatsapp-webhook`;
  },
  
  // Test için örnek bir webhook payload'ı oluştur
  generateSamplePayload: (phoneNumber: string) => {
    return {
      from: phoneNumber,
      text: "Bu, WhatsApp entegrasyonundan bir test mesajıdır",
      timestamp: new Date().toISOString(),
      id: `test-${Date.now()}`
    };
  },
  
  // Örnek bir mesaj göndererek webhook'u test et
  testWebhook: async (phoneNumber: string) => {
    try {
      const payload = whatsappService.generateSamplePayload(phoneNumber);
      const response = await axios.post(`${API_URL}/whatsapp-webhook`, payload);
      return response.data;
    } catch (error) {
      console.error('Webhook test edilirken hata oluştu:', error);
      throw error;
    }
  }
};

export default whatsappService;