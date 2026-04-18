import { create } from 'zustand';
import { z } from 'zod';
import { createPersistedSlice } from '@/lib/persistence';
import {
  PillarMetadataSchema,
  type PillarMetadata,
} from '@/types/pillarMetadata';
import type { Pillar } from '@/types/useCase';

type State = {
  items: PillarMetadata[];
  schemaVersion: number;
};

const SliceSchema = z.object({
  items: z.array(PillarMetadataSchema),
  schemaVersion: z.number().int(),
});

const slice = createPersistedSlice<State>({
  key: 'dq:pillars',
  initial: { items: [], schemaVersion: 1 },
  schema: SliceSchema,
  currentVersion: 1,
});

type Actions = {
  list: () => PillarMetadata[];
  get: (pillar: Pillar) => PillarMetadata | undefined;
  setAmbition: (pillar: Pillar, ambition: string) => void;
  replaceAll: (items: PillarMetadata[]) => void;
  reset: () => void;
};

export const usePillarStore = create<State & Actions>((set, get) => {
  slice.subscribe((s) => set(s));

  const commit = (mutator: (s: State) => State) => {
    const next = mutator(get());
    slice.write(next);
    set(next);
  };

  return {
    ...slice.read(),

    list: () => [...get().items].sort((a, b) => a.priority - b.priority),
    get: (pillar) => get().items.find((p) => p.pillar === pillar),

    setAmbition: (pillar, ambition) =>
      commit((s) => ({
        ...s,
        items: s.items.map((p) => (p.pillar === pillar ? { ...p, ambition } : p)),
      })),

    replaceAll: (items) => commit((s) => ({ ...s, items })),
    reset: () => commit(() => ({ items: [], schemaVersion: 1 })),
  };
});
