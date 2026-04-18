import type { Risk } from '@/types/risk';

export const seedRisks: Risk[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    title: 'Adoption by CBs and auditors stalls',
    likelihood: 4,
    impact: 5,
    score: 20,
    mitigation:
      'Co-design validation rules with two pilot CBs; embed changes in the Resco app rather than asking for manual discipline.',
    owner: 'Mirella van der Kleij',
    status: 'Open',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    title: 'Ownership and authority for master data undefined',
    likelihood: 3,
    impact: 5,
    score: 15,
    mitigation:
      'Approve Data Governance Group charter before April 2026; assign pillar owners and publish the RACI matrix.',
    owner: 'Martin van den Bedum',
    status: 'Monitoring',
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    title: 'Fragmentation across D365, Resco, Portal, and Platform',
    likelihood: 4,
    impact: 4,
    score: 16,
    mitigation:
      'Lock the medallion architecture to be CRM-independent; treat Portal and Platform as distinct surfaces in every design discussion.',
    owner: 'Rick van Dijk',
    status: 'Open',
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    title: 'CB dependency on legacy templates and workflows',
    likelihood: 3,
    impact: 3,
    score: 9,
    mitigation:
      'Phase-in mandatory standardised audit report with a 6-month transition period; pair CBs with helpdesk support.',
    owner: 'Rik Prins',
    status: 'Open',
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    title: 'Momentum loss during CRM decision window',
    likelihood: 3,
    impact: 4,
    score: 12,
    mitigation:
      'Keep Quick Wins running in parallel to the platform decision so value accrues regardless of the outcome.',
    owner: 'Mirella van der Kleij',
    status: 'Monitoring',
  },
];
