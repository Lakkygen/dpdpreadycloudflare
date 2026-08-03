const buildUser = useCallback(async (supabaseSession) => {
  if (!supabaseSession) {
    setUser(null);
    setSession(null);
    return;
  }

  const supabaseUser = supabaseSession.user;
  localStorage.setItem('authToken', supabaseSession.access_token);

  // 🔑 CRITICAL: Sync Supabase user into your backend DB
  try {
    await api.post('/auth/sync', {
      full_name: supabaseUser.user_metadata?.full_name,
    });
  } catch (err) {
    console.warn('[AUTH] Backend sync failed (non-critical):', err.message);
  }

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
