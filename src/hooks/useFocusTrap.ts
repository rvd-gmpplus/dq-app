import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable], [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside the returned ref while active.
 * On Escape, calls `onEscape`. On first activation, moves focus to the first
 * focusable element inside the container (unless the container already owns
 * the active element).
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>({
  active,
  onEscape,
}: {
  active: boolean;
  onEscape?: () => void;
}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const previousActive = document.activeElement as HTMLElement | null;
    const focusable = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
      );

    const first = focusable()[0];
    if (first && !node.contains(document.activeElement)) {
      first.focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = focusable();
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const firstNode = nodes[0]!;
      const lastNode = nodes[nodes.length - 1]!;
      const activeEl = document.activeElement as HTMLElement | null;
      if (e.shiftKey && activeEl === firstNode) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && activeEl === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      previousActive?.focus?.();
    };
  }, [active, onEscape]);

  return ref;
}
