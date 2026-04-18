import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createPersistedSlice } from '@/lib/persistence';

const Schema = z.object({
  counter: z.number(),
  schemaVersion: z.number(),
});
type State = z.infer<typeof Schema>;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createPersistedSlice', () => {
  it('returns initial state when nothing is stored', () => {
    const slice = createPersistedSlice<State>({
      key: 'test:counter',
      initial: { counter: 0, schemaVersion: 1 },
      schema: Schema,
      currentVersion: 1,
    });
    expect(slice.read()).toEqual({ counter: 0, schemaVersion: 1 });
  });

  it('persists writes on flush', () => {
    const slice = createPersistedSlice<State>({
      key: 'test:counter',
      initial: { counter: 0, schemaVersion: 1 },
      schema: Schema,
      currentVersion: 1,
    });
    slice.write({ counter: 5, schemaVersion: 1 });
    slice.flush();
    const raw = localStorage.getItem('test:counter');
    expect(raw && JSON.parse(raw).counter).toBe(5);
  });

  it('recovers from an invalid payload by falling back to initial', () => {
    localStorage.setItem('test:broken', '{{not json');
    const slice = createPersistedSlice<State>({
      key: 'test:broken',
      initial: { counter: 42, schemaVersion: 1 },
      schema: Schema,
      currentVersion: 1,
    });
    expect(slice.read()).toEqual({ counter: 42, schemaVersion: 1 });
  });

  it('recovers from a payload that fails schema validation', () => {
    localStorage.setItem('test:invalid', JSON.stringify({ counter: 'nope', schemaVersion: 1 }));
    const slice = createPersistedSlice<State>({
      key: 'test:invalid',
      initial: { counter: 7, schemaVersion: 1 },
      schema: Schema,
      currentVersion: 1,
    });
    expect(slice.read()).toEqual({ counter: 7, schemaVersion: 1 });
  });

  it('runs migrations to reach the current schema version', () => {
    localStorage.setItem('test:migrate', JSON.stringify({ counter: 3, schemaVersion: 1 }));
    const migrate = vi.fn().mockImplementation((state: unknown) => ({
      counter: (state as State).counter + 100,
      schemaVersion: 2,
    }));
    const slice = createPersistedSlice<State>({
      key: 'test:migrate',
      initial: { counter: 0, schemaVersion: 2 },
      schema: Schema,
      currentVersion: 2,
      migrations: { 2: migrate },
    });
    expect(slice.read()).toEqual({ counter: 103, schemaVersion: 2 });
    expect(migrate).toHaveBeenCalledOnce();
  });

  it('debounces writes to a single flush per wait window', () => {
    vi.useFakeTimers();
    const slice = createPersistedSlice<State>({
      key: 'test:debounce',
      initial: { counter: 0, schemaVersion: 1 },
      schema: Schema,
      currentVersion: 1,
      debounceMs: 500,
    });
    slice.write({ counter: 1, schemaVersion: 1 });
    slice.write({ counter: 2, schemaVersion: 1 });
    slice.write({ counter: 3, schemaVersion: 1 });
    expect(localStorage.getItem('test:debounce')).toBeNull();
    vi.advanceTimersByTime(500);
    expect(JSON.parse(localStorage.getItem('test:debounce')!).counter).toBe(3);
  });

  it('notifies subscribers synchronously on write', () => {
    const slice = createPersistedSlice<State>({
      key: 'test:sub',
      initial: { counter: 0, schemaVersion: 1 },
      schema: Schema,
      currentVersion: 1,
    });
    const listener = vi.fn();
    slice.subscribe(listener);
    slice.write({ counter: 9, schemaVersion: 1 });
    expect(listener).toHaveBeenCalledWith({ counter: 9, schemaVersion: 1 });
  });
});
