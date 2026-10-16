// SPDX-License-Identifier: Apache-2.0
/**
 * An example organisation to try the service with: a made-up company of twenty people. Everything here is
 * invented; any likeness to a real organisation or person is chance.
 */
import { NAME_SEP } from './chart.js';

const P = (name, email) => ({ name, email: `${email}@example.com` });

export const DEMO_PEOPLE = {
  ceo: P('Maya Lindqvist', 'maya'), cfo: P('Daniel Okafor', 'daniel'), cto: P('Sara Ahmadi', 'sara'), coo: P('Lucas Moreau', 'lucas'),
  hr: P('Aiko Tanaka', 'aiko'), lead: P('Omid Rahimi', 'omid'), dev1: P('Elena Petrova', 'elena'), dev2: P('Tom Becker', 'tom'),
  dev3: P('Priya Nair', 'priya'), data: P('Jonas Berg', 'jonas'), ops1: P('Fatima Zahra', 'fatima'), ops2: P('Leo Rossi', 'leo'),
  acc1: P('Hana Kim', 'hana'), acc2: P('Noah Silva', 'noah'), rep1: P('Chloé Martin', 'chloe'), rep2: P('Reza Karimi', 'reza'),
  rep3: P('Ines Duarte', 'ines'), design: P('Kai Müller', 'kai'), people2: P('Zara Hussain', 'zara'), sup: P('Yusuf Demir', 'yusuf'),
};

const D = (...names) => ['Example Co.', ...names].join(NAME_SEP);

/** The rows of the example, in the columns the import reads. */
export function demoRows() {
  const p = DEMO_PEOPLE;
  const row = (department, position, who, more = {}) => ({ department, position, email: who ? who.email : '', name: who ? who.name : '', valid_from: '2024-01-01', ...more });
  return [
    row(D(), 'Chief executive', p.ceo, { is_head: 'yes', code: 'CEO-1' }),
    row(D('Finance'), 'Chief financial officer', p.cfo, { is_head: 'yes', code: 'FIN-1' }),
    row(D('Finance'), 'Accountant', p.acc1, { code: 'FIN-2' }),
    row(D('Finance'), 'Accountant', p.acc2, { code: 'FIN-2' }),
    row(D('Technology'), 'Chief technology officer', p.cto, { is_head: 'yes', code: 'TEC-1' }),
    row(D('Technology', 'Platform'), 'Platform lead', p.lead, { is_head: 'yes', code: 'TEC-10' }),
    row(D('Technology', 'Platform'), 'Software engineer', p.dev1, { code: 'TEC-11' }),
    row(D('Technology', 'Platform'), 'Software engineer', p.dev2, { code: 'TEC-11' }),
    row(D('Technology', 'Platform'), 'Software engineer', p.dev3, { code: 'TEC-11' }),
    row(D('Technology', 'Data'), 'Head of data', null, { is_head: 'yes', code: 'TEC-20' }),
    row(D('Technology', 'Data'), 'Data analyst', p.data, { code: 'TEC-21' }),
    row(D('Technology', 'Design'), 'Product designer', p.design, { code: 'TEC-31' }),
    row(D('Operations'), 'Chief operating officer', p.coo, { is_head: 'yes', code: 'OPS-1' }),
    row(D('Operations', 'Sales'), 'Head of sales', null, { is_head: 'yes', code: 'OPS-10' }),
    row(D('Operations', 'Sales'), 'Account executive', p.rep1, { code: 'OPS-11' }),
    row(D('Operations', 'Sales'), 'Account executive', p.rep2, { code: 'OPS-11' }),
    row(D('Operations', 'Sales'), 'Account executive', p.rep3, { code: 'OPS-11' }),
    row(D('Operations', 'Support'), 'Support lead', p.ops1, { is_head: 'yes', code: 'OPS-20' }),
    row(D('Operations', 'Support'), 'Support specialist', p.ops2, { code: 'OPS-21' }),
    row(D('Operations', 'Support'), 'Support specialist', p.sup, { code: 'OPS-21' }),
    row(D('People'), 'Head of people', p.hr, { is_head: 'yes', code: 'PPL-1' }),
    row(D('People'), 'People partner', p.people2, { code: 'PPL-2' }),
  ];
}

/** Job descriptions of some of the example's seats; the chief technology officer's in two versions. */
export function demoJobDescriptions() {
  return [
    { department: D(), position: 'Chief executive', valid_from: '2024-01-01', approved_by: 'The board',
      sections: {
        purpose: 'Leads the company towards its goals: sets its direction, builds the team that gets it there, and answers to the board for the results.',
        responsibilities: '- Set the company\'s strategy and yearly plan, and see them through\n- Lead the executive team and hold it to account\n- Keep the board informed, and bring it the decisions that are its own\n- Represent the company to customers, investors and the public',
        authority: '- Hires and dismisses the executive team, with the board\'s agreement\n- Approves spending up to the limit the board sets',
        requirements: '- Ten years or more of leading a business or a large part of one\n- A record of growing a company through change',
        measures: '1. Revenue and profit against the plan\n2. Customer and employee satisfaction\n3. The executive team\'s own results',
      } },
    { department: D('Technology'), position: 'Chief technology officer', valid_from: '2024-01-01', approved_by: 'Maya Lindqvist',
      sections: {
        purpose: 'Owns the technology the company runs on and sells, and the teams that build it.',
        responsibilities: '- Set the technical direction and keep the platform reliable\n- Lead the platform, data and design teams\n- Plan and keep to the technology budget',
        requirements: '- Eight years or more in software, four of them leading teams\n- Experience running systems that customers depend on',
      } },
    { department: D('Technology'), position: 'Chief technology officer', valid_from: '2026-01-01', approved_by: 'Maya Lindqvist', note: 'Security and data protection added',
      sections: {
        responsibilities: '- Set the technical direction and keep the platform reliable\n- Lead the platform, data and design teams\n- Plan and keep to the technology budget\n- Own information security and the protection of customers\' data',
        relationships: 'Works with the chief financial officer on the budget, and with Operations on what customers need. Outside: the main technology suppliers, and auditors.',
      } },
    { department: D('Technology', 'Platform'), position: 'Software engineer', valid_from: '2024-01-01', approved_by: 'Sara Ahmadi',
      sections: {
        purpose: 'Builds and runs the platform the company\'s products stand on.',
        responsibilities: '- Design, write, test and ship features with the rest of the team\n- Review colleagues\' work, and have one\'s own reviewed\n- Take part in the on-call rota, and fix what breaks\n- Keep the documentation true',
        requirements: '- Three years or more of building web services\n- JavaScript or TypeScript, SQL, and the habit of writing tests\n- Preferred: experience with cloud infrastructure',
        competencies: '- Clear writing\n- Ownership: sees work through to the customer\n- Asks for help early',
        measures: '- Work delivered as planned, with few defects\n- Reliability of the services one owns',
        conditions: 'Hybrid: two days a week in the office. A week of on-call about once in six weeks.',
      } },
    { department: D('Operations', 'Sales'), position: 'Account executive', valid_from: '2024-01-01', approved_by: 'Lucas Moreau',
      sections: {
        purpose: 'Wins new customers and grows what existing ones buy.',
        responsibilities: '- Find and qualify new prospects\n- Run sales conversations from the first call to the signed contract\n- Keep the customer records up to date',
        requirements: '- Two years or more of business-to-business sales\n- Fluent English; a second language is a plus',
        measures: '1. New revenue against the quarterly target\n2. Pipeline built\n3. Accuracy of the forecast',
        conditions: 'Travel to customers about one week a month.',
      } },
  ];
}
