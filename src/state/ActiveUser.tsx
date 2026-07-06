import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { SWITCHABLE_USERS } from '@/data/currentUser';
import type { CurrentUser } from '@/types';

export interface ActiveUserValue {
  user: CurrentUser;
  users: CurrentUser[];
  setUser: (u: CurrentUser) => void;
}

const ActiveUserContext = createContext<ActiveUserValue | null>(null);

export function ActiveUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(SWITCHABLE_USERS[0]);

  const value = useMemo<ActiveUserValue>(() => ({
    user,
    users: SWITCHABLE_USERS,
    setUser,
  }), [user]);

  return <ActiveUserContext.Provider value={value}>{children}</ActiveUserContext.Provider>;
}

export function useActiveUser(): ActiveUserValue {
  const ctx = useContext(ActiveUserContext);
  if (!ctx) throw new Error('useActiveUser must be used within an ActiveUserProvider');
  return ctx;
}
