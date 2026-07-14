import { buildCsv } from './csv.util';

describe('buildCsv', () => {
  it('joins simple rows with comma and CRLF between rows', () => {
    const csv = buildCsv([
      ['Indicador', 'Valor'],
      ['Disponibilidade', 99.5],
    ]);
    expect(csv).toBe('Indicador,Valor\r\nDisponibilidade,99.5');
  });

  it('quotes fields containing commas', () => {
    const csv = buildCsv([['Titulo, com virgula', 1]]);
    expect(csv).toBe('"Titulo, com virgula",1');
  });

  it('quotes fields containing double quotes and escapes them by doubling', () => {
    const csv = buildCsv([['Valor "citado"', 1]]);
    expect(csv).toBe('"Valor ""citado""",1');
  });

  it('quotes fields containing newlines', () => {
    const csv = buildCsv([['linha1\nlinha2', 1]]);
    expect(csv).toBe('"linha1\nlinha2",1');
  });

  it('renders null and undefined as empty fields', () => {
    const csv = buildCsv([[null, undefined, 'x']]);
    expect(csv).toBe(',,x');
  });

  it('renders booleans as their string form', () => {
    const csv = buildCsv([[true, false]]);
    expect(csv).toBe('true,false');
  });

  it.each(['=SUM(A1:A2)', '+1+1', '-1+1', '@SUM(A1:A2)'])(
    'neutralizes CSV/Excel formula injection by prefixing "%s" with an apostrophe',
    (payload) => {
      const csv = buildCsv([[payload]]);
      expect(csv).toBe(`'${payload}`);
    },
  );

  it('also neutralizes a formula payload that itself contains quotes (still gets CSV-quoted afterward)', () => {
    const csv = buildCsv([['=cmd|"/c calc"!A1']]);
    expect(csv).toBe('"\'=cmd|""/c calc""!A1"');
    expect(csv.replace(/^"/, '').startsWith("'=")).toBe(true);
  });

  it('does not alter fields that merely contain (but do not start with) formula trigger characters', () => {
    const csv = buildCsv([['Total = 100']]);
    expect(csv).toBe('Total = 100');
  });
});
