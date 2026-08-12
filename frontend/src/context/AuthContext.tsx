import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokenData: any) => void;
  logout: () => void;
  setCurrentOrg: (org: Organization) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(() => {
    const saved = localStorage.getItem('currentOrg');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchMe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchMe = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));

        const orgs = res.data.data.memberships.map((m: any) => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          logoUrl: m.organization.logoUrl,
          role: m.role,
        }));

        setOrganizations(orgs);
        if (orgs.length > 0 && !currentOrg) {
          setCurrentOrg(orgs[0]);
          localStorage.setItem('currentOrg', JSON.stringify(orgs[0]));
        }
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (data: any) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));

    if (data.organizations && data.organizations.length > 0) {
      setOrganizations(data.organizations);
      setCurrentOrg(data.organizations[0]);
      localStorage.setItem('currentOrg', JSON.stringify(data.organizations[0]));
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentOrg');
    setUser(null);
    setOrganizations([]);
    setCurrentOrg(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        currentOrg,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setCurrentOrg: (org) => {
          setCurrentOrg(org);
          localStorage.setItem('currentOrg', JSON.stringify(org));
        },
      }}
    >
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
