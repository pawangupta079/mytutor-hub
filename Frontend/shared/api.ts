//------------------------------------------------------
// FIX BASE URL (IMPORTANT)
//------------------------------------------------------
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://mytutor-hub.onrender.com/api";

//------------------------------------------------------
// Api Response Type
//------------------------------------------------------
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: string[];
}

//------------------------------------------------------
// Api Client Class
//------------------------------------------------------
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  //------------------------------------------------------
  // REQUEST WRAPPER
  //------------------------------------------------------
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
        "Content-Type": "application/json",
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

        if (response.status === 401) {
          this.setToken(null);
        }

        const err: any = new Error(errorData.message || "Request failed");
        err.status = response.status;
        err.errors = errorData.errors;
        err.data = errorData;
        throw err;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      if ((error as any)?.name === "AbortError") {
        const err: any = new Error("Request timed out");
        err.status = 408;
        throw err;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  //------------------------------------------------------
  // AUTH ENDPOINTS
  //------------------------------------------------------
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: "student" | "tutor";
    phone?: string;
  }) {
    return this.request<{ user: any; token: string }>("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ user: any; token: string }>(
      "/users/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    this.setToken(null);
  }

  //------------------------------------------------------
  // USER ENDPOINTS
  //------------------------------------------------------
  async getProfile() {
    return this.request<{ user: any }>("/users/profile");
  }

  async updateProfile(profileData: {
    name?: string;
    phone?: string;
    avatar?: string;
  }) {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async getDashboard() {
    return this.request("/users/dashboard");
  }

  //------------------------------------------------------
  // TUTOR ENDPOINTS
  //------------------------------------------------------
  async createTutorProfile(tutorData: any) {
    return this.request("/tutors/profile", {
      method: "POST",
      body: JSON.stringify(tutorData),
    });
  }

  async getTutorProfile() {
    return this.request("/tutors/profile/me");
  }

  async updateTutorProfile(tutorData: any) {
    return this.request("/tutors/profile", {
      method: "PUT",
      body: JSON.stringify(tutorData),
    });
  }

  async searchTutors(params: any) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    return this.request(`/tutors/search?${searchParams.toString()}`);
  }

  //------------------------------------------------------
  // SESSION + PAYMENT ETC...
  //------------------------------------------------------
  async bookSession(data: any) {
    return this.request("/sessions/book", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserSessions(params?: any) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) =>
        searchParams.append(k, v.toString())
      );
    }
    return this.request(`/sessions/my-sessions?${searchParams.toString()}`);
  }

  async createPaymentIntent(sessionId: string) {
    return this.request("/payments/create-intent", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  }
}

//------------------------------------------------------
// EXPORT API CLIENT SINGLETON
//------------------------------------------------------
export const apiClient = new ApiClient(API_BASE_URL);
