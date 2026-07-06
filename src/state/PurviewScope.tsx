import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useActiveUser } from './ActiveUser';
import { REGIONS, COMPANY, type RegionName, type ScopeName } from '@/data/regions';
import { DIVISIONS, ALL_DIVISIONS, type DivisionName, type DivisionScope } from '@/data/divisions';

function isRegionName(v: string): v is RegionName {
  return (REGIONS as readonly string[]).includes(v);
}
function isDivisionName(v: string): v is DivisionName {
  return (DIVISIONS as readonly string[]).includes(v);
}

function homeRegionOf(region: string | undefined): ScopeName {
  return region && isRegionName(region) ? region : COMPANY;
}
function homeDivisionOf(division: string | undefined): DivisionScope {
  return division && isDivisionName(division) ? division : ALL_DIVISIONS;
}

export interface PurviewScopeValue {
  region: ScopeName;
  division: DivisionScope;
  homeRegion: ScopeName;
  homeDivision: DivisionScope;
  isHome: boolean;
  isAllRegions: boolean;
  isAllDivisions: boolean;
  isCompany: boolean;
  setRegion: (r: ScopeName) => void;
  setDivision: (d: DivisionScope) => void;
  setCompany: () => void;
  goHome: () => void;
}

const PurviewScopeContext = createContext<PurviewScopeValue | null>(null);

export function PurviewScopeProvider({ children }: { children: ReactNode }) {
  const { user } = useActiveUser();
  const homeRegion = homeRegionOf(user.region);
  const homeDivision = homeDivisionOf(user.division);

  const [region, setRegion] = useState<ScopeName>(homeRegion);
  const [division, setDivision] = useState<DivisionScope>(homeDivision);

  // Switching who you're viewing as should land you on THEIR home purview,
  // not carry over whatever you'd manually browsed to as the last person.
  useEffect(() => {
    setRegion(homeRegionOf(user.region));
    setDivision(homeDivisionOf(user.division));
  }, [user]);

  const value = useMemo<PurviewScopeValue>(() => ({
    region,
    division,
    homeRegion,
    homeDivision,
    isHome: region === homeRegion && division === homeDivision,
    isAllRegions: region === COMPANY,
    isAllDivisions: division === ALL_DIVISIONS,
    isCompany: region === COMPANY && division === ALL_DIVISIONS,
    setRegion,
    setDivision,
    setCompany: () => { setRegion(COMPANY); setDivision(ALL_DIVISIONS); },
    goHome: () => { setRegion(homeRegion); setDivision(homeDivision); },
  }), [region, division, homeRegion, homeDivision]);

  return <PurviewScopeContext.Provider value={value}>{children}</PurviewScopeContext.Provider>;
}

export function usePurviewScope(): PurviewScopeValue {
  const ctx = useContext(PurviewScopeContext);
  if (!ctx) throw new Error('usePurviewScope must be used within a PurviewScopeProvider');
  return ctx;
}
