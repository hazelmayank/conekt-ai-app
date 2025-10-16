import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CampaignRefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const CampaignRefreshContext = createContext<CampaignRefreshContextType | undefined>(undefined);

interface CampaignRefreshProviderProps {
  children: ReactNode;
}

export const CampaignRefreshProvider: React.FC<CampaignRefreshProviderProps> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <CampaignRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </CampaignRefreshContext.Provider>
  );
};

export const useCampaignRefresh = () => {
  const context = useContext(CampaignRefreshContext);
  if (context === undefined) {
    throw new Error('useCampaignRefresh must be used within a CampaignRefreshProvider');
  }
  return context;
};


