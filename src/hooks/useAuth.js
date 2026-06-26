import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, session, loading, signIn, signUp, signOut } = context;

  // Plan helpers
  const hasProPlan = authService.hasPlan(user, 'pro');
  const hasAgencyPlan = authService.hasPlan(user, 'agency');
  const isProOrHigher = authService.isProOrHigher(user);

  // Scan limit check
  const checkCanScan = async () => {
    if (!user) return false;
    return authService.canRunScan(user);
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    hasProPlan,
    hasAgencyPlan,
    isProOrHigher,
    checkCanScan,
  };
}
