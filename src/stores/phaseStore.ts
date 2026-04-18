import { create } from 'zustand';
import { z } from 'zod';
import { createPersistedSlice } from '@/lib/persistence';
import { PhaseSchema, type Phase, type PhaseStatus } from '@/types/phase';

type State = {
  items: Phase[];
  schemaVersion: number;
};

const SliceSchema = z.object({
  items: z.array(PhaseSchema),
  schemaVersion: z.number().int(),
});

const slice = createPersistedSlice<State>({
  key: 'dq:phases',
  initial: { items: [], schemaVersion: 1 },
  schema: SliceSchema,
  currentVersion: 1,
});

type Actions = {
  list: () => Phase[];
  getById: (id: number) => Phase | undefined;
  setStatus: (id: number, status: PhaseStatus) => void;
  toggleDeliverable: (id: number, name: string) => void;
  update: (id: number, patch: Partial<Phase>) => void;
  replaceAll: (items: Phase[]) => void;
  reset: () => void;
};

export const usePhaseStore = create<State & Actions>((set, get) => {
  slice.subscribe((s) => set(s));

  const commit = (mutator: (s: State) => State) => {
    const next = mutator(get());
    slice.write(next);
    set(next);
  };

  return {
    ...slice.read(),

    list: () => [...get().items].sort((a, b) => a.id - b.id),
    getById: (id) => get().items.find((p) => p.id === id),

    setStatus: (id, status) =>
      commit((s) => ({
        ...s,
        items: s.items.map((p) => (p.id === id ? { ...p, status } : p)),
      })),

    toggleDeliverable: (id, name) =>
      commit((s) => ({
        ...s,
        items: s.items.map((p) =>
          p.id === id
            ? {
                ...p,
                deliverables: p.deliverables.map((d) =>
                  d.name === name ? { ...d, done: !d.done } : d,
                ),
              }
            : p,
        ),
      })),

    update: (id, patch) =>
      commit((s) => ({
        ...s,
        items: s.items.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      })),

    replaceAll: (items) => commit((s) => ({ ...s, items })),
    reset: () => commit(() => ({ items: [], schemaVersion: 1 })),
  };
});
