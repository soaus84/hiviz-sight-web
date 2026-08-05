import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Drawer, IconBtn, Icon, Btn, Avatar, ListRow } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { COMMUNITIES, createPost } from '@/data/communities';
import { MarkdownEditor } from './MarkdownEditor';
import type { PostKind } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 5 };
const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13.5, outline: 'none' };

const TITLE_PLACEHOLDER: Record<PostKind, string> = {
  discussion: 'What do you want to discuss?',
  poll: 'What are you asking?',
  briefing: 'What are you announcing?',
};

// Exemplar of the three post shapes the feed already renders (see
// postKind.ts / PostCard.tsx) — picking one here is its own step so it
// doesn't compete with the fields below for attention.
const KIND_OPTIONS: { kind: PostKind; label: string; icon: string; hint: string }[] = [
  { kind: 'discussion', label: 'Discussion', icon: 'forum', hint: 'Open-ended conversation' },
  { kind: 'poll', label: 'Poll', icon: 'poll', hint: 'Ask the group to vote' },
  { kind: 'briefing', label: 'Briefing', icon: 'campaign', hint: 'One-way announcement' },
];
const KIND_META = Object.fromEntries(KIND_OPTIONS.map((k) => [k.kind, k])) as Record<PostKind, (typeof KIND_OPTIONS)[number]>;

type Step = 'type' | 'compose';

export interface NewPostDrawerProps {
  open: boolean;
  onClose: () => void;
  defaultCommunity?: string;
}

export function NewPostDrawer({ open, onClose, defaultCommunity }: NewPostDrawerProps) {
  const navigate = useNavigate();
  const { user } = useActiveUser();

  const [step, setStep] = useState<Step>('type');
  const [kind, setKind] = useState<PostKind>('discussion');
  const [community, setCommunity] = useState(defaultCommunity ?? COMMUNITIES[0].name);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  // Set instead of fired immediately, so a leave attempt with unsaved
  // content can be confirmed rather than silently discarding it.
  const [pendingLeave, setPendingLeave] = useState<'close' | 'back' | null>(null);

  // Drawer itself unmounts its children on close, but this component stays
  // mounted the whole time (it's rendered persistently by Feed/CommunityDetail) —
  // reset on every open rather than relying on an unmount that never happens.
  useEffect(() => {
    if (open) {
      setStep('type');
      setKind('discussion');
      setCommunity(defaultCommunity ?? COMMUNITIES[0].name);
      setTitle('');
      setBody('');
      setPollOptions(['', '']);
      setPendingLeave(null);
    }
  }, [open, defaultCommunity]);

  const setPollOption = (i: number) => (v: string) => setPollOptions((opts) => opts.map((o, k) => (k === i ? v : o)));
  const addPollOption = () => setPollOptions((opts) => [...opts, '']);
  const removePollOption = (i: number) => setPollOptions((opts) => opts.filter((_, k) => k !== i));

  const isDirty = !!title.trim() || !!body.trim() || pollOptions.some((o) => o.trim());
  const validPollOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
  const canPost = !!title.trim() && !!body.trim() && !!community && (kind !== 'poll' || validPollOptions.length >= 2);

  const requestClose = () => (isDirty ? setPendingLeave('close') : onClose());
  const requestBack = () => (isDirty ? setPendingLeave('back') : setStep('type'));
  const confirmLeave = () => {
    if (pendingLeave === 'close') onClose();
    else {
      setTitle('');
      setBody('');
      setPollOptions(['', '']);
      setStep('type');
    }
    setPendingLeave(null);
  };

  const post = () => {
    if (!canPost) return;
    const created = createPost({
      kind,
      community,
      author: user.name,
      role: user.role,
      title: title.trim(),
      body: body.trim(),
      pollOptions: kind === 'poll' ? validPollOptions.map((label) => ({ label, votes: 0 })) : undefined,
    });
    onClose();
    navigate(`/communities/thread/${created.id}`);
  };

  const kindMeta = KIND_META[kind];

  return (
    <Drawer open={open} onClose={requestClose}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
          {step === 'compose' ? (
            <IconBtn name="arrow_back" onClick={requestBack} />
          ) : (
            <Avatar name={user.name} size={32} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {step === 'compose' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon name={kindMeta.icon} size={16} color={colors.inkSoft} />
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>New {kindMeta.label.toLowerCase()}</div>
                </div>
                {defaultCommunity && (
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>Posting to {defaultCommunity}</div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>New post</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft }}>Posting as {user.name}</div>
              </>
            )}
          </div>
          <IconBtn name="close" onClick={requestClose} />
        </div>

        {step === 'type' && (
          <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 22px' }}>
            {KIND_OPTIONS.map((k, i) => (
              <ListRow key={k.kind} last={i === KIND_OPTIONS.length - 1} onClick={() => { setKind(k.kind); setStep('compose'); }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={k.icon} size={19} color={colors.inkSoft} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: colors.ink }}>{k.label}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, marginTop: 1 }}>{k.hint}</div>
                </div>
                <Icon name="chevron_right" size={18} color={colors.inkMuted} />
              </ListRow>
            ))}
          </div>
        )}

        {step === 'compose' && (
          <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
            {!defaultCommunity && (
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Community</label>
                <select className="a-input" value={community} onChange={(e) => setCommunity(e.target.value)} style={inputStyle}>
                  {COMMUNITIES.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>Title</label>
              <input className="a-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={TITLE_PLACEHOLDER[kind]} style={inputStyle} autoFocus />
            </div>

            <div style={{ marginBottom: kind === 'poll' ? 16 : 8 }}>
              <label style={fieldLabel}>{kind === 'briefing' ? 'Details' : 'Body'}</label>
              <MarkdownEditor value={body} onChange={setBody} rows={4} />
            </div>

            {kind === 'poll' && (
              <div style={{ marginBottom: 8 }}>
                <label style={fieldLabel}>Options</label>
                {pollOptions.map((o, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <input className="a-input" value={o} onChange={(e) => setPollOption(i)(e.target.value)} placeholder={`Option ${i + 1}`} style={{ ...inputStyle, flex: 1 }} />
                    {pollOptions.length > 2 && <IconBtn name="close" onClick={() => removePollOption(i)} />}
                  </div>
                ))}
                <Btn variant="ghost" icon="add" onClick={addPollOption}>Add option</Btn>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <div style={{ flex: 1 }} />
              <Btn variant="primary" icon="check" disabled={!canPost} onClick={post}>Post</Btn>
            </div>
          </div>
        )}

        {pendingLeave && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
            <div style={{ background: colors.panel, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-popover)', padding: 20, width: '100%', maxWidth: 300 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700, color: colors.ink }}>Discard this post?</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
                {pendingLeave === 'close' ? "You'll lose the title, body and any changes you've made." : "Going back to change the post type will clear what you've written."}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <div style={{ flex: 1 }}><Btn variant="ghost" full onClick={() => setPendingLeave(null)}>Keep editing</Btn></div>
                <div style={{ flex: 1 }}><Btn variant="danger" full onClick={confirmLeave}>Discard</Btn></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
