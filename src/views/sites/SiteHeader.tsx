import { useNavigate } from 'react-router-dom';
import { PageHead, Btn } from '@/components';
import type { Site } from '@/types';

export function SiteHeader({ s }: { s: Site }) {
  const navigate = useNavigate();
  return (
    <PageHead
      title={s.name}
      sub={`${s.region} · ${s.type} · ${s.crewSize} crew`}
      actions={<><Btn variant="ghost" icon="tune">Configure</Btn><Btn variant="accent" icon="add" onClick={() => navigate(`/visits/new?site=${s.id}`)}>Plan a visit</Btn></>}
    />
  );
}
