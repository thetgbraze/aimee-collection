import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

/** Normalize raw Supabase/network errors to user-friendly messages */
export const normalizeAuthError = (error) => {
  if (!error) return null;
  const msg = error.message || '';
  if (msg.includes('Invalid login credentials')) return 'Incorrect email or password. Please try again.';
  if (msg.includes('Email not confirmed')) return 'Please verify your email before signing in.';
  if (msg.includes('User already registered')) return 'An account with this email already exists. Try signing in.';
  if (msg.includes('Password should be at least')) return 'Password must be at least 8 characters long.';
  if (msg.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.';
  if (msg.includes('network') || msg.includes('fetch')) return 'Network error. Please check your connection.';
  // Return the Supabase message but strip any internal stack/URL leakage
  return msg.split('\n')[0].slice(0, 200);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from public.profiles — guards against unmounted component updates
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setProfile(data);
    } else if (error && error.code !== 'PGRST116') {
      // PGRST116 = row not found — tolerable for new users
      console.warn('[AuthContext] fetchProfile error:', error.message);
    }
    return data ?? null;
  };

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      if (isMounted) setLoading(false);
    };

    initSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          if (isMounted) setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, firstName, lastName) => {
    // Enforce 8-char minimum server-side as well as client-side
    if (!email || !password) return { data: null, error: { message: 'Email and password are required.' } };
    if (password.length < 8) return { data: null, error: { message: 'Password must be at least 8 characters long.' } };

    const redirectUrl = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://aimee-collection.vercel.app';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'user_buyer',
        },
      },
    });
    return { data, error: error ? { ...error, message: normalizeAuthError(error) } : null };
  };

  const signIn = async (email, password) => {
    if (!email || !password) return { data: null, error: { message: 'Email and password are required.' } };

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error: error ? { ...error, message: normalizeAuthError(error) } : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    if (!email) return { data: null, error: { message: 'Please enter your email address.' } };
    const redirectUrl = typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/reset-password`
      : 'https://aimee-collection.vercel.app/reset-password';
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { data, error: error ? { ...error, message: normalizeAuthError(error) } : null };
  };

  const isAdmin = profile?.role === 'admin';
  const isStoreManager = profile?.role === 'store_manager';
  const isStaff = isAdmin || isStoreManager;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      fetchProfile,
      isAdmin,
      isStoreManager,
      isStaff,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
