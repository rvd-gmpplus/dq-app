import { create } from 'zustand';
import { z } from 'zod';
import { newId } from '@/lib/ids';
import { createPersistedSlice } from '@/lib/persistence';
import {
  StakeholderSchema,
  type Stakeholder,
  type StakeholderGroup,
} from '@/types/stakeholder';

type State = {
  items: Record<string, Stakeholder>;
  schemaVersion: number;
};

const SliceSchema = z.object({
  items: z.record(z.string(), StakeholderSchema),
  schemaVersion: z.number().int(),
});

const slice = createPersistedSlice<State>({
  key: 'dq:stakeholders',
  initial: { items: {}, schemaVersion: 1 },
  schema: SliceSchema,
  currentVersion: 1,
});

type CreateInput = Omit<Stakeholder, 'id'> & { id?: string };

type Actions = {
  list: () => Stakeholder[];
  getById: (id: string) => Stakeholder | undefined;
  byGroup: (group: StakeholderGroup) => Stakeholder[];
  create: (input: CreateInput) => Stakeholder;
  update: (id: string, patch: Partial<Omit<Stakeholder, 'id'>>) => void;
  remove: (id: string) => void;
  replaceAll: (items: Stakeholder[]) => void;
  reset: () => void;
};

export const useStakeholderStore = create<State & Actions>((set, get) => {
  slice.subscribe((s) => set(s));

  const commit = (mutator: (s: State) => State) => {
    const next = mutator(get());
    slice.write(next);
    set(next);
  };

  return {
    ...slice.read(),

    list: () => Object.values(get().items).sort((a, b) => a.name.localeCompare(b.name)),
    getById: (id) => get().items[id],
    byGroup: (group) => Object.values(get().items).filter((s) => s.group === group),

    create: (input) => {
      const id = input.id ?? newId();
      const sh: Stakeholder = { ...input, id };
      commit((s) => ({ ...s, items: { ...s.items, [id]: sh } }));
      return sh;
    },

    update: (id, patch) => {
      const current = get().items[id];
      if (!current) return;
      commit((s) => ({ ...s, items: { ...s.items, [id]: { ...current, ...patch } } }));
    },

    remove: (id) =>
      commit((s) => {
        const items = { ...s.items };
        delete items[id];
        return { ...s, items };
      }),

    replaceAll: (items) =>
      commit(() => ({
        items: Object.fromEntries(items.map((x) => [x.id, x])),
        schemaVersion: 1,
      })),
    reset: () => commit(() => ({ items: {}, schemaVersion: 1 })),
  };
});
