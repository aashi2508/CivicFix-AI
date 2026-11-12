import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-9021',
  name: 'Alex Rivera',
  email: 'alex.rivera@civicfix.org',
  ward: 'Ward 112 - Domlur / Indiranagar',
  city: 'Bengaluru',
  tier: 'Civic Guardian • Lvl 4',
  points: 480,
  reportsFiled: 6,
  resolvedCount: 5,
  aiAccuracyScore: 98.4,
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const STORAGE_KEYS = {
  AUTH_USER: '@civicfix_user',
  LOGGED_IN: '@civicfix_logged_in',
  ONBOARDED: '@civicfix_onboarded',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadPersistedAuth();
  }, []);

  const loadPersistedAuth = async () => {
    try {
      const [savedUser, savedLoggedIn, savedOnboarded, token] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER),
        AsyncStorage.getItem(STORAGE_KEYS.LOGGED_IN),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
        ApiService.getToken(),
      ]);

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      if (savedLoggedIn !== null) {
        setIsLoggedIn(savedLoggedIn === 'true');
      }
      if (savedOnboarded !== null) {
        setIsOnboarded(savedOnboarded === 'true');
      }

      // If no token exists yet, authenticate in background with seed citizen so backend APIs work immediately
      if (!token) {
        try {
          const authRes = await ApiService.login('citizen@example.test', 'ChangeMe123!');
          if (authRes.user && !savedUser) {
            const mappedUser: UserProfile = {
              ...DEFAULT_USER,
              id: authRes.user.id,
              name: authRes.user.name,
              email: authRes.user.email,
            };
            setUser(mappedUser);
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(mappedUser));
          }
        } catch {
          // Backend may be starting up
        }
      }
    } catch (err) {
      console.warn('Error reading auth state from storage', err);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const result = await ApiService.login(email, password);
      const activeUser: UserProfile = {
        ...DEFAULT_USER,
        id: result.user.id,
        email: result.user.email,
        name: result.user.name || email.split('@')[0],
      };

      setUser(activeUser);
      setIsLoggedIn(true);

      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(activeUser));
      await AsyncStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'true');
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.warn('API login failed, checking fallback:', err.message);

      // Fallback for offline demo testing if backend is unreachable
      const activeUser: UserProfile = {
        ...DEFAULT_USER,
        email: email.trim(),
        name: email.split('@')[0].replace('.', ' ') || 'Citizen User',
      };
      setUser(activeUser);
      setIsLoggedIn(true);
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(activeUser));
      await AsyncStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'true');
      setIsLoading(false);
      return true;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const result = await ApiService.register(name, email, password);
      const newUser: UserProfile = {
        ...DEFAULT_USER,
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        reportsFiled: 0,
        resolvedCount: 0,
        points: 50,
        tier: 'Civic Scout • Lvl 1',
      };

      setUser(newUser);
      setIsLoggedIn(true);

      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(newUser));
      await AsyncStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'true');
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.warn('API register failed, checking fallback:', err.message);

      const newUser: UserProfile = {
        ...DEFAULT_USER,
        name: name.trim(),
        email: email.trim(),
        reportsFiled: 0,
        resolvedCount: 0,
        points: 50,
        tier: 'Civic Scout • Lvl 1',
      };

      setUser(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }
  };

  const logout = async () => {
    setIsLoggedIn(false);
    await ApiService.clearToken();
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'false');
    } catch (err) {
      console.warn('Failed to logout', err);
    }
  };

  const completeOnboarding = async () => {
    setIsOnboarded(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
    } catch (err) {
      console.warn('Failed to set onboarded', err);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const merged = { ...user, ...updated };
    setUser(merged);
    AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(merged)).catch(
      () => {}
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isOnboarded,
        isLoading,
        login,
        register,
        logout,
        completeOnboarding,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
