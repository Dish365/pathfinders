import { RoleRecommendations, GiftDescription } from './assessment';

interface GiftSummary {
  primary_gift: string;
  secondary_gifts: string[];
  last_assessment: string;
  descriptions?: {
    primary: GiftDescription;
    secondary: GiftDescription[];
  };
}

export interface UserProfile {
  recommended_roles: RoleRecommendations;
  gift_summary?: GiftSummary;
  bio?: string;
  birth_date?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  profile: UserProfile;
  assessment_count: number;
  latest_assessment?: {
    id: number;
    timestamp: string;
    is_complete: boolean;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

export interface ProfileFormData {
  first_name?: string;
  last_name?: string;
  email: string;
  bio?: string;
  birth_date?: string;
} 