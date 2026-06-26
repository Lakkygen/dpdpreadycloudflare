import { createContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';
import api from '../services/api';

// ------------------------------------------------------------------
// Supabase client – created once (must match .env keys)
// ------------------------------------------------------------------
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);   // initial session recovery

  // ------------------------------------------------------------------
  // Fetch enriched user data (plan, subscription) from our backend
  // ------------------------------------------------------------------
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/users/profile');
      return data.user;
    } catch {
      return null;
    }
  }, []);

  // ------------------------------------------------------------------
  // Build user object from Supabase session + backend metadata
  // ------------------------------------------------------------------
  const buildUser = useCallback(async (supabaseSession) => {
    if (!supabaseSession) {
      setUser(null);
      setSession(null);
      return;
    }

    const supabaseUser = supabaseSession.user;
    // Store token for API calls (Supabase access_token)
    localStorage.setItem('authToken', supabaseSession.access_token);

    // Merge backend metadata
    const profile = await fetchProfile();
    const mergedUser = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      emailConfirmed: supabaseUser.email_confirmed_at != null,
      plan: profile?.plan || { name: 'free', scanLimit: 3 },
      subscription: profile?.subscription || null,
    };

    setUser(mergedUser);
    setSession(supabaseSession);
  }, [fetchProfile]);

  // ------------------------------------------------------------------
  // Restore session on mount / refresh
  // ------------------------------------------------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        await buildUser(currentSession);
      } catch (err) {
        console.error('Session recovery failed', err);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    init();

    // Listen for future auth state changes (Google OAuth, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        buildUser(newSession);
      }
    );

    return () => subscription.unsubscribe();
  }, [buildUser]);

  // ------------------------------------------------------------------
  // Sign in with email + password
  // ------------------------------------------------------------------
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await buildUser(data.session);
    toast.success(`Welcome back, ${email}`);
  };

  // ------------------------------------------------------------------
  // Sign up (free tier by default)
  // ------------------------------------------------------------------
  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,           // can pass plan preselection etc.
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;

    // If email confirmation is disabled in dev, session is immediately available
    if (data.session) {
      await buildUser(data.session);
      toast.success('Account created – welcome!');
    } else {
      toast.success('Check your email to confirm your account.');
    }
  };

  // ------------------------------------------------------------------
  // Google OAuth (one-click social login)
  // ------------------------------------------------------------------
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
    // Page will redirect – no toast needed
  };

  // ------------------------------------------------------------------
  // Sign out
  // ------------------------------------------------------------------
  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('authToken');
    setUser(null);
    setSession(null);
    toast.info('Signed out');
  };

  // ------------------------------------------------------------------
  // Refresh plan data (e.g. after Stripe webhook)
  // ------------------------------------------------------------------
  const refreshPlan = async () => {
    if (!user) return;
    const profile = await fetchProfile();
    if (profile) {
      setUser((prev) => ({
        ...prev,
        plan: profile.plan || prev.plan,
        subscription: profile.subscription || prev.subscription,
      }));
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshPlan,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
