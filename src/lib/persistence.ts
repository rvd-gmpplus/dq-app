import type { ZodType } from 'zod';
import { toast } from './toast';

export type Migration<T> = (prev: unknown) => T;

export type PersistedSliceConfig<T> = {
  key: string;
  initial: T;
  schema: ZodType<T>;
  currentVersion: number;
  migrations?: Record<number, Migration<T>>;
  debounceMs?: number;
};

export type PersistedSlice<T> = {
  read: () => T;
  write: (next: T) => void;
  flush: () => void;
  subscribe: (listener: (value: T) => void) => () => void;
};

export function createPersistedSlice<T extends { schemaVersion: number }>(
  config: PersistedSliceConfig<T>,
): PersistedSlice<T> {
  const {
    key,
    initial,
    schema,
    currentVersion,
    migrations = {},
    debounceMs = 500,
  } = config;

  const load = (): T => {
    const raw = localStorage.getItem(key);
    if (!raw) return initial;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return initial;
    }
    if (!isVersioned(parsed)) return initial;
    let state: unknown = parsed;
    let version = parsed.schemaVersion;
    while (version < currentVersion) {
      const nextVersion = version + 1;
      const migrate = migrations[nextVersion];
      if (!migrate) return initial;
      state = migrate(state);
      version = nextVersion;
    }
    const validated = schema.safeParse(state);
    if (!validated.success) return initial;
    return validated.data;
  };

  let cached: T = load();
  const listeners = new Set<(value: T) => void>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  let reportedWriteError = false;
  const persist = () => {
    try {
      localStorage.setItem(key, JSON.stringify(cached));
      reportedWriteError = false;
    } catch (err) {
      // Only surface the first write error per session; repeat failures
      // would otherwise stack toasts on every keystroke.
      if (!reportedWriteError) {
        reportedWriteError = true;
        const message =
          err instanceof DOMException && err.name === 'QuotaExceededError'
            ? 'Browser storage is full. Export a JSON backup, then reset old data from Settings.'
            : `Failed to save changes to "${key}". Export a JSON backup now to avoid data loss.`;
        toast.error(message);
      }
    }
  };

  return {
    read: () => cached,
    write(next) {
      cached = next;
      listeners.forEach((l) => l(cached));
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        persist();
      }, debounceMs);
    },
    flush() {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      persist();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function isVersioned(value: unknown): value is { schemaVersion: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'schemaVersion' in value &&
    typeof (value as { schemaVersion: unknown }).schemaVersion === 'number'
  );
}
