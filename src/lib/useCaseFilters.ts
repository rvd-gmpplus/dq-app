import type { UseCase, UseCaseStatus, Quadrant, Pillar } from '@/types/useCase';

export type UseCaseFilters = {
  pillars?: Pillar[];
  statuses?: UseCaseStatus[];
  quadrants?: Quadrant[];
  owner?: string;
  tag?: string;
  search?: string;
};

export function filterUseCases(list: UseCase[], f: UseCaseFilters): UseCase[] {
  return list.filter((uc) => {
    if (f.pillars && f.pillars.length > 0) {
      if (!f.pillars.some((p) => uc.pillars.includes(p))) return false;
    }
    if (f.statuses && f.statuses.length > 0) {
      if (!f.statuses.includes(uc.status)) return false;
    }
    if (f.quadrants && f.quadrants.length > 0) {
      if (!f.quadrants.includes(uc.quadrant)) return false;
    }
    if (f.owner && f.owner.trim() !== '') {
      if (!uc.owner.toLowerCase().includes(f.owner.toLowerCase())) return false;
    }
    if (f.tag && f.tag.trim() !== '') {
      const t = f.tag.toLowerCase();
      if (!uc.tags.some((x) => x.toLowerCase().includes(t))) return false;
    }
    if (f.search && f.search.trim() !== '') {
      const s = f.search.toLowerCase();
      const haystack = [
        uc.code,
        uc.title,
        uc.owner,
        uc.submittedBy,
        uc.problem,
        uc.objective,
        uc.solutionDescription,
        uc.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(s)) return false;
    }
    return true;
  });
}

export type UseCaseSortKey =
  | 'code'
  | 'title'
  | 'owner'
  | 'businessImpact'
  | 'itDataImpact'
  | 'quadrant'
  | 'status'
  | 'updatedAt';

export type SortDir = 'asc' | 'desc';

export function sortUseCases(list: UseCase[], key: UseCaseSortKey, dir: SortDir): UseCase[] {
  const mul = dir === 'asc' ? 1 : -1;
  const valueOf = (uc: UseCase): number | string => {
    switch (key) {
      case 'businessImpact':
        return uc.businessImpact.score;
      case 'itDataImpact':
        return uc.itDataImpact.score;
      default:
        return uc[key] as string;
    }
  };
  return [...list].sort((a, b) => {
    const va = valueOf(a);
    const vb = valueOf(b);
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * mul;
    return String(va).localeCompare(String(vb)) * mul;
  });
}
