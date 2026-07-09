import { useParams, useNavigate } from 'react-router-dom';
import { PageHead, Btn, LinkBtn } from '@/components';
import { VISITS } from '@/data/visits';
import { SITE_ID_BY_NAME } from '@/data/sites';
import { VisitDetailBody } from './VisitDetailBody';

export function VisitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const v = VISITS.find((x) => x.id === id) ?? VISITS[0];

  return (
    <div>
      <LinkBtn icon="arrow_back" size="md" onClick={() => navigate('/visits')} style={{ marginBottom: 16 }}>All visits</LinkBtn>
      <PageHead
        title={v.siteName}
        sub={`${v.region} · ${v.visitor} · ${v.when}`}
        actions={<>
          {v.state === 'upcoming' && <Btn variant="ghost" icon="edit" onClick={() => navigate(`/visits/${v.id}/edit`)}>Edit visit</Btn>}
          <Btn variant="ghost" icon="location_on" onClick={() => navigate(`/sites/${SITE_ID_BY_NAME[v.siteName]}`)}>View site</Btn>
        </>}
      />
      <VisitDetailBody v={v} />
    </div>
  );
}
