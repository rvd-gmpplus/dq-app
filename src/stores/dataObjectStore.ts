import { create } from 'zustand';
import { z } from 'zod';
import { newId } from '@/lib/ids';
import { createPersistedSlice } from '@/lib/persistence';
import { DataObjectSchema, type DataObject } from '@/types/dataObject';

type State = {
  items: Record<string, DataObject>;
  schemaVersion: number;
};

const SliceSchema = z.object({
  items: z.record(z.string(), DataObjectSchema),
  schemaVersion: z.number().int(),
});

const slice = createPersistedSlice<State>({
  key: 'dq:data-objects',
  initial: { items: {}, schemaVersion: 1 },
  schema: SliceSchema,
  currentVersion: 1,
});

type CreateInput = Omit<DataObject, 'id'> & { id?: string };

type Actions = {
  list: () => DataObject[];
  getById: (id: string) => DataObject | undefined;
  getByName: (name: string) => DataObject | undefined;
  create: (input: CreateInput) => DataObject;
  update: (id: string, patch: Partial<Omit<DataObject, 'id'>>) => void;
  remove: (id: string) => void;
  replaceAll: (items: DataObject[]) => void;
  reset: () => void;
};

export const useDataObjectStore = create<State & Actions>((set, get) => {
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
    getByName: (name) => Object.values(get().items).find((d) => d.name === name),

    create: (input) => {
      const id = input.id ?? newId();
      const obj: DataObject = { ...input, id };
      commit((s) => ({ ...s, items: { ...s.items, [id]: obj } }));
      return obj;
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
