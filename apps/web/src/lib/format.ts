export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function formatReferenceMonth(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

export function formatNumber(value: number | string | null | undefined, fractionDigits = 2): string {
  if (value === null || value === undefined) return '—';
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(numeric)) return '—';
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: fractionDigits }).format(numeric);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
