export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string
          avatar_url: string | null
          role: string
          last_sign_in: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name: string
          avatar_url?: string | null
          role?: string
          last_sign_in?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string
          avatar_url?: string | null
          role?: string
          last_sign_in?: string | null
        }
      }
      accounts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          platform: string
          avatar_url: string | null
          access_token: string | null
          page_id: string | null
          ig_user_id: string | null
          phone_number_id: string | null
          business_id: string | null
          external_id: string | null
          is_active: boolean
        }
        Insert: {
          id: string
          created_at?: string
          user_id: string
          name: string
          platform: string
          avatar_url?: string | null
          access_token?: string | null
          page_id?: string | null
          ig_user_id?: string | null
          phone_number_id?: string | null
          business_id?: string | null
          external_id?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          platform?: string
          avatar_url?: string | null
          access_token?: string | null
          page_id?: string | null
          ig_user_id?: string | null
          phone_number_id?: string | null
          business_id?: string | null
          external_id?: string | null
          is_active?: boolean
        }
      }
      contacts: {
        Row: {
          id: string
          created_at: string
          account_id: string
          name: string
          avatar_url: string | null
          platform: string
          external_id: string
          last_message: string | null
          last_message_time: string | null
          unread_count: number
          notes: string | null
          assigned_to: string | null
        }
        Insert: {
          id: string
          created_at?: string
          account_id: string
          name: string
          avatar_url?: string | null
          platform: string
          external_id: string
          last_message?: string | null
          last_message_time?: string | null
          unread_count?: number
          notes?: string | null
          assigned_to?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          account_id?: string
          name?: string
          avatar_url?: string | null
          platform?: string
          external_id?: string
          last_message?: string | null
          last_message_time?: string | null
          unread_count?: number
          notes?: string | null
          assigned_to?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          contact_id: string
          content: string
          sender: string
          is_read: boolean
          agent_id: string | null
        }
        Insert: {
          id: string
          created_at?: string
          contact_id: string
          content: string
          sender: string
          is_read?: boolean
          agent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          contact_id?: string
          content?: string
          sender?: string
          is_read?: boolean
          agent_id?: string | null
        }
      }
      contact_labels: {
        Row: {
          id: string
          created_at: string
          contact_id: string
          label_id: string
        }
        Insert: {
          id: string
          created_at?: string
          contact_id: string
          label_id: string
        }
        Update: {
          id?: string
          created_at?: string
          contact_id?: string
          label_id?: string
        }
      }
      labels: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          color: string
        }
        Insert: {
          id: string
          created_at?: string
          user_id: string
          name: string
          color: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          color?: string
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          contact_id: string
          order_number: string
          amount: number
          shipping_company: string | null
          status: string
          return_reason: string | null
          return_date: string | null
          agent_id: string | null
        }
        Insert: {
          id: string
          created_at?: string
          contact_id: string
          order_number: string
          amount: number
          shipping_company?: string | null
          status: string
          return_reason?: string | null
          return_date?: string | null
          agent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          contact_id?: string
          order_number?: string
          amount?: number
          shipping_company?: string | null
          status?: string
          return_reason?: string | null
          return_date?: string | null
          agent_id?: string | null
        }
      }
      templates: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          content: string
        }
        Insert: {
          id: string
          created_at?: string
          user_id: string
          name: string
          content: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          content?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}