import axios from 'axios';
import { Account, Platform } from '../types';

// Base URL for Meta Graph API
const META_API_VERSION = 'v22.0';
const META_API_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

// Meta Platform API Service
export const metaService = {
  // Get user profile information
  getUserProfile: async (accessToken: string) => {
    try {
      const response = await axios.get(`${META_API_BASE_URL}/me`, {
        params: {
          fields: 'id,name,email',
          access_token: accessToken
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Get Facebook pages that the user manages
  getPages: async (accessToken: string) => {
    try {
      const response = await axios.get(`${META_API_BASE_URL}/me/accounts`, {
        params: {
          access_token: accessToken
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Facebook pages:', error);
      throw error;
    }
  },

  // Get Instagram business accounts connected to a Facebook page
  getInstagramAccounts: async (accessToken: string, pageId: string) => {
    try {
      const response = await axios.get(`${META_API_BASE_URL}/${pageId}/instagram_accounts`, {
        params: {
          access_token: accessToken
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Instagram accounts:', error);
      throw error;
    }
  },

  // Get Instagram business account details
  getInstagramBusinessAccount: async (accessToken: string, igAccountId: string) => {
    try {
      const response = await axios.get(`${META_API_BASE_URL}/${igAccountId}`, {
        params: {
          fields: 'id,username,profile_picture_url,name,biography,website,ig_id,followers_count,follows_count,media_count',
          access_token: accessToken
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Instagram business account:', error);
      throw error;
    }
  },

  // Get WhatsApp Business Account details
  getWhatsAppBusinessAccount: async (accessToken: string, phoneNumberId: string) => {
    try {
      const response = await axios.get(`${META_API_BASE_URL}/${phoneNumberId}/whatsapp_business_profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching WhatsApp business account:', error);
      throw error;
    }
  },

  // Send message via Instagram Direct
  sendInstagramMessage: async (accessToken: string, igUserId: string, recipientId: string, message: string) => {
    try {
      const response = await axios.post(
        `${META_API_BASE_URL}/${igUserId}/messages`,
        {
          recipient: { id: recipientId },
          message: { text: message }
        },
        {
          params: { access_token: accessToken }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending Instagram message:', error);
      throw error;
    }
  },

  // Send message via Facebook Messenger
  sendMessengerMessage: async (accessToken: string, pageId: string, recipientId: string, message: string) => {
    try {
      const response = await axios.post(
        `${META_API_BASE_URL}/${pageId}/messages`,
        {
          recipient: { id: recipientId },
          message: { text: message }
        },
        {
          params: { access_token: accessToken }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending Messenger message:', error);
      throw error;
    }
  },

  // Send message via WhatsApp Business API
  sendWhatsAppMessage: async (accessToken: string, phoneNumberId: string, recipientPhone: string, message: string) => {
    try {
      // Format phone number (remove any non-digit characters)
      const formattedPhone = recipientPhone.replace(/\D/g, '');
      
      const response = await axios.post(
        `${META_API_BASE_URL}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  },

  // Get conversations for a specific platform
  getConversations: async (account: Account) => {
    try {
      let response;
      
      if (account.platform === 'instagram' && account.accessToken && account.igUserId) {
        response = await axios.get(`${META_API_BASE_URL}/${account.igUserId}/conversations`, {
          params: {
            access_token: account.accessToken,
            fields: 'participants,messages{id,from,to,message,created_time}'
          }
        });
      } else if (account.platform === 'messenger' && account.accessToken && account.pageId) {
        response = await axios.get(`${META_API_BASE_URL}/${account.pageId}/conversations`, {
          params: {
            access_token: account.accessToken,
            fields: 'participants,messages{id,from,to,message,created_time}'
          }
        });
      } else if (account.platform === 'whatsapp' && account.accessToken && account.phoneNumberId) {
        // WhatsApp API doesn't have a direct endpoint for fetching conversations
        // Usually, you'd need to implement webhook handling to receive messages
        throw new Error('WhatsApp API does not support fetching conversations directly');
      } else {
        throw new Error('Invalid account configuration');
      }
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching ${account.platform} conversations:`, error);
      throw error;
    }
  },

  // Setup webhook for a specific platform
  setupWebhook: async (account: Account, verifyToken: string, callbackUrl: string) => {
    try {
      let response;
      
      if ((account.platform === 'instagram' || account.platform === 'messenger') && 
          account.accessToken && account.pageId) {
        // For Instagram and Messenger, we subscribe to page webhooks
        response = await axios.post(
          `${META_API_BASE_URL}/${account.pageId}/subscribed_apps`,
          {
            subscribed_fields: ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads'],
            callback_url: callbackUrl,
            verify_token: verifyToken
          },
          {
            params: { access_token: account.accessToken }
          }
        );
      } else if (account.platform === 'whatsapp' && account.accessToken && account.businessId) {
        // For WhatsApp, we need to configure webhooks at the business account level
        response = await axios.post(
          `${META_API_BASE_URL}/${account.businessId}/webhooks`,
          {
            object: 'whatsapp_business_account',
            callback_url: callbackUrl,
            verify_token: verifyToken,
            fields: ['messages', 'message_status_updates']
          },
          {
            headers: {
              'Authorization': `Bearer ${account.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        throw new Error('Invalid account configuration');
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error setting up ${account.platform} webhook:`, error);
      throw error;
    }
  },
  
  // Test webhook verification
  testWebhookVerification: async (webhookUrl: string, verifyToken: string) => {
    try {
      // Construct verification URL with query parameters
      const verificationUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=CHALLENGE_ACCEPTED`;
      
      const response = await axios.get(verificationUrl);
      return {
        success: response.status === 200,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Webhook verification test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        status: error.response?.status || 500
      };
    }
  },
  
  // Test webhook message delivery
  testWebhookMessage: async (webhookUrl: string, payload: any) => {
    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return {
        success: response.status === 200,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Webhook message test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        status: error.response?.status || 500
      };
    }
  }
};

export default metaService;