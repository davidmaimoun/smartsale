import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  toggleDemoMode: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemoMode = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemoMode must be used within DemoProvider');
  return context;
};

// Variable globale lue par le Proxy dans apiClient.ts
let _isDemoMode: boolean = new URLSearchParams(window.location.search).get('demo') === 'true';
export const getDemoModeValue = () => _isDemoMode;

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(
    () => new URLSearchParams(window.location.search).get('demo') === 'true'
  );

  // Sync URL seulement
  useEffect(() => {
    const url = new URL(window.location.href);
    isDemoMode
      ? url.searchParams.set('demo', 'true')
      : url.searchParams.delete('demo');
    window.history.replaceState({}, '', url.toString());
  }, [isDemoMode]);

  // ✅ Sync _isDemoMode IMMÉDIATEMENT avant React re-render
  // → quand fetchMetrics() appelle le Proxy, il a déjà la bonne valeur
  const setDemoMode = (value: boolean) => {
    _isDemoMode = value;
    setIsDemoMode(value);
  };

  const toggleDemoMode = () => {
    const next = !isDemoMode;
    _isDemoMode = next;   // ← sync avant setIsDemoMode
    setIsDemoMode(next);
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, setDemoMode, toggleDemoMode }}>
      {children}
    </DemoContext.Provider>
  );
};