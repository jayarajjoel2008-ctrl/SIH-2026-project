import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { getAppPath } from '@/lib/appPath';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      await checkUserAuth();
      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('App state check error:', error);
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.error('User auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      
      if (error?.status === 401 || error?.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  };

  const loginWithRole = async (email, password, role = "user") => {
    const loggedInUser = await base44.auth.loginViaEmailPassword(email, password, role);
    setUser(loggedInUser);
    setIsAuthenticated(true);
    return loggedInUser;
  };

  const loginGuest = async () => {
    const guestUser = await base44.auth.loginAsGuest();
    setUser(guestUser);
    setIsAuthenticated(true);
    return guestUser;
  };

  const logout = (redirectUrl = "/") => {
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout(redirectUrl);
  };

  const navigateToLogin = () => {
    window.location.href = getAppPath("/");
  };

  const isAdmin = Boolean(isAuthenticated && user?.role && String(user.role).toLowerCase() === "admin");
  const isUser = Boolean(isAuthenticated && !isAdmin);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth, 
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      isAdmin,
      isUser,
      loginWithRole,
      loginGuest,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
