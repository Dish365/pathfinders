import axios from 'axios';
import { User, LoginCredentials, RegisterData, AuthResponse, ProfileFormData } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/users/login/`, credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/users/register/`, data);
    return response.data;
  },

  async logout(): Promise<void> {
    await axios.post(`${API_URL}/api/users/logout/`);
  },

  async getProfile(): Promise<User> {
    const response = await axios.get(`${API_URL}/api/users/me/`);
    return response.data;
  },

  async updateProfile(data: ProfileFormData): Promise<User> {
    const response = await axios.patch(`${API_URL}/api/users/me/`, data);
    return response.data;
  }
}; 