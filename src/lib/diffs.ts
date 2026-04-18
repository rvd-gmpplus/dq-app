export type FieldDiff = { field: string; before: unknown; after: unknown };

export function buildDiffs(before: unknown, after: unknown, prefix = ''): FieldDiff[] {
  if (Array.isArray(before) || Array.isArray(after)) {
    return equivalent(before, after) ? [] : [{ field: prefix || '(root)', before, after }];
  }
  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const out: FieldDiff[] = [];
    for (const k of keys) {
      out.push(
        ...buildDiffs(before[k], after[k], prefix ? `${prefix}.${k}` : k),
      );
    }
    return out;
  }
  return equivalent(before, after) ? [] : [{ field: prefix || '(root)', before, after }];
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function equivalent(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
