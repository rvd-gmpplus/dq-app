import { create } from 'zustand';
import { z } from 'zod';
import { nowIso } from '@/lib/dates';
import { buildDiffs } from '@/lib/diffs';
import { newId, nextUseCaseCode } from '@/lib/ids';
import { createPersistedSlice } from '@/lib/persistence';
import { recomputeUseCaseScores } from '@/lib/scoring';
import { useSettingsStore } from '@/stores/settingsStore';
import { UseCaseSchema, type UseCase, type UseCaseStatus } from '@/types/useCase';

type CreateInput = {
  title: string;
  pillars: UseCase['pillars'];
  owner: string;
  submittedBy: string;
  businessImpact?: Omit<UseCase['businessImpact'], 'score' | 'notes'>;
  itDataImpact?: Omit<UseCase['itDataImpact'], 'score' | 'notes'>;
};

type State = {
  items: Record<string, UseCase>;
  schemaVersion: number;
};

const SliceSchema = z.object({
  items: z.record(z.string(), UseCaseSchema),
  schemaVersion: z.number().int(),
});

const slice = createPersistedSlice<State>({
  key: 'dq:use-cases',
  initial: { items: {}, schemaVersion: 1 },
  schema: SliceSchema,
  currentVersion: 1,
});

type Actions = {
  list: () => UseCase[];
  getById: (id: string) => UseCase | undefined;
  create: (input: CreateInput) => UseCase;
  update: (id: string, patch: Partial<UseCase>, actorOverride?: string) => void;
  updateScores: (id: string, scores: {
    businessImpact: Omit<UseCase['businessImpact'], 'score' | 'notes'>;
    itDataImpact: Omit<UseCase['itDataImpact'], 'score' | 'notes'>;
  }) => void;
  addComment: (id: string, text: string) => void;
  bulkUpdateStatus: (ids: string[], status: UseCaseStatus) => void;
  remove: (id: string) => void;
  reset: () => void;
  replaceAll: (items: UseCase[]) => void;
};

const actor = () => useSettingsStore.getState().currentUser;
const weights = () => useSettingsStore.getState().scoringWeights;

export const useUseCaseStore = create<State & Actions>((set, get) => {
  slice.subscribe((s) => set(s));

  const commit = (mutator: (s: State) => State) => {
    const next = mutator(get());
    slice.write(next);
    set(next);
  };

  return {
    ...slice.read(),

    list: () => Object.values(get().items).sort((a, b) => a.code.localeCompare(b.code)),
    getById: (id) => get().items[id],

    create: (input) => {
      const id = newId();
      const now = nowIso();
      const existing = Object.values(get().items).map((u) => u.code);
      const code = nextUseCaseCode(existing);
      const scored = Boolean(input.businessImpact && input.itDataImpact);
      const base: UseCase = {
        id,
        code,
        title: input.title,
        status: scored ? 'Backlog' : 'Idea',
        pillars: input.pillars,
        owner: input.owner,
        submittedBy: input.submittedBy,
        businessImpact: {
          score: 0,
          benefitSize: 1,
          urgency: 1,
          stakeholderBreadth: 1,
          timeToValue: 1,
          enablementPotential: 1,
          ...input.businessImpact,
        },
        itDataImpact: {
          score: 0,
          dataAvailability: 1,
          dataQuality: 1,
          integrationComplexity: 1,
          architecturalChange: 1,
          ...input.itDataImpact,
        },
        quadrant: 'Filler',
        problem: '',
        objective: '',
        kpis: [],
        solutionDescription: '',
        scopeIn: [],
        scopeOut: [],
        relatedDataObjects: [],
        relatedJiraKeys: [],
        relatedPhases: [],
        linkedAttachments: [],
        createdAt: now,
        updatedAt: now,
        history: [{ at: now, by: actor(), action: 'create' }],
        comments: [],
        tags: [],
      };
      const final = recomputeUseCaseScores(base, weights());
      commit((s) => ({ ...s, items: { ...s.items, [id]: final } }));
      return final;
    },

    update: (id, patch, actorOverride) => {
      const current = get().items[id];
      if (!current) return;
      const merged: UseCase = { ...current, ...patch, updatedAt: nowIso() };
      const next = recomputeUseCaseScores(merged, weights());
      const diffs = buildDiffs(
        { ...current, history: undefined, updatedAt: undefined },
        { ...next, history: undefined, updatedAt: undefined },
      );
      if (diffs.length === 0) return;
      next.history = [
        ...current.history,
        { at: nowIso(), by: actorOverride ?? actor(), action: 'update', diffs },
      ];
      commit((s) => ({ ...s, items: { ...s.items, [id]: next } }));
    },

    updateScores: (id, scores) => {
      const current = get().items[id];
      if (!current) return;
      const merged: UseCase = {
        ...current,
        businessImpact: { ...current.businessImpact, ...scores.businessImpact },
        itDataImpact: { ...current.itDataImpact, ...scores.itDataImpact },
        updatedAt: nowIso(),
      };
      const next = recomputeUseCaseScores(merged, weights());
      const diffs = buildDiffs(
        {
          businessImpact: current.businessImpact,
          itDataImpact: current.itDataImpact,
          quadrant: current.quadrant,
        },
        {
          businessImpact: next.businessImpact,
          itDataImpact: next.itDataImpact,
          quadrant: next.quadrant,
        },
      );
      next.history = [
        ...current.history,
        { at: nowIso(), by: actor(), action: 'score', diffs },
      ];
      commit((s) => ({ ...s, items: { ...s.items, [id]: next } }));
    },

    addComment: (id, text) => {
      const current = get().items[id];
      if (!current) return;
      const comment = { id: newId(), at: nowIso(), by: actor(), text };
      const next: UseCase = {
        ...current,
        comments: [...current.comments, comment],
        updatedAt: nowIso(),
      };
      commit((s) => ({ ...s, items: { ...s.items, [id]: next } }));
    },

    bulkUpdateStatus: (ids, status) => {
      commit((s) => {
        const items = { ...s.items };
        const now = nowIso();
        const author = actor();
        for (const id of ids) {
          const uc = items[id];
          if (!uc || uc.status === status) continue;
          items[id] = {
            ...uc,
            status,
            updatedAt: now,
            history: [
              ...uc.history,
              {
                at: now,
                by: author,
                action: `status:${status}`,
                diffs: [{ field: 'status', before: uc.status, after: status }],
              },
            ],
          };
        }
        return { ...s, items };
      });
    },

    remove: (id) => {
      commit((s) => {
        const items = { ...s.items };
        delete items[id];
        return { ...s, items };
      });
    },

    reset: () => {
      commit(() => ({ items: {}, schemaVersion: 1 }));
    },

    replaceAll: (items) => {
      commit(() => ({
        items: Object.fromEntries(items.map((u) => [u.id, u])),
        schemaVersion: 1,
      }));
    },
  };
});
