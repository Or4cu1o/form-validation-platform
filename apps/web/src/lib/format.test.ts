import { describe, expect, it } from 'vitest';
import { formatBytes, formatDate, formatDateTime, formatNumber, formatReferenceMonth } from './format';

describe('formatDate', () => {
  it('returns em dash for null or undefined', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('formats an ISO date string in pt-BR short style', () => {
    expect(formatDate('2026-03-05T00:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe('formatDateTime', () => {
  it('returns em dash for null or undefined', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
  });

  it('formats an ISO datetime string with date and time', () => {
    const result = formatDateTime('2026-03-05T14:30:00.000Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatReferenceMonth', () => {
  it('formats a reference month as month and year using UTC', () => {
    const result = formatReferenceMonth('2026-03-01');
    expect(result.toLowerCase()).toContain('março');
    expect(result).toContain('2026');
  });
});

describe('formatNumber', () => {
  it('returns em dash for null or undefined', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
  });

  it('returns em dash for a non-numeric string', () => {
    expect(formatNumber('not-a-number')).toBe('—');
  });

  it('formats a numeric value with pt-BR grouping', () => {
    expect(formatNumber(1234.5)).toBe('1.234,5');
  });

  it('formats a numeric string', () => {
    expect(formatNumber('42')).toBe('42');
  });

  it('respects the fractionDigits parameter', () => {
    expect(formatNumber(1.23456, 3)).toBe('1,235');
  });
});

describe('formatBytes', () => {
  it('formats bytes below 1024 as B', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats values below 1024 KB as KB', () => {
    expect(formatBytes(2048)).toBe('2.0 KB');
  });

  it('formats values at or above 1024 KB as MB', () => {
    expect(formatBytes(1024 * 1024 * 3)).toBe('3.0 MB');
  });
});
