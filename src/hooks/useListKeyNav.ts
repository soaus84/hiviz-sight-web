import { useEffect } from 'react';

/** Arrow Up/Down (and Left/Right, for a horizontal or board-style list) move
 * the current selection to the previous/next item in whatever order the
 * list is already in — no separate "focus" concept, the current selection
 * literally is the keyboard focus. Ignored while the user is typing
 * anywhere (input/textarea/select/contenteditable), so it never hijacks a
 * note field mid-sentence. One hook, reused across every list+detail page
 * in the app (split-pane or table+drawer alike) rather than each page
 * re-implementing its own key handling — see the pages that call this for
 * the one-line wiring.
 *
 * `enabled` lets a page suspend this while something else owns arrow keys
 * (e.g. a nested drawer open on top of the list). Pass false rather than
 * conditionally calling the hook — hooks can't be called conditionally.
 *
 * `onActivate` is only for lists (like Focus) where moving the selection
 * and acting on it are two separate steps — Enter/Space "opens" whatever's
 * currently highlighted. Every list+detail page leaves this unset, since
 * for them onSelect already IS the open action (the detail pane/drawer
 * updates the moment selection moves) — passing both would just fire the
 * open twice. */
export function useListKeyNav<T extends { id: string }>(list: T[], selId: string | null | undefined, onSelect: (id: string) => void, enabled = true, onActivate?: (id: string) => void): void {
  useEffect(() => {
    if (!enabled || list.length === 0) return;

    function handleKeyDown(e: KeyboardEvent) {
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || active?.isContentEditable) return;

      if ((e.key === 'Enter' || e.key === ' ') && onActivate && selId) {
        e.preventDefault();
        onActivate(selId);
        return;
      }
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
      const idx = list.findIndex((item) => item.id === selId);
      const nextIdx = idx === -1 ? 0 : forward ? Math.min(idx + 1, list.length - 1) : Math.max(idx - 1, 0);
      const next = list[nextIdx];
      if (next && next.id !== selId) {
        e.preventDefault();
        onSelect(next.id);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [list, selId, enabled, onSelect, onActivate]);
}
