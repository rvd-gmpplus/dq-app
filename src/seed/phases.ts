import type { Phase } from '@/types/phase';

export const seedPhases: Phase[] = [
  {
    id: 1,
    name: 'Preparation',
    status: 'Completed',
    plannedStart: '2025-10-01',
    plannedEnd: '2025-12-15',
    actualStart: '2025-10-01',
    actualEnd: '2025-12-22',
    deliverables: [
      { name: 'Project charter approved', done: true },
      { name: 'Budget approved (EUR 325k)', done: true },
      { name: 'Data Vision v1 published', done: true },
      { name: 'Stakeholder map drafted', done: true },
    ],
    blockers: [],
  },
  {
    id: 2,
    name: 'Deep Dive',
    status: 'Delayed',
    plannedStart: '2025-12-16',
    plannedEnd: '2026-03-15',
    actualStart: '2026-01-20',
    deliverables: [
      { name: 'Use case long-list (TRIMM template)', done: true },
      { name: 'Business Impact and IT scoring per use case', done: false },
      { name: 'Quadrant review with MT', done: false },
      { name: 'Top-5 Quick Wins selected', done: false },
      { name: 'CRM / certification platform direction set (Q2 2026)', done: false },
    ],
    blockers: [
      'CRM platform decision awaiting sourcing outcome',
      'SME availability during Q1 audit season',
    ],
  },
  {
    id: 3,
    name: 'Keep Core Clean',
    status: 'Not Started',
    plannedStart: '2026-03-16',
    plannedEnd: '2026-06-30',
    deliverables: [
      { name: 'Validation rules live on Business Request form', done: false },
      { name: 'Duplicate-prevention checks in CRM', done: false },
      { name: 'Permission reset and CRUD matrix for Contacts', done: false },
    ],
    blockers: [],
  },
  {
    id: 4,
    name: 'Data Entry',
    status: 'Not Started',
    plannedStart: '2026-07-01',
    plannedEnd: '2026-09-30',
    deliverables: [
      { name: 'Standardised audit checklist in Resco', done: false },
      { name: 'International address assist enabled', done: false },
    ],
    blockers: [],
  },
  {
    id: 5,
    name: 'Data Cleaning',
    status: 'Not Started',
    plannedStart: '2026-10-01',
    plannedEnd: '2026-12-31',
    deliverables: [
      { name: 'Historical orphan contacts resolved (~6,000)', done: false },
      { name: 'Inactive accounts archived', done: false },
      { name: 'Retention policy applied', done: false },
    ],
    blockers: [],
  },
];
