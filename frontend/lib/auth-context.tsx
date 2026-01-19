"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/user';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to create User object from Supabase session
function createUserFromSession(session: any): User {
  const metadata = session.user.user_metadata || {};
  return {
    id: session.user.id,
    email: session.user.email || '',
    name: metadata.name || session.user.email?.split('@')[0] || '',
    createdAt: session.user.created_at,
    isBusiness: metadata.isBusiness || false,
    accountNumber: metadata.accountNumber || 1000,
    subscriptionStatus: metadata.subscriptionStatus || 'demo',
    demoExpiresAt: metadata.demoExpiresAt || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    subscriptionPlan: metadata.subscriptionPlan || 'demo',
    referralCode: metadata.referralCode,
    referredBy: metadata.referredBy,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load auth state from Supabase on mount
  useEffect(() => {
    const supabase = createClient();

    const loadAuthState = async () => {
      try {
        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('Auth context - getSession result:', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          error: error?.message
        });

        if (session?.user) {
          const user = createUserFromSession(session);

          setAuthState({
            user,
            token: session.access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Also store in localStorage for backwards compatibility
          localStorage.setItem('authToken', session.access_token);
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          // No session - check localStorage as fallback
          const token = localStorage.getItem('authToken');
          const userStr = localStorage.getItem('user');

          if (token && userStr) {
            const user = JSON.parse(userStr);
            setAuthState({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            setAuthState((prev) => ({ ...prev, isLoading: false }));
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadAuthState();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        if (session?.user) {
          const user = createUserFromSession(session);

          setAuthState({
            user,
            token: session.access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('authToken', session.access_token);
          localStorage.setItem('user', JSON.stringify(user));
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState((prev) => ({
      ...prev,
      user,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
