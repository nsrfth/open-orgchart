// SPDX-License-Identifier: Apache-2.0
/**
 * A seat's job description, opened from its card: a panel at the chart's side, read section by section, in the
 * order a job description is read. Its text is the organisation's own words - written here as text, never as
 * markup - where a list is lines beginning with "- " (or "* ", "• ") or "1. ", and an empty line ends a paragraph.
 * Escape, or the close button, puts it away and gives the keys back to what had them.
 */
import React from 'react';
import { JD_SECTIONS } from '../core/model.js';
import { useWords } from './context.js';
import { Close, File, Spinner } from './icons.jsx';

export const SECTION_WORDS = {
  purpose: 'Purpose of the role', responsibilities: 'Key responsibilities', authority: 'Authority and scope', requirements: 'Requirements',
  competencies: 'Competencies', relationships: 'Working relationships', measures: 'How success is measured', conditions: 'Working conditions',
};

const BULLET = /^\s*[-*•]\s+/;
const NUMBER = /^\s*\d+[.)]\s+/;

/** A section's text as blocks: `{kind: 'p' | 'ul' | 'ol', lines}`. */
export function blocksOf(text) {
  const out = [];
  let at = null;
  for (const raw of String(text || '').replace(/\r\n?/g, '\n').split('\n')) {
    if (!raw.trim()) { at = null; continue; }
    const kind = BULLET.test(raw) ? 'ul' : NUMBER.test(raw) ? 'ol' : 'p';
    const line = kind === 'ul' ? raw.replace(BULLET, '') : kind === 'ol' ? raw.replace(NUMBER, '') : raw.trim();
    if (!at || at.kind !== kind) { at = { kind, lines: [] }; out.push(at); }
    at.lines.push(line.trim());
  }
  return out;
}

function Blocks({ text }) {
  return blocksOf(text).map((b, i) => {
    if (b.kind === 'p') return <p key={i} dir="auto">{b.lines.flatMap((l, k) => (k ? [<br key={k} />, l] : [l]))}</p>;
    const List = b.kind;
    return <List key={i} dir="auto">{b.lines.map((l, k) => <li key={k}>{l}</li>)}</List>;
  });
}

/** A day as the reader writes it (a Persian reader in their own calendar); the day as given when it cannot be. */
function dayText(day, language) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(day || ''))) return String(day || '');
  try {
    return new Date(`${day}T00:00:00Z`).toLocaleDateString(language || 'en', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return day; }
}

/**
 * open = {node, state: 'loading' | 'ready' | 'error', jd}: `jd` as `GET /api/org/v1/positions/<id>/jd` answers it
 * ({position, version, valid_from, approved_by, sections}).
 */
export default function JobDescription({ open, onClose }) {
  const { t, language, num } = useWords();
  const closer = React.useRef(null);
  React.useEffect(() => {
    const had = typeof document !== 'undefined' ? document.activeElement : null;
    closer.current?.focus();
    return () => { if (had && had.isConnected && typeof had.focus === 'function') had.focus(); };
  }, []);
  const { node, state, jd } = open;
  const title = (jd && jd.position && jd.position.title) || node.title;
  const path = jd && jd.position && jd.position.department && Array.isArray(jd.position.department.path) ? jd.position.department.path.join(' / ') : node.place;
  const sections = (jd && jd.sections) || {};
  const shown = JD_SECTIONS.filter((k) => String(sections[k] || '').trim());
  return (
    <aside data-chart-tool className="ooc-panel ooc-drawer" role="dialog" aria-labelledby="ooc-jd-title" data-testid="org-chart-jd"
           onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}>
      <div className="ooc-drawer-head">
        <div className="ooc-drawer-what"><File size={14} />{t('Job description')}</div>
        <button ref={closer} type="button" className="ooc-icon" onClick={onClose} aria-label={t('Close')} title={t('Close')} data-testid="org-chart-jd-close"><Close size={16} /></button>
      </div>
      <h2 id="ooc-jd-title" className="ooc-drawer-title" dir="auto">{title}</h2>
      {path && <div className="ooc-hint" dir="auto">{path}</div>}
      {state === 'loading' && <div className="ooc-drawer-note"><Spinner />{t('Reading the job description…')}</div>}
      {state === 'error' && <div className="ooc-drawer-note" role="alert">{t('The job description could not be read.')}</div>}
      {state === 'ready' && jd && (
        <>
          <div className="ooc-hint ooc-gap-top" data-testid="org-chart-jd-version">
            {t('Version {n}, since {day}', { n: num(jd.version), day: dayText(jd.valid_from, language) })}
            {jd.approved_by ? <> · <span dir="auto">{t('Approved by {who}', { who: jd.approved_by })}</span></> : null}
          </div>
          {shown.map((k) => (
            <section key={k} className="ooc-drawer-section" data-testid={`org-chart-jd-${k}`}>
              <h3 className="ooc-label">{t(SECTION_WORDS[k])}</h3>
              <Blocks text={sections[k]} />
            </section>
          ))}
          {!shown.length && <div className="ooc-drawer-note">{t('This position has no job description.')}</div>}
        </>
      )}
    </aside>
  );
}
