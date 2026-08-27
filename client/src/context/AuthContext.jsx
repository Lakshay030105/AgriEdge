import { createContext, useContext, useState, useEffect } from 'react';
import { authenticateFarmer, registerFarmer, db } from '../db/db';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [farmer, setFarmer] = useState(() => {
    try {
      const saved = localStorage.getItem('agriedge_active_farmer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (farmer) {
      localStorage.setItem('agriedge_active_farmer', JSON.stringify(farmer));
    } else {
      localStorage.removeItem('agriedge_active_farmer');
    }
  }, [farmer]);

  const login = async (phone, pin) => {
    const user = await authenticateFarmer(phone, pin);
    setFarmer(user);
    setIsAuthModalOpen(false);
    return user;
  };

  const signup = async ({ name, phone, village, pin }) => {
    const user = await registerFarmer({ name, phone, village, pin });
    setFarmer(user);
    setIsAuthModalOpen(false);
    return user;
  };

  const logout = () => {
    setFarmer(null);
  };

  // 1-Click Quick Demo Login for Hackathon Judges
  const quickDemoLogin = async () => {
    let demoUser = await db.users.where('phone').equals('9876543210').first();
    if (!demoUser) {
      demoUser = await registerFarmer({
        name: 'Ramesh Patel (डेमो किसान)',
        phone: '9876543210',
        village: 'Nashik (महाराष्ट्र)',
        pin: '1234'
      });
    }
    setFarmer(demoUser);
    setIsAuthModalOpen(false);
    return demoUser;
  };

  return (
    <AuthContext.Provider value={{
      farmer,
      isAuthenticated: !!farmer,
      login,
      signup,
      logout,
      quickDemoLogin,
      isAuthModalOpen,
      setIsAuthModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
