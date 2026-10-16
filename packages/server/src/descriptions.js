// SPDX-License-Identifier: Apache-2.0
/**
 * A SEAT'S JOB DESCRIPTION: why it exists, what it does, and what it asks of whoever holds it.
 *
 * It belongs to the seat, never to the person in it, so it outlives everyone who holds the seat. It is kept version
 * by version, each from a day, and never changed in place: a new version is written over the last, and a section it
 * does not mention is carried on from it. On any day the version in force is the latest that had begun by then, so
 * the chart of a day long gone tells the job descriptions of that day.
 *
 * What the chart already says - the title, the code, the department, who the seat answers to and who answers to
 * it - is the chart's, and is never written into a job description, where it would go stale. What is better kept
 * as a field (a grade, a location, a pay band) is one of the organisation's own fields of the position.
 *
 *   sections    purpose, responsibilities, authority, requirements, competencies, relationships, measures,
 *               conditions: plain text, where a list is lines beginning with "- " or "1. "
 */
import { NAME_SEP, chartOf } from './chart.js';
import { OrgError, dayOf, newId, now, parsed, text } from './util.js';

export const SECTIONS = ['purpose', 'responsibilities', 'authority', 'requirements', 'competencies', 'relationships', 'measures', 'conditions'];
const MOST = 10000;

/** A version, as the people who keep the organisation see it. */
export function versionOut(j) {
  return { id: j.id, position: j.position_id, version: j.version, valid_from: j.valid_from, sections: parsed(j.sections, {}),
    approved_by: j.approved_by, note: j.note, created_by: j.created_by, created_at: j.created_at };
}

/** The version of a seat's job description in force on a day: the latest that had begun. */
export function inForce(store, seatId, day) {
  return store.get('SELECT * FROM job_descriptions WHERE position_id = ? AND valid_from <= ? ORDER BY version DESC LIMIT 1', seatId, day) || null;
}

export const versionsOf = (store, seatId) => store.all('SELECT * FROM job_descriptions WHERE position_id = ? ORDER BY version DESC', seatId).map(versionOut);

/** The sections given, over the ones before: a section given empty is taken out. -> the sections, in their order. */
function cleanSections(raw, before) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new OrgError('A job description is its sections: {"purpose": "...", ...}', 'invalid');
  const out = { ...before };
  for (const [key, value] of Object.entries(raw)) {
    if (!SECTIONS.includes(key)) throw new OrgError(`A job description has no section "${String(key).slice(0, 40)}": its sections are ${SECTIONS.join(', ')}`, 'invalid');
    const said = value === null || value === undefined ? '' : String(value).replace(/\r\n?/g, '\n').trim();
    if (said.length > MOST) throw new OrgError(`A section of a job description is at most ${MOST} characters`, 'invalid');
    if (said) out[key] = said; else delete out[key];
  }
  if (!Object.keys(out).length) throw new OrgError('A job description says something: at least one of its sections', 'invalid');
  return Object.fromEntries(SECTIONS.filter((k) => k in out).map((k) => [k, out[k]]));
}

/**
 * A new version of a seat's job description, over the last one: from `valid_from` (today when not given), which is
 * never before the day the last version began. Who approved it is said of each version on its own.
 */
export function writeVersion(store, who, seat, raw, day) {
  const r = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const last = store.get('SELECT * FROM job_descriptions WHERE position_id = ? ORDER BY version DESC LIMIT 1', seat.id);
  const sections = cleanSections(r.sections, last ? parsed(last.sections, {}) : {});
  const validFrom = dayOf(r.valid_from, day, 'valid_from');
  if (last && validFrom < last.valid_from) throw new OrgError(`A new version begins on or after the day the last one began (${last.valid_from})`, 'invalid');
  const values = { version: last ? last.version + 1 : 1, valid_from: validFrom, sections, approved_by: text(r.approved_by, 255), note: text(r.note, 500) };
  const id = newId();
  store.tx(() => {
    store.run(`INSERT INTO job_descriptions (id, position_id, version, valid_from, sections, approved_by, note, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, seat.id, values.version, values.valid_from, JSON.stringify(sections), values.approved_by, values.note, who.label, now());
    store.record(who.label, 'create', 'job_description', id, `${seat.title} v${values.version}`, null, { position: seat.id, ...values });
  });
  return versionOut(store.get('SELECT * FROM job_descriptions WHERE id = ?', id));
}

/**
 * Job descriptions for seats named by their department's path and their title (`Example Co. / Technology`,
 * `Chief technology officer`): all of them, or - a seat not found - none of them. -> how many seats were described.
 */
export function describeSeats(store, who, rows, day) {
  const c = chartOf(store, day);
  const byPath = new Map([...c.depts.values()].map((d) => [c.path(d.id).map((x) => x.name).join(NAME_SEP).toLowerCase(), d.id]));
  store.tx(() => {
    for (const r of rows) {
      const deptId = byPath.get(String(r.department || '').toLowerCase());
      const title = String(r.position || '').toLowerCase();
      const seat = deptId ? [...c.seats.values()].find((s) => s.department_id === deptId && s.title.toLowerCase() === title) : null;
      if (!seat) throw new OrgError(`There is no seat "${r.position}" in ${r.department}`, 'not_found');
      writeVersion(store, who, seat, r, day);
    }
  });
  return new Set(rows.map((r) => `${String(r.department).toLowerCase()}\u0000${String(r.position).toLowerCase()}`)).size;
}
