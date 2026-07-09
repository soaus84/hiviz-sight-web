import { useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Tabs, Card, Eyebrow, Avatar } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { SettingRow } from './SettingRow';

type SettingsTab = 'account' | 'notifications';
const VALID_TABS: SettingsTab[] = ['account', 'notifications'];

// Users & access moved to Admin -> Users (see views/admin/AdminUsers.tsx) —
// managing the org roster belongs with the rest of org administration, not
// mixed in with one person's own account settings.
export function Settings() {
  const { user: CURRENT_USER } = useActiveUser();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab = (VALID_TABS as string[]).includes(tabParam || '') ? (tabParam as SettingsTab) : 'account';
  const setTab = (k: string) => setParams(k === 'account' ? {} : { tab: k });

  return (
    <div>
      <PageHead title="Account" sub="Your account and notification preferences." />
      <Tabs value={tab} onChange={setTab} items={[{ k: 'account', label: 'Account' }, { k: 'notifications', label: 'Notifications' }]} />

      {tab === 'account' && (
        <Card pad={20} style={{ maxWidth: 560 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={CURRENT_USER.name} size={56} tone={colors.hi} />
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 700 }}>{CURRENT_USER.name}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, marginTop: 2, fontWeight: 500 }}>
                {[CURRENT_USER.role, CURRENT_USER.region, CURRENT_USER.division].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <SettingRow label="Email" value={CURRENT_USER.email} />
            <SettingRow label="Role" value={CURRENT_USER.role} />
            <SettingRow label="Identity" value="Verified" valueTone={colors.green} last />
          </div>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card pad={20} style={{ maxWidth: 560 }}>
          <Eyebrow>What you’re notified about</Eyebrow>
          <SettingRow label="Insights needing support" value="Email + in-app" toggle on />
          <SettingRow label="Visit reminders" value="In-app" toggle on />
          <SettingRow label="Overdue actions" value="Email + in-app" toggle on />
          <SettingRow label="Community replies" value="In-app" toggle on />
          <SettingRow label="Weekly region digest" value="Email · Monday 07:00" toggle last />
        </Card>
      )}
    </div>
  );
}
