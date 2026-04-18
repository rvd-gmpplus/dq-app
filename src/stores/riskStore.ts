import { create } from 'zustand';
import { z } from 'zod';
import { newId } from '@/lib/ids';
import { createPersistedSlice } from '@/lib/persistence';
import { RiskSchema, type Risk, type RiskStatus } from '@/types/risk';

type State = {
  items: Record<string, Risk>;
  schemaVersion: number;
};

const SliceSchema = z.object({
  items: z.record(z.string(), RiskSchema),
  schemaVersion: z.number().int(),
});

const slice = createPersistedSlice<State>({
  key: 'dq:risks',
  initial: { items: {}, schemaVersion: 1 },
  schema: SliceSchema,
  currentVersion: 1,
});

type CreateInput = Omit<Risk, 'id' | 'score'> & { id?: string };

type Actions = {
  list: () => Risk[];
  getById: (id: string) => Risk | undefined;
  create: (input: CreateInput) => Risk;
  update: (id: string, patch: Partial<Omit<Risk, 'id' | 'score'>>) => void;
  setStatus: (id: string, status: RiskStatus) => void;
  remove: (id: string) => void;
  replaceAll: (items: Risk[]) => void;
  reset: () => void;
};

function withScore(r: Omit<Risk, 'score'>): Risk {
  return { ...r, score: r.likelihood * r.impact };
}

export const useRiskStore = create<State & Actions>((set, get) => {
  slice.subscribe((s) => set(s));

  const commit = (mutator: (s: State) => State) => {
    const next = mutator(get());
    slice.write(next);
    set(next);
  };

  return {
    ...slice.read(),

    list: () => Object.values(get().items).sort((a, b) => b.score - a.score),
    getById: (id) => get().items[id],

    create: (input) => {
      const id = input.id ?? newId();
      const risk = withScore({ ...input, id });
      commit((s) => ({ ...s, items: { ...s.items, [id]: risk } }));
      return risk;
    },

    update: (id, patch) => {
      const current = get().items[id];
      if (!current) return;
      const next = withScore({ ...current, ...patch });
      commit((s) => ({ ...s, items: { ...s.items, [id]: next } }));
    },

    setStatus: (id, status) => {
      const current = get().items[id];
      if (!current) return;
      commit((s) => ({ ...s, items: { ...s.items, [id]: { ...current, status } } }));
    },

    remove: (id) => {
      commit((s) => {
        const items = { ...s.items };
        delete items[id];
        return { ...s, items };
      });
    },

    replaceAll: (items) =>
      commit(() => ({
        items: Object.fromEntries(items.map((r) => [r.id, r])),
        schemaVersion: 1,
      })),
    reset: () => commit(() => ({ items: {}, schemaVersion: 1 })),
  };
});
