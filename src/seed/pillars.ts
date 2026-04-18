import type { PillarMetadata } from '@/types/pillarMetadata';

export const seedPillars: PillarMetadata[] = [
  {
    pillar: 'Transparency',
    priority: 1,
    displayName: 'Transparency in the Chain',
    ambition:
      'Deliver reliable, traceable insight into certified companies, certification bodies, and the feed supply chain, so every participant trusts the data that travels with a certificate.',
    ogsmTargets: [
      { label: 'Data accuracy', targetValue: '>= 90%', year: 2028 },
    ],
    legacyMapping: 'Consolidates the earlier Traceability and Transparency domains from the December 2025 Data Vision.',
    keyDataObjectIds: ['Account', 'Contact', 'crmp_acceptance', 'cnm_membership'],
  },
  {
    pillar: 'Insight',
    priority: 2,
    displayName: 'Insight-Driven Decision-Making',
    ambition:
      'Give MT, Certification Bodies, and SMEs one trusted set of figures for strategic steering, operational dashboards, and predictive analytics.',
    ogsmTargets: [
      { label: 'CB usability score', targetValue: '> 4 / 5', year: 2028 },
    ],
    legacyMapping: 'Replaces the earlier Business Intelligence and Steering pillar.',
    keyDataObjectIds: ['Audit', 'Resco_audit', 'Helpdesk_ticket'],
  },
  {
    pillar: 'Market',
    priority: 3,
    displayName: 'Market Development',
    ambition:
      'Drive growth, reduce churn, and strengthen partnerships with country and segment insight grounded in trustworthy certified data.',
    ogsmTargets: [
      { label: 'Automated data capture', targetValue: '33%', year: 2028 },
    ],
    legacyMapping: 'Replaces the earlier Enablement for market and partnerships pillar.',
    keyDataObjectIds: ['Newsletter_subscription', 'Academy_registration'],
  },
];
