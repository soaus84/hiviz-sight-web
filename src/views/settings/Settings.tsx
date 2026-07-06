import { useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PageHead, Tabs, Card, Eyebrow, Avatar } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { USERS } from '@/data/users';
import { SettingRow } from './SettingRow';
import { UsersTable } from './UsersTable';

type SettingsTab = 'account' | 'notifications' | 'access';
const VALID_TABS: SettingsTab[] = ['account', 'notifications', 'access'];

export function Settings() {
  const { user: CURRENT_USER } = useActiveUser();
  const [params, setParams] = useSearchParams();
  const breakpoint = useBreakpoint();
  const tabParam = params.get('tab');
  const tab = (VALID_TABS as string[]).includes(tabParam || '') ? (tabParam as SettingsTab) : 'account';
  const setTab = (k: string) => setParams(k === 'account' ? {} : { tab: k });
  const accountCols = breakpoint === 'desktop' ? '1fr 1fr' : '1fr';

  return (
    <div>
      <PageHead title="Settings" sub="Your account, notifications and the people with access to this region." />
      <Tabs value={tab} onChange={setTab} items={[{ k: 'account', label: 'Account' }, { k: 'notifications', label: 'Notifications' }, { k: 'access', label: 'Users & access', n: USERS.length }]} />

      {tab === 'account' && (
        <div style={{ display: 'grid', gridTemplateColumns: accountCols, gap: 16, maxWidth: 880 }}>
          <Card pad={20}>
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
          <Card pad={20}>
            <Eyebrow>Sync & storage</Eyebrow>
            <SettingRow label="Sync mode" value="Wi-Fi only · queues offline" toggle />
            <SettingRow label="Storage" value="2.4 GB of 5 GB used" />
            <SettingRow label="Auto-archive" value="Visits older than 90 days" toggle on last />
          </Card>
        </div>
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

      {tab === 'access' && <UsersTable />}
    </div>
  );
}
