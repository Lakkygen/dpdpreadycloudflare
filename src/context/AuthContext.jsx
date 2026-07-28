import { createContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';
import api from '../services/api';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[AUTH] VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('[AUTH] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET (len=' + supabaseAnonKey?.length + ')' : 'MISSING');

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.error('[AUTH] Supabase client is NULL — check env vars!');
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      if (response && response.plan) {
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  const buildUser = useCallback(async (supabaseSession) => {
    if (!supabaseSession) {
      setUser(null);
      setSession(null);
      return;
    }

    const supabaseUser = supabaseSession.user;
    localStorage.setItem('authToken', supabaseSession.access_token);

    const profile = await fetchProfile();
    const mergedUser = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      emailConfirmed: supabaseUser.email_confirmed_at != null,
      plan: profile?.plan || 'free',
      scanLimit: profile?.scanLimit || 10,
      scansUsed: profile?.scansUsed || 0,
      subscription: profile?.subscription || null,
    };

    setUser(mergedUser);
    setSession(supabaseSession);
  }, [fetchProfile]);

  useEffect(() => {
    if (!supabase) {
      setAuthError('Supabase not configured — check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      setLoading(false);
      return;
    }

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        buildUser(newSession);
      }
    );

    return () => subscription.unsubscribe();
  }, [buildUser]);

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Authentication is not configured. Please contact support.');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      await buildUser(data.session);
      toast.success(`Welcome back, ${email}`);
    } catch (err) {
      console.error('[SIGNIN ERROR]', err);
      throw err;
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    if (!supabase) throw new Error('Authentication is not configured. Please contact support.');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;

      if (data.session) {
        await buildUser(data.session);
        toast.success('Account created – welcome!');
      } else {
        toast.success('Check your email to confirm your account.');
      }
    } catch (err) {
      console.error('[SIGNUP ERROR]', err);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) throw new Error('Authentication is not configured.');
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem('authToken');
    setUser(null);
    setSession(null);
    toast.info('Signed out');
  };

  const refreshPlan = async () => {
    if (!user) return;
    const profile = await fetchProfile();
    if (profile) {
      setUser((prev) => ({
        ...prev,
        plan: profile.plan || prev.plan,
        scanLimit: profile.scanLimit || prev.scanLimit,
        scansUsed: profile.scansUsed || prev.scansUsed,
        subscription: profile.subscription || prev.subscription,
      }));
    }
  };

  const value = {
    user,
    session,
    loading,
    authError,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshPlan,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
