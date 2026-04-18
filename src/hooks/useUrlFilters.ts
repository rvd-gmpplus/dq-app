import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { UseCaseFilters } from '@/lib/useCaseFilters';
import type { Pillar, UseCaseStatus, Quadrant } from '@/types/useCase';

function toList<T extends string>(raw: string | null): T[] | undefined {
  if (!raw) return undefined;
  return raw.split(',').filter(Boolean) as T[];
}

function fromList<T extends string>(list: T[] | undefined): string | null {
  if (!list || list.length === 0) return null;
  return list.join(',');
}

export function useUrlFilters(): [UseCaseFilters, (next: UseCaseFilters) => void] {
  const [params, setParams] = useSearchParams();

  const value = useMemo<UseCaseFilters>(
    () => ({
      pillars: toList<Pillar>(params.get('pillar')),
      statuses: toList<UseCaseStatus>(params.get('status')),
      quadrants: toList<Quadrant>(params.get('quadrant')),
      owner: params.get('owner') ?? undefined,
      tag: params.get('tag') ?? undefined,
      search: params.get('q') ?? undefined,
    }),
    [params],
  );

  const setValue = useCallback(
    (next: UseCaseFilters) => {
      const out = new URLSearchParams();
      const pillars = fromList(next.pillars);
      const statuses = fromList(next.statuses);
      const quadrants = fromList(next.quadrants);
      if (pillars) out.set('pillar', pillars);
      if (statuses) out.set('status', statuses);
      if (quadrants) out.set('quadrant', quadrants);
      if (next.owner) out.set('owner', next.owner);
      if (next.tag) out.set('tag', next.tag);
      if (next.search) out.set('q', next.search);
      setParams(out, { replace: true });
    },
    [setParams],
  );

  return [value, setValue];
}
