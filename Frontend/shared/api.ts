const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mytutor-i2f5pwxhg-pawan-guptas-projects-46217623.vercel.app/api';
// Warn if using fallback base URL
try {
  if (!import.meta.env.VITE_API_URL) {
    // eslint-disable-next-line no-console
    console.warn('[api] VITE_API_URL not set; using fallback https://mytutor-i2f5pwxhg-pawan-guptas-projects-46217623.vercel.app/api');
  }
} catch {
  // ignore if import.meta is not available in some tooling contexts
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: string[];
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { timeoutMs?: number } = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? 12000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      method: options.method,
      body: options.body as any,
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        // Clear token on unauthorized
        if (response.status === 401) {
          this.setToken(null);
        }
        const err: any = new Error(errorData.message || 'Request failed');
        err.status = response.status;
        err.errors = errorData.errors;
        err.data = errorData;
        throw err;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('API request failed:', error);
      if ((error as any)?.name === 'AbortError') {
        const err: any = new Error('Request timed out');
        err.status = 408;
        throw err;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'student' | 'tutor';
    phone?: string;
  }) {
    return this.request<{ user: any; token: string }>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ user: any; token: string }>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  async forgotPassword(email: string) {
    return this.request('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // User endpoints
  async getProfile() {
    return this.request<{ user: any }>('/users/profile');
  }
  
  async updateProfile(profileData: {
    name?: string;
    phone?: string;
    avatar?: string;
  }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getDashboard() {
    return this.request('/users/dashboard');
  }

  // Tutor endpoints
  async createTutorProfile(tutorData: {
    bio: string;
    subjects: Array<{
      subject: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      hourlyRate: number;
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      year: number;
    }>;
    experience?: {
      years: number;
      description: string;
    };
    languages?: string[];
    availability?: {
      timezone: string;
      schedule: Array<{
        day: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
      }>;
    };
  }) {
    return this.request('/tutors/profile', {
      method: 'POST',
      body: JSON.stringify(tutorData),
    });
  }

  async getTutorProfile() {
    return this.request('/tutors/profile/me');
  }

  async updateTutorProfile(tutorData: any) {
    return this.request('/tutors/profile', {
      method: 'PUT',
      body: JSON.stringify(tutorData),
    });
  }

  async searchTutors(params: {
    subject?: string;
    level?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    location?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onlyComplete?: boolean;
    onlyAvailable?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          searchParams.append(key, value ? 'true' : 'false');
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    return this.request(`/tutors/search?${searchParams.toString()}`);
  }

  async getTutorById(tutorId: string) {
    return this.request(`/tutors/${tutorId}`);
  }

  async getTutorAvailability(tutorId: string, date: string) {
    return this.request(`/tutors/${tutorId}/availability?date=${date}`);
  }

  async updateAvailability(availability: any) {
    return this.request('/tutors/availability', {
      method: 'PUT',
      body: JSON.stringify({ availability }),
    });
  }

  async getTutorStats() {
    return this.request('/tutors/stats/me');
  }

  // Tutor Registration endpoints
  async completeTutorRegistration(tutorData: any) {
    return this.request('/tutors/register/complete', {
      method: 'POST',
      body: JSON.stringify(tutorData),
    });
  }

  async updateTutorRegistrationStep(step: number, data: any) {
    return this.request('/tutors/register/step', {
      method: 'PUT',
      body: JSON.stringify({ step, data }),
    });
  }

  // Session endpoints
  async bookSession(sessionData: {
    tutorId: string;
    subject: string;
    level: string;
    scheduledDate: string;
    duration: number;
    notes?: string;
  }) {
    return this.request('/sessions/book', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getUserSessions(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/sessions/my-sessions?${searchParams.toString()}`);
  }

  async getSessionById(sessionId: string) {
    return this.request(`/sessions/${sessionId}`);
  }

  async updateSessionStatus(sessionId: string, status: string, notes?: string) {
    return this.request(`/sessions/${sessionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async cancelSession(sessionId: string, reason?: string) {
    return this.request(`/sessions/${sessionId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getAvailableSlots(tutorId: string, date: string) {
    return this.request(`/sessions/tutor/${tutorId}/available-slots?date=${date}`);
  }

  // Payment endpoints
  async createPaymentIntent(sessionId: string) {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async confirmPayment(paymentId: string) {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    });
  }

  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/payments/history?${searchParams.toString()}`);
  }

  async getPaymentById(paymentId: string) {
    return this.request(`/payments/${paymentId}`);
  }

  async refundPayment(paymentId: string, reason?: string) {
    return this.request(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types
export type { ApiResponse };