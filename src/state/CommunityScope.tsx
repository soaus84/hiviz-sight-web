import { createContext, useContext, useState, type ReactNode } from 'react';

export type CommunityScope = 'all' | 'associated';

export interface CommunityScopeValue {
  scope: CommunityScope;
  setScope: (s: CommunityScope) => void;
}

const CommunityScopeContext = createContext<CommunityScopeValue | null>(null);

export function CommunityScopeProvider({ children }: { children: ReactNode }) {
  const [scope, setScope] = useState<CommunityScope>('all');
  return <CommunityScopeContext.Provider value={{ scope, setScope }}>{children}</CommunityScopeContext.Provider>;
}

export function useCommunityScope(): CommunityScopeValue {
  const ctx = useContext(CommunityScopeContext);
  if (!ctx) throw new Error('useCommunityScope must be used within a CommunityScopeProvider');
  return ctx;
}
