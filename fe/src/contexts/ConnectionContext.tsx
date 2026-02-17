import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { wooCommerceAPI } from '../services/api';
import { useDemoMode } from './DemoContext';

interface ConnectionContextType {
  isConnected: boolean;
  isChecking: boolean;          // true pendant le ping initial
  checkConnection: () => Promise<void>;
  setConnected: (value: boolean) => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) throw new Error('useConnection must be used within ConnectionProvider');
  return context;
};

export const ConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking]   = useState(true);  // démarre à true → spinner au launch
  const { isDemoMode } = useDemoMode();

  const checkConnection = async () => {
    // En demo mode, pas besoin de pinger le backend
    if (isDemoMode) {
      setIsConnected(false);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    try {
      const res = await wooCommerceAPI.getStoreInfo();
      setIsConnected(res.success === true);
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Ping au lancement
  useEffect(() => {
    checkConnection();
  }, [isDemoMode]);

  const setConnected = (value: boolean) => {
    setIsConnected(value);
    setIsChecking(false);
  };

  return (
    <ConnectionContext.Provider value={{ isConnected, isChecking, checkConnection, setConnected }}>
      {children}
    </ConnectionContext.Provider>
  );
};
