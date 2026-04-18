import type { UseCase } from '@/types/useCase';

const AT = '2026-04-18T09:00:00.000Z';
const BY = 'Mirella van der Kleij';

function history(action: string): UseCase['history'] {
  return [{ at: AT, by: BY, action }];
}

export const seedUseCases: UseCase[] = [
  {
    id: '40000000-0000-4000-8000-000000000001',
    code: 'UC-001',
    title: 'Standardised business request form for Certification Bodies',
    status: 'Backlog',
    pillars: ['Transparency'],
    owner: 'Mirella van der Kleij',
    submittedBy: 'Stan Hendriks',
    businessImpact: {
      score: 4.4,
      benefitSize: 4, urgency: 5, stakeholderBreadth: 5, timeToValue: 3, enablementPotential: 5,
    },
    itDataImpact: {
      score: 4.3,
      dataAvailability: 3, dataQuality: 4, integrationComplexity: 5, architecturalChange: 5,
    },
    quadrant: 'Strategic',
    problem:
      'Around 300 business requests arrive per month with a conversion rate of around 5 per cent. Unused, polluted, and duplicate company records accumulate because Certification Bodies enter data without real-time validation, address assist, or registration-number checks.',
    objective:
      'Introduce a tailored, country-aware business request form with enforced mandatory fields, real-time validation, duplicate prevention, and AI-assisted smart matching before the record is created.',
    kpis: [
      'Business-request conversion rate > 15%',
      'Duplicate accounts created per month -> 0',
      'Mandatory field completion at first submission >= 95%',
    ],
    solutionDescription:
      'Standardised and conditional data entry with structured inputs (no free text), worldwide address assist, automated formatting, API validation of chamber-of-commerce and VAT numbers, and a plugin that performs AI-based duplicate detection against existing accounts before saving.',
    scopeIn: ['All prospect and company data entry performed by Certification Bodies'],
    scopeOut: ['Historical data cleansing of existing records', 'Manual internal corrections outside the CB entry process'],
    relatedDataObjects: ['Account', 'Contact', 'crmp_acceptance'],
    relatedJiraKeys: ['GMP-3261'],
    relatedPhases: [2, 3],
    linkedAttachments: [],
    createdAt: AT,
    updatedAt: AT,
    history: history('create'),
    comments: [],
    tags: ['CB', 'data-entry', 'validation'],
  },

  {
    id: '40000000-0000-4000-8000-000000000002',
    code: 'UC-002',
    title: 'Single contact standard and orphan resolution',
    status: 'Backlog',
    pillars: ['Transparency'],
    owner: 'Mirella van der Kleij',
    submittedBy: 'Ellen van Dorssen',
    businessImpact: {
      score: 4.0,
      benefitSize: 4, urgency: 4, stakeholderBreadth: 5, timeToValue: 3, enablementPotential: 4,
    },
    itDataImpact: {
      score: 4.0,
      dataAvailability: 3, dataQuality: 5, integrationComplexity: 4, architecturalChange: 4,
    },
    quadrant: 'Strategic',
    problem:
      'Contacts enter the CRM through web forms, Academy uploads, manual entry, and APIs. Around 6,000 records are unlinked to accounts or incomplete, so the team cannot reliably reach the right people during a feed-safety incident.',
    objective:
      'Enforce a two-tier contact standard at entry, remove legacy permissions, and resolve the 6,000 orphan contacts through automated matching with manual review for ambiguous cases.',
    kpis: [
      'Orphan contacts < 100',
      'Email validation pass rate > 98%',
      'Contact-to-account link rate > 99%',
    ],
    solutionDescription:
      'Reset contact permissions and rebuild a role-based CRUD matrix tied to position and company type. Validation and enrichment engine enforces minimum viable fields at entry and tailored fields for company-linked contacts. Automated matcher resolves historical orphans, with flagged edge cases for the helpdesk.',
    scopeIn: ['Data entry and existing CRM data'],
    scopeOut: ['Manual internal corrections outside the process'],
    relatedDataObjects: ['Contact', 'Account'],
    relatedJiraKeys: ['GMP-3264'],
    relatedPhases: [3, 5],
    linkedAttachments: [],
    createdAt: AT,
    updatedAt: AT,
    history: history('create'),
    comments: [],
    tags: ['contacts', 'data-cleaning'],
  },

  {
    id: '40000000-0000-4000-8000-000000000003',
    code: 'UC-003',
    title: 'Automatic duplicate customer detection and merge',
    status: 'Backlog',
    pillars: ['Transparency'],
    owner: 'Stan Hendriks',
    submittedBy: 'Mirella van der Kleij',
    businessImpact: {
      score: 3.6,
      benefitSize: 4, urgency: 4, stakeholderBreadth: 4, timeToValue: 3, enablementPotential: 3,
    },
    itDataImpact: {
      score: 3.0,
      dataAvailability: 2, dataQuality: 4, integrationComplexity: 3, architecturalChange: 3,
    },
    quadrant: 'QuickWin',
    problem:
      'Duplicate accounts accumulate because inbound business requests are not checked against existing records. Reports and mailings reach the wrong contact or double up.',
    objective:
      'Detect candidate duplicates automatically and offer a guided merge workflow so the CRM converges on a single record per legal entity.',
    kpis: [
      'Duplicate candidates merged per month',
      'False-positive merge rate < 2%',
    ],
    solutionDescription:
      'Fuzzy-match service comparing legal name, registration number, address, and phone against Account master. Candidates surface in a CRM dashboard with a merge wizard that preserves the oldest record id and migrates activities.',
    scopeIn: ['Account master duplicates'],
    scopeOut: ['Contact-level duplicates (covered in UC-002)'],
    relatedDataObjects: ['Account'],
    relatedJiraKeys: [],
    relatedPhases: [3, 5],
    linkedAttachments: [],
    createdAt: AT,
    updatedAt: AT,
    history: history('create'),
    comments: [],
    tags: ['duplicates', 'quick-win'],
  },

  {
    id: '40000000-0000-4000-8000-000000000004',
    code: 'UC-004',
    title: 'International address assist across CRM forms',
    status: 'Backlog',
    pillars: ['Transparency'],
    owner: 'Rick van Dijk',
    submittedBy: 'Mirella van der Kleij',
    businessImpact: {
      score: 3.6,
      benefitSize: 4, urgency: 3, stakeholderBreadth: 4, timeToValue: 4, enablementPotential: 3,
    },
    itDataImpact: {
      score: 2.3,
      dataAvailability: 2, dataQuality: 2, integrationComplexity: 3, architecturalChange: 2,
    },
    quadrant: 'QuickWin',
    problem:
      'Addresses are entered as free text, so the CRM holds many variants of the same place. Postal codes, country names, and legal registration numbers are inconsistently formatted.',
    objective:
      'Add a worldwide address-assist widget to every form that captures company or contact addresses, and format the result into structured fields.',
    kpis: [
      'Percentage of addresses entered via assist >= 95%',
      'Address parse error rate < 1%',
    ],
    solutionDescription:
      'Integrate a commercial address-assist API (country-aware) into the D365 forms and the Resco audit app. Persist structured sub-fields and normalised ISO country codes.',
    scopeIn: ['Business request form', 'Contact creation form', 'Audit contact verification'],
    scopeOut: ['Historical backfill of stored addresses (handled in UC-002)'],
    relatedDataObjects: ['Account', 'Contact'],
    relatedJiraKeys: [],
    relatedPhases: [3, 4],
    linkedAttachments: [],
    createdAt: AT,
    updatedAt: AT,
    history: history('create'),
    comments: [],
    tags: ['address', 'quick-win'],
  },

  {
    id: '40000000-0000-4000-8000-000000000005',
    code: 'UC-005',
    title: 'Standardised audit report with GMP+ house style',
    status: 'Backlog',
    pillars: ['Insight'],
    owner: 'Rik Prins',
    submittedBy: 'Mirella van der Kleij',
    businessImpact: {
      score: 4.2,
      benefitSize: 5, urgency: 4, stakeholderBreadth: 5, timeToValue: 3, enablementPotential: 4,
    },
    itDataImpact: {
      score: 3.5,
      dataAvailability: 3, dataQuality: 3, integrationComplexity: 4, architecturalChange: 4,
    },
    quadrant: 'Strategic',
    problem:
      'Around 80 per cent of CBs use their own audit-report template, so GMP+ has no uniform representation in the market and cannot analyse audit output across the scheme.',
    objective:
      'Design a mandatory GMP+ audit report template that CBs must use, with room for a modest CB identifier, while producing machine-readable output.',
    kpis: [
      'CBs using the mandatory template = 100%',
      'Audit reports available for scheme analytics = 100%',
    ],
    solutionDescription:
      'Uniform report template rendered from structured audit data, with a CB-specific banner block. Published as PDF for the company and as JSON for scheme analytics.',
    scopeIn: ['Final audit report output'],
    scopeOut: ['Audit checklist design (covered in UC-006)'],
    relatedDataObjects: ['Audit', 'Resco_audit'],
    relatedJiraKeys: [],
    relatedPhases: [4, 5],
    linkedAttachments: [],
    createdAt: AT,
    updatedAt: AT,
    history: history('create'),
    comments: [],
    tags: ['audit', 'reporting'],
  },

  {
    id: '40000000-0000-4000-8000-000000000006',
    code: 'UC-006',
    title: 'Harmonised audit checklist and data capture',
    status: 'Backlog',
    pillars: ['Insight', 'Transparency'],
    owner: 'Rik Prins',
    submittedBy: 'Chao Zou',
    businessImpact: {
      score: 4.4,
      benefitSize: 5, urgency: 4, stakeholderBreadth: 4, timeToValue: 4, enablementPotential: 5,
    },
    itDataImpact: {
      score: 4.3,
      dataAvailability: 4, dataQuality: 4, integrationComplexity: 4, architecturalChange: 5,
    },
    quadrant: 'Strategic',
    problem:
      'Audit data is collected and stored but barely used. Nonconformities cannot be assigned to sub-sub paragraphs, checklists repeat questions between audits, and there is no baseline for harmonised assessment across CBs.',
    objective:
      'Offer a mandatory audit tool that collects only relevant and structured data, reuses answers from previous audits, and produces insights for scheme improvement and sector benchmarking.',
    kpis: [
      'Percentage of audits using the mandatory checklist',
      'Mean audit time reduction >= 15%',
      'Nonconformity categorisation coverage = 100%',
    ],
    solutionDescription:
      'Dynamic checklist that pre-fills from the previous audit, supports sub-paragraph NC tagging, and feeds a scheme-level dashboard on audit findings and trends.',
    scopeIn: ['Audit execution phase', 'Checklist content', 'Resco and CRM storage of structured answers'],
    scopeOut: ['Report template (UC-005)'],
    relatedDataObjects: ['Audit', 'Resco_audit', 'Helpdesk_ticket'],
    relatedJiraKeys: [],
    relatedPhases: [3, 4],
    linkedAttachments: [],
    createdAt: AT,
    updatedAt: AT,
    history: history('create'),
    comments: [],
    tags: ['audit', 'checklist'],
  },

  {
    id: '40000000-0000-4000-8000-000000000007',
    code: 'UC-007',
    title: 'Newsletter subscription cleanup and preference centre',
    status: 'Backlog',
    pillars: ['Market'],
    owner: 'Mirella van der Kleij',
    submittedBy: 'Olyn San Miguel',
    businessImpact: {
      score: 2.6,
      benefitSize: 3, urgency: 2, stakeholderBreadth: 3, timeToValue: 3, enablementPotential: 2,
    },
    itDataImpact: {
      score: 2.3,
      dataAvailability: 2, dataQuality: 3, integrationComplexity: 2, architecturalChange: 2,
    },
    quadrant: 'Filler',
    problem:
      'Newsletter subscriptions are scattered across web forms, events, and Academy registrations. Contacts receive duplicate newsletters or none at all, and the opt-in state is not always traceable.',
    objective:
      'Route all newsletter subscriptions through a single preference centre with traceable consent and granular topic opt-ins.',
    kpis: [
      'Bounce rate < 2%',
      'Opt-out complaints per month',
    ],
    solutionDescription:
      'Central preference centre that syncs to the CRM and records the consent source and timestamp. Existing subscribers receive a re-permission campaign.',
    scopeIn: ['Newsletter subscriptions originating in any channel'],
    scopeOut: ['Transactional audit communications'],
    relatedDataObjects: ['Newsletter_subscription', 'Contact'],
    relatedJiraKeys: [],
    relatedPhases: [4],
    linkedAttachments: [],
    createdAt: AT,
    updatedAt: AT,
    history: history('create'),
    comments: [],
    tags: ['marketing', 'consent'],
  },

  {
    id: '40000000-0000-4000-8000-000000000008',
    code: 'UC-008',
    title: 'Retention policy enforcement for inactive contacts',
    status: 'Backlog',
    pillars: ['Transparency'],
    owner: 'Rick van Dijk',
    submittedBy: 'Dalia Brkulic',
    businessImpact: {
      score: 2.8,
      benefitSize: 2, urgency: 3, stakeholderBreadth: 3, timeToValue: 3, enablementPotential: 3,
    },
    itDataImpact: {
      score: 4.0,
      dataAvailability: 4, dataQuality: 4, integrationComplexity: 4, architecturalChange: 4,
    },
    quadrant: 'DontPursue',
    problem:
      'Historical contacts linger in the CRM forever. A policy to delete contacts inactive for three years exists on paper but has never been applied, and the legal basis is still debated.',
    objective:
      'Apply the three-year inactivity retention policy automatically, with a legal hold register and an audit trail of deletions.',
    kpis: [
      'Inactive contacts > 3 years removed',
      'Legal holds respected = 100%',
    ],
    solutionDescription:
      'Scheduled job that flags contacts inactive for three years, notifies owners, applies a soft-delete with a 30-day grace period, and logs the outcome in an audit trail.',
    scopeIn: ['CRM Contact records'],
    scopeOut: ['Account records', 'Records flagged for legal hold'],
    relatedDataObjects: ['Contact'],
    relatedJiraKeys: [],
    relatedPhases: [5],
    linkedAttachments: [],
    createdAt: AT,
    updatedAt: AT,
    history: history('create'),
    comments: [],
    tags: ['retention', 'compliance'],
  },
];
