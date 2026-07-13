import { interpolateNamingPattern } from './naming-pattern.util';

describe('interpolateNamingPattern', () => {
  it('replaces known tokens with provided values', () => {
    const result = interpolateNamingPattern('Relatorio - {SIGLA_UNIDADE} - {DATA_ISO}', {
      SIGLA_UNIDADE: 'MATRIZ',
      DATA_ISO: '2026-07-13',
    });
    expect(result).toBe('Relatorio - MATRIZ - 2026-07-13');
  });

  it('leaves unknown placeholders untouched', () => {
    const result = interpolateNamingPattern('{UNKNOWN} - {SIGLA_UNIDADE}', { SIGLA_UNIDADE: 'FIL01' });
    expect(result).toBe('{UNKNOWN} - FIL01');
  });

  it('strips characters unsafe for filenames and HTTP headers', () => {
    const result = interpolateNamingPattern('{SIGLA_UNIDADE}', { SIGLA_UNIDADE: 'A/B\\C:D*E?F"G<H>I|J\r\nK' });
    expect(result).toBe('A-B-C-D-E-F-G-H-I-J--K');
  });

  it('trims surrounding whitespace after interpolation', () => {
    const result = interpolateNamingPattern('  {SIGLA_UNIDADE}  ', { SIGLA_UNIDADE: 'MATRIZ' });
    expect(result).toBe('MATRIZ');
  });
});
