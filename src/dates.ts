export class DateError extends Error {}

export function parseDate(s: string, what = "date"): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new DateError(`${what} must be YYYY-MM-DD, got "${s}"`);
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) throw new DateError(`${what} is not a real calendar date: ${s}`);
  return d;
}

export const iso = (d: Date): string => d.toISOString().slice(0, 10);

export function addDays(d: Date, n: number): Date {
  const r = new Date(d.getTime());
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

export const addWeeks = (d: Date, n: number): Date => addDays(d, n * 7);

export function addMonths(d: Date, n: number): Date {
  const day = d.getUTCDate();
  const r = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const last = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
  r.setUTCDate(Math.min(day, last));
  return r;
}

export const daysBetween = (a: Date, b: Date): number => Math.round((b.getTime() - a.getTime()) / 86400000);
