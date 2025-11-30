import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, ApiResponse } from '../../shared/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  avatar?: string;
  phone?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ApiResponse>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role?: 'student' | 'tutor';
    phone?: string;
  }) => Promise<ApiResponse>;
  logout: () => void;
  updateProfile: (profileData: {
    name?: string;
    phone?: string;
    avatar?: string;
  }) => Promise<ApiResponse>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        apiClient.setToken(storedToken);
        
        try {
          const response = await apiClient.getProfile();
          if (response.success && response.data) {
            setUser((response.data as { user: User }).user);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            setToken(null);
            apiClient.setToken(null);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
          setToken(null);
          apiClient.setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login({ email, password });
      
      if (response.success && response.data) {
        setUser((response.data as any).user);
        setToken((response.data as any).token);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role?: 'student' | 'tutor';
    phone?: string;
  }): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(userData);

      if (response.success && response.data) {
        const token = (response.data as any).token;
        setUser((response.data as any).user);
        setToken(token);
        apiClient.setToken(token); // Set token in apiClient for subsequent requests
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiClient.logout();
  };

  const updateProfile = async (profileData: {
    name?: string;
    phone?: string;
    avatar?: string;
  }): Promise<ApiResponse> => {
    try {
      const response = await apiClient.updateProfile(profileData);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
      
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Profile update failed'
      };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getProfile();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
 
