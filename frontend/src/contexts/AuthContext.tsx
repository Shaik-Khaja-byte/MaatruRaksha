import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, ASHA } from '../lib/api';

interface AuthContextType {
  asha: ASHA | null;
  login: (ashaId: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [asha, setAsha] = useState<ASHA | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAsha = localStorage.getItem('asha');
    const token = localStorage.getItem('access_token');
    
    if (storedAsha && token) {
      try {
        setAsha(JSON.parse(storedAsha));
        // Verify token is still valid
        authAPI.getCurrentUser().catch(() => {
          // Token invalid, clear storage
          authAPI.logout();
          setAsha(null);
        });
      } catch {
        authAPI.logout();
        setAsha(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (ashaId: string, password: string): Promise<boolean> => {
    try {
      const data = await authAPI.login(ashaId, password);
      setAsha(data.asha);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    authAPI.logout();
    setAsha(null);
  };

  return (
    <AuthContext.Provider value={{ asha, login, logout, loading }}>
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
