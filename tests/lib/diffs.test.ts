import { describe, expect, it } from 'vitest';
import { buildDiffs } from '@/lib/diffs';

describe('buildDiffs', () => {
  it('emits one entry per changed primitive field', () => {
    const diffs = buildDiffs(
      { title: 'old', status: 'Idea' },
      { title: 'new', status: 'Idea' },
    );
    expect(diffs).toEqual([{ field: 'title', before: 'old', after: 'new' }]);
  });

  it('drills into nested objects with dotted field paths', () => {
    const diffs = buildDiffs(
      { businessImpact: { benefitSize: 3, urgency: 4 } },
      { businessImpact: { benefitSize: 5, urgency: 4 } },
    );
    expect(diffs).toEqual([{ field: 'businessImpact.benefitSize', before: 3, after: 5 }]);
  });

  it('treats arrays as opaque values and emits a single entry', () => {
    const diffs = buildDiffs(
      { pillars: ['Transparency'] },
      { pillars: ['Transparency', 'Insight'] },
    );
    expect(diffs).toEqual([
      { field: 'pillars', before: ['Transparency'], after: ['Transparency', 'Insight'] },
    ]);
  });

  it('returns empty when objects are equivalent', () => {
    expect(buildDiffs({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toEqual([]);
  });

  it('captures field additions and removals', () => {
    const diffs = buildDiffs({ a: 1 }, { a: 1, b: 2 });
    expect(diffs).toEqual([{ field: 'b', before: undefined, after: 2 }]);
  });

  it('handles null and undefined boundaries', () => {
    const diffs = buildDiffs({ a: null }, { a: 5 });
    expect(diffs).toEqual([{ field: 'a', before: null, after: 5 }]);
  });
});
