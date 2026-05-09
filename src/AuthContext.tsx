import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type User = {
  username: string;
  role: 'ADMIN' | 'USER';
  token: string;
};

interface AuthContextType {
  user: User | null;
  login: (data: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('prolink-user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (data: User) => {
    setUser(data);
    localStorage.setItem('prolink-user', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('prolink-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
