// Global type definitions for Fanview platform
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'creator' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Creator {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  total_subscribers: number;
  total_revenue: number;
  monthly_price: number;
  is_active: boolean;
  social_links?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    onlyfans?: string;
  };
  created_at: string;
  profile?: User;
}

export interface Content {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  content_url: string;
  thumbnail_url?: string;
  content_type: 'image' | 'video' | 'text' | 'audio';
  is_premium: boolean;
  view_count: number;
  like_count: number;
  created_at: string;
  creator?: Creator;
}

export interface Subscription {
  id: string;
  user_id: string;
  creator_id: string;
  paypal_subscription_id?: string;
  status: 'active' | 'inactive' | 'cancelled' | 'pending';
  start_date: string;
  end_date?: string;
  amount: number;
  created_at: string;
  creator?: Creator;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'paypal' | 'card' | 'google_pay';
  provider_id: string;
  is_default: boolean;
  created_at: string;
}

export interface Analytics {
  creator_id: string;
  total_views: number;
  total_likes: number;
  total_subscribers: number;
  monthly_revenue: number;
  growth_rate: number;
  top_content: Content[];
}