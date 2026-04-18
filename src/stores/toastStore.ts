import { create } from 'zustand';
import { newId } from '@/lib/ids';

export type ToastTone = 'info' | 'success' | 'error';

export type Toast = {
  id: string;
  tone: ToastTone;
  text: string;
  createdAt: number;
};

type State = {
  toasts: Toast[];
  push: (tone: ToastTone, text: string) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

export const useToastStore = create<State>((set, get) => ({
  toasts: [],
  push: (tone, text) => {
    const id = newId();
    const toast: Toast = { id, tone, text, createdAt: Date.now() };
    set({ toasts: [...get().toasts, toast] });
    return id;
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  clear: () => set({ toasts: [] }),
}));
