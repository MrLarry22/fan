import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        handleUserSession(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          handleUserSession(session.user);
        } else {
          setProfile(null);
          // Clear the custom token when signing out
          localStorage.removeItem('authToken');
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (user: User) => {
    try {
      // First, try to get a backend token using the user's email
      if (user.email) {
        try {
          const backendResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: user.email, 
              password: 'oauth-login' // Special marker for OAuth logins
            }),
          });

          if (backendResponse.ok) {
            const backendData = await backendResponse.json();
            if (backendData.success && backendData.data.token) {
              localStorage.setItem('authToken', backendData.data.token);
              console.log('Auth token stored for OAuth user');
            }
          }
        } catch (error) {
          console.log('Backend token retrieval failed for OAuth user, continuing without it');
        }
      }

      // Fetch profile from Supabase
      await fetchProfile(user.id);
    } catch (error) {
      console.error('Error handling user session:', error);
      setProfile(null);
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Starting sign-up process for:', email);
      
      // Use our custom backend for registration
      const backendResponse = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      console.log('Backend registration response status:', backendResponse.status);

      const backendData = await backendResponse.json();
      console.log('Backend registration response:', backendData);
      
      if (!backendResponse.ok) {
        console.error('Backend registration failed:', backendData);
        return { error: { message: backendData.message || 'Registration failed' } as any };
      }

      if (backendData.success) {
        console.log('Sign-up process completed successfully');
        return { error: null };
      } else {
        console.error('Failed to register:', backendData.message);
        return { error: { message: backendData.message || 'Registration failed' } as any };
      }

    } catch (error) {
      console.error('Sign-up process error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during sign-up.';
      return { error: { message: errorMessage } as any };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign-in process for:', email);
      
      // First, sign in with our custom backend to get the JWT
      const backendResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Backend login response status:', backendResponse.status);

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        console.error('Backend login failed:', errorData);
        return { error: { message: errorData.message || 'Backend login failed' } as AuthError };
      }

      const backendData = await backendResponse.json();
      console.log('Backend login response:', backendData);
      
      if (backendData.success && backendData.data.token) {
        // Store the custom token
        localStorage.setItem('authToken', backendData.data.token);
        console.log('Auth token stored in localStorage');
      } else {
        console.error('Failed to get token from backend response');
        return { error: { message: 'Failed to retrieve auth token from backend' } as AuthError };
      }

      // Then, sign in with Supabase to establish its session
      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        console.error('Supabase login failed:', supabaseError);
        // If Supabase fails, log out from backend by removing token
        localStorage.removeItem('authToken');
        return { error: supabaseError };
      }

      console.log('Sign-in process completed successfully');
      return { error: null };

    } catch (error) {
      console.error('Sign-in process error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during sign-in.';
      return { error: { message: errorMessage } as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    // Determine the correct redirect URL based on environment
    const getRedirectUrl = () => {
      const currentUrl = window.location.origin;
      
      // Local development
      if (currentUrl.includes('localhost')) {
        return `${currentUrl}/dashboard`;
      }
      
      // Production - replace with your actual domain when deployed
      if (currentUrl.includes('your-production-domain.com')) {
        return `${currentUrl}/dashboard`;
      }
      
      // Supabase hosted or other environments
      return `${currentUrl}/dashboard`;
    };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl(),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        skipBrowserRedirect: false,
      },
    });

    return { error };
  };

  const signOut = async () => {
    // Remove the custom auth token
    localStorage.removeItem('authToken');
    // Sign out from Supabase
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }

    return { error };
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
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