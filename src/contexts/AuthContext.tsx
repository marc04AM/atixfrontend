import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserType } from '@/types';
import { usersApi } from '@/lib/api';
import { getUserIdFromToken } from '@/lib/auth';

interface AuthUser {
  id?: string;
  profileImageUrl?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  type?: UserType;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isOwner: () => boolean;
  canManageUsers: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;

    const userId = user?.id ?? getUserIdFromToken(token);
    if (!userId) return;

    if (!user?.id || user.id !== userId) {
      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        const nextUser = { ...currentUser, id: userId };
        localStorage.setItem('authUser', JSON.stringify(nextUser));
        return nextUser;
      });
    }

    if (user?.profileImageUrl && user?.type) return;

    let cancelled = false;

    const hydrateUser = async () => {
      try {
        const freshUser = await usersApi.getById(userId);
        if (cancelled || !freshUser) return;

        setUser((currentUser) => {
          const nextUser = {
            id: freshUser.id ?? currentUser?.id ?? userId,
            email: freshUser.email ?? currentUser?.email ?? '',
            firstName: freshUser.firstName ?? currentUser?.firstName ?? '',
            lastName: freshUser.lastName ?? currentUser?.lastName ?? '',
            role: (freshUser.role ?? currentUser?.role ?? 'USER') as UserRole,
            type: freshUser.type ?? currentUser?.type,
            profileImageUrl: freshUser.profileImageUrl ?? currentUser?.profileImageUrl,
          };
          localStorage.setItem('authUser', JSON.stringify(nextUser));
          return nextUser;
        });
      } catch {
        // Ignore hydration errors.
      }
    };

    hydrateUser();

    return () => {
      cancelled = true;
    };
  }, [token, user?.id, user?.profileImageUrl]);

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const nextUser = { ...currentUser, ...updates };
      localStorage.setItem('authUser', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isOwner = () => user?.role === 'OWNER';
  const canManageUsers = () => isAdmin() || isOwner();

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        updateUser,
        logout,
        isAdmin,
        isOwner,
        canManageUsers,
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
