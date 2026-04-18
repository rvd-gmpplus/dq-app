import { create } from 'zustand';
import { z } from 'zod';
import { newId } from '@/lib/ids';
import { createPersistedSlice } from '@/lib/persistence';
import {
  RaciAssignmentSchema,
  type RaciAssignment,
} from '@/types/raciAssignment';
import type { RaciLetter } from '@/types/stakeholder';

type State = {
  items: Record<string, RaciAssignment>;
  schemaVersion: number;
};

const SliceSchema = z.object({
  items: z.record(z.string(), RaciAssignmentSchema),
  schemaVersion: z.number().int(),
});

const slice = createPersistedSlice<State>({
  key: 'dq:raci',
  initial: { items: {}, schemaVersion: 1 },
  schema: SliceSchema,
  currentVersion: 1,
});

type Actions = {
  list: () => RaciAssignment[];
  getCell: (stakeholderId: string, dataObjectId: string) => RaciAssignment | undefined;
  setCell: (
    stakeholderId: string,
    dataObjectId: string,
    designation: RaciLetter | null,
  ) => void;
  replaceAll: (items: RaciAssignment[]) => void;
  reset: () => void;
};

export const useRaciStore = create<State & Actions>((set, get) => {
  slice.subscribe((s) => set(s));

  const commit = (mutator: (s: State) => State) => {
    const next = mutator(get());
    slice.write(next);
    set(next);
  };

  return {
    ...slice.read(),

    list: () => Object.values(get().items),

    getCell: (stakeholderId, dataObjectId) =>
      Object.values(get().items).find(
        (a) => a.stakeholderId === stakeholderId && a.dataObjectId === dataObjectId,
      ),

    setCell: (stakeholderId, dataObjectId, designation) => {
      const current = Object.values(get().items).find(
        (a) => a.stakeholderId === stakeholderId && a.dataObjectId === dataObjectId,
      );
      if (designation === null) {
        if (!current) return;
        commit((s) => {
          const items = { ...s.items };
          delete items[current.id];
          return { ...s, items };
        });
        return;
      }
      if (current) {
        commit((s) => ({
          ...s,
          items: { ...s.items, [current.id]: { ...current, designation } },
        }));
        return;
      }
      const id = newId();
      commit((s) => ({
        ...s,
        items: { ...s.items, [id]: { id, stakeholderId, dataObjectId, designation } },
      }));
    },

    replaceAll: (items) =>
      commit(() => ({
        items: Object.fromEntries(items.map((x) => [x.id, x])),
        schemaVersion: 1,
      })),
    reset: () => commit(() => ({ items: {}, schemaVersion: 1 })),
  };
});
