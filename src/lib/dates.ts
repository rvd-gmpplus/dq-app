import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { enGB } from 'date-fns/locale';

export const nowIso = (): string => new Date().toISOString();

export function fmtDate(iso: string): string {
  return format(parseISO(iso), 'd LLL yyyy', { locale: enGB });
}

export function fmtDateTime(iso: string): string {
  return format(parseISO(iso), "d LLL yyyy, HH:mm", { locale: enGB });
}

export function fmtRelative(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: enGB });
}

export function fmtIsoWeek(iso: string): string {
  return format(parseISO(iso), 'RRRR-ww', { locale: enGB });
}
