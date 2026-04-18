import { useToastStore } from '@/stores/toastStore';

/**
 * Thin toast dispatch helpers. Intentionally a free function so low-level
 * modules (persistence, exporters) can reach for them without pulling in
 * React or hooks.
 */
export const toast = {
  info: (text: string) => useToastStore.getState().push('info', text),
  success: (text: string) => useToastStore.getState().push('success', text),
  error: (text: string) => useToastStore.getState().push('error', text),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
