import axios from 'axios';

// API URL - update this with your deployed backend URL
const API_URL = import.meta.env.VITE_API_URL || 'https://digitext-backend.onrender.com';

// Create axios instance with timeout and retry logic
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Add request interceptor for logging
api.interceptors.request.use(
  config => {
    console.log(`API İsteği: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('API İstek Hatası:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // If the error is a timeout or network error and we haven't retried yet
    if ((error.code === 'ECONNABORTED' || !error.response) && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Bağlantı hatası, yeniden deneniyor...');
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Retry the request
      return api(originalRequest);
    }
    
    console.error('API Yanıt Hatası:', error.message);
    return Promise.reject(error);
  }
);

// Meta Platform API (Facebook & Instagram)
export const metaApi = {
  // Get Facebook pages for a user
  getPages: async (accessToken: string) => {
    try {
      const response = await api.get('/api/meta/pages', {
        params: { accessToken }
      });
      return response.data;
    } catch (error) {
      console.error('Facebook sayfaları alınırken hata oluştu:', error);
      throw error;
    }
  },
  
  // Get Instagram accounts connected to a Facebook page
  getInstagramAccounts: async (accessToken: string, pageId: string) => {
    try {
      const response = await api.get('/api/meta/instagram-accounts', {
        params: { accessToken, pageId }
      });
      return response.data;
    } catch (error) {
      console.error('Instagram hesapları alınırken hata oluştu:', error);
      throw error;
    }
  },
  
  // Send message via Instagram
  sendInstagramMessage: async (accessToken: string, igUserId: string, recipientId: string, message: string) => {
    try {
      const response = await api.post('/api/meta/send-instagram-message', {
        accessToken,
        igUserId,
        recipientId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Instagram mesajı gönderilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Send message via Messenger
  sendMessengerMessage: async (accessToken: string, pageId: string, recipientId: string, message: string) => {
    try {
      const response = await api.post('/api/meta/send-messenger-message', {
        accessToken,
        pageId,
        recipientId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Messenger mesajı gönderilirken hata oluştu:', error);
      throw error;
    }
  }
};

// WhatsApp Business API
export const whatsappApi = {
  // Send message via WhatsApp
  sendMessage: async (phoneNumber: string, message: string, accessToken?: string, phoneNumberId?: string) => {
    try {
      const response = await api.post('/api/whatsapp/send-message', {
        phoneNumber,
        message,
        accessToken,
        phoneNumberId
      });
      return response.data;
    } catch (error) {
      console.error('WhatsApp mesajı gönderilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Get WhatsApp business profile
  getBusinessProfile: async (accessToken?: string, phoneNumberId?: string) => {
    try {
      const response = await api.get('/api/whatsapp/business-profile', {
        params: { accessToken, phoneNumberId }
      });
      return response.data;
    } catch (error) {
      console.error('WhatsApp işletme profili alınırken hata oluştu:', error);
      throw error;
    }
  }
};

// Test API connection
export const testApiConnection = async () => {
  try {
    const response = await api.get('/api/test');
    return response.data;
  } catch (error) {
    console.error('API bağlantı testi başarısız:', error);
    // Don't throw error here, just return false
    return false;
  }
};

export default api;