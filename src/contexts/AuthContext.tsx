
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authenticateUser, createUser, getUserById } from '@/lib/database';
import { Tables } from '@/integrations/supabase/types';

// Define types
type User = Tables<'tbuser'>;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('wordWiseUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Verify the user still exists in DB
        getUserById(parsedUser.userid).then(dbUser => {
          if (dbUser) {
            setUser(dbUser);
          } else {
            // User no longer exists in DB, clear localStorage
            localStorage.removeItem('wordWiseUser');
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('wordWiseUser');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const user = await authenticateUser(username, password);
      if (user) {
        setUser(user);
        localStorage.setItem('wordWiseUser', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const newUser = await createUser(username, email, password);
      if (newUser) {
        setUser(newUser);
        localStorage.setItem('wordWiseUser', JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wordWiseUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
