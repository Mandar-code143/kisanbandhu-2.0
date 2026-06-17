import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Language } from '@/lib/i18n';
import { auth as apiAuth } from '@/lib/api';

export type UserRole = 'farmer' | 'worker' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  village: string;
  taluka: string;
  district: string;
  state: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  joinedDate: string;
  primaryCrops?: string;
  skills?: string;
  experienceYears?: number;
  dailyWage?: number;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ error?: string }>;
  signup: (phone: string, password: string, metadata: Record<string, string>) => Promise<{ error?: string }>;
  demoLogin: (role: UserRole) => void;
  logout: () => Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUsers: Record<string, AppUser> = {
  farmer: {
    id: 'f1', name: 'Rajesh Patil', phone: '9876543210', email: 'rajesh@example.com',
    role: 'farmer', village: 'Shindewadi', taluka: 'Baramati', district: 'Pune', state: 'Maharashtra',
    verified: true, rating: 4.7, reviewCount: 23, joinedDate: '2024-03-15',
  },
  worker: {
    id: 'w1', name: 'Sunita Jadhav', phone: '9123456780',
    role: 'worker', village: 'Nimgaon', taluka: 'Indapur', district: 'Pune', state: 'Maharashtra',
    verified: true, rating: 4.9, reviewCount: 45, joinedDate: '2024-01-20',
  },
  admin: {
    id: 'a1', name: 'Priya Sharma', phone: '9000000001', email: 'admin@krushi.in',
    role: 'admin', village: '', taluka: '', district: 'Pune', state: 'Maharashtra',
    verified: true, rating: 0, reviewCount: 0, joinedDate: '2023-12-01',
  },
};

function mapBackendUser(u: any): AppUser {
  const profile = u.profile || {};
  return {
    id: u.id,
    name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || u.name || u.phone,
    phone: u.phone || profile.phone || '',
    email: u.email || undefined,
    role: (u.role?.toLowerCase() || 'farmer') as UserRole,
    village: profile.village || '',
    taluka: profile.taluka || '',
    district: profile.district || 'Pune',
    state: profile.state || 'Maharashtra',
    verified: u.isVerified || false,
    rating: Number(profile.rating) || 0,
    reviewCount: profile.reviewCount || 0,
    joinedDate: u.createdAt || new Date().toISOString(),
    primaryCrops: u.farmer?.cropTypes || undefined,
    skills: u.worker?.skills || undefined,
    experienceYears: u.worker?.experience || undefined,
    dailyWage: u.worker?.dailyRate || undefined,
    avatarUrl: profile.avatar || undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLang] = useState<Language>(() => {
    return (localStorage.getItem('krushi_lang') as Language) || 'en';
  });

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiAuth.getMe();
      if (data) {
        const appUser = mapBackendUser(data);
        setUser(appUser);
        localStorage.setItem('krushi_user', JSON.stringify(appUser));
        if (data.profile?.languagePref) {
          setLang(data.profile.languagePref as Language);
        }
      }
    } catch {
      const cached = localStorage.getItem('krushi_user');
      if (cached) {
        try { setUser(JSON.parse(cached)); } catch { /* ignore */ }
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('krushi_token');
    if (token) {
      fetchProfile().finally(() => setIsLoading(false));
    } else {
      const cached = localStorage.getItem('krushi_user');
      if (cached) {
        try { setUser(JSON.parse(cached)); } catch { /* ignore */ }
      }
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const login = useCallback(async (phone: string, password: string) => {
    try {
      const result = await apiAuth.login(phone, password);
      localStorage.setItem('krushi_token', result.accessToken);
      await fetchProfile();
      return {};
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    }
  }, [fetchProfile]);

  const signup = useCallback(async (phone: string, password: string, metadata: Record<string, string>) => {
    try {
      const result = await apiAuth.register({
        phone,
        email: metadata.email || undefined,
        password,
        firstName: metadata.fullName || metadata.name || phone,
        lastName: metadata.lastName || '',
        role: (metadata.role || 'FARMER').toUpperCase(),
        district: metadata.district || undefined,
        taluka: metadata.taluka || undefined,
        village: metadata.village || undefined,
        languagePref: metadata.languagePref || language,
      });
      localStorage.setItem('krushi_token', result.accessToken);
      await fetchProfile();
      return {};
    } catch (err: any) {
      return { error: err.message || 'Registration failed' };
    }
  }, [fetchProfile, language]);

  const demoLogin = useCallback((role: UserRole) => {
    const u = demoUsers[role];
    setUser(u);
    localStorage.setItem('krushi_user', JSON.stringify(u));
  }, []);

  const logout = useCallback(async () => {
    try { await apiAuth.logout(); } catch { /* ignore */ }
    localStorage.removeItem('krushi_token');
    localStorage.removeItem('krushi_user');
    setUser(null);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    localStorage.setItem('krushi_lang', lang);
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading,
      login, signup, demoLogin, logout,
      language, setLanguage, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
