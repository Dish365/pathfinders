import apiClient from '@/lib/api-client';

export const authService = {
  async getCsrfToken() {
    const response = await apiClient.get('/csrf/');
    return response.data.csrfToken;
  },

  async login(credentials: { username: string; password: string }) {
    // Get CSRF token before login
    await this.getCsrfToken();
    const response = await apiClient.post('/users/login/', credentials);
    return response.data;
  },

  async getCurrentUser() {
    // Get CSRF token before checking auth
    await this.getCsrfToken();
    const response = await apiClient.get('/users/me/');
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/users/logout/');
    return response.data;
  }
}; 