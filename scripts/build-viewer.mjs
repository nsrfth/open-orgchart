// SPDX-License-Identifier: Apache-2.0
// Builds the viewer into packages/server/public: the page, its script and styles, and the example organisation
// (made by the service itself, from an empty database in memory - the same answers it would give).
import { build } from 'esbuild';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Asker } from '../packages/server/src/auth.js';
import { Chart, tree } from '../packages/server/src/chart.js';
import { Store } from '../packages/server/src/db.js';
import { demoJobDescriptions, demoRows } from '../packages/server/src/demo.js';
import { describeSeats } from '../packages/server/src/descriptions.js';
import { ensureOrganisation, importRows } from '../packages/server/src/keepers.js';
import { jobDescription, reporting } from '../packages/server/src/v1.js';

const at = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const out = at('../packages/server/public/');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

await build({
  entryPoints: [at('../demo/viewer.jsx')], outfile: `${out}viewer.js`, bundle: true, format: 'esm', minify: true, target: 'es2020', jsx: 'automatic',
  legalComments: 'none', define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'info', nodePaths: [at('../node_modules')],
});
fs.copyFileSync(at('../demo/index.html'), `${out}index.html`);

const store = new Store(':memory:');
ensureOrganisation(store);
const config = { timeZone: 'UTC' };
const keeper = new Asker('keeper', { keeper: { name: 'example' } });
importRows({ store, config, who: keeper, query: new URLSearchParams() }, demoRows());
const day = new Date().toISOString().slice(0, 10);
describeSeats(store, keeper, demoJobDescriptions(), day);
const ask = { store, config, who: keeper, query: new URLSearchParams() };
const lines = reporting(ask);
const example = {
  tree: { as_of: day, departments: tree(new Chart(store, day)) },
  reporting: lines,
  // the job descriptions in force, by seat: what `GET /api/org/v1/positions/<id>/jd` would answer
  descriptions: Object.fromEntries(lines.seats.filter((s) => s.jd).map((s) => [s.id, jobDescription(ask, s.id)])),
};
fs.writeFileSync(`${out}example.json`, JSON.stringify(example));
console.log(`viewer and example (${example.tree.departments.length} departments, ${example.reporting.people.length} people, ${Object.keys(example.descriptions).length} job descriptions) in ${out}`);
