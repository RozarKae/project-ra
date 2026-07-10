import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isMock: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isMock = !isFirebaseConfigured;

  useEffect(() => {
    if (!isMock && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Mock Authentication Mode: retrieve session from localStorage
      const mockSession = localStorage.getItem('ra_mock_user');
      if (mockSession) {
        try {
          setUser(JSON.parse(mockSession));
        } catch {
          localStorage.removeItem('ra_mock_user');
        }
      }
      setLoading(false);
    }
  }, [isMock]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    if (!isMock && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        setLoading(false);
        throw err;
      }
    } else {
      // Mock Auth logic
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // Simple rule: any valid email format and password longer than 5 chars works
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(email) && password.length >= 6) {
            const mockUser: AuthUser = {
              uid: 'mock-admin-uid-12345',
              email: email,
              displayName: email.split('@')[0].toUpperCase(),
            };
            localStorage.setItem('ra_mock_user', JSON.stringify(mockUser));
            setUser(mockUser);
            setLoading(false);
            resolve();
          } else {
            setLoading(false);
            reject(new Error('Invalid email or password. Password must be at least 6 characters.'));
          }
        }, 1000);
      });
    }
  };

  const logout = async () => {
    setLoading(true);
    if (!isMock && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        setLoading(false);
        throw err;
      }
    } else {
      localStorage.removeItem('ra_mock_user');
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isMock }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
