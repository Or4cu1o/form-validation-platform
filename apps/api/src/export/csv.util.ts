type CsvCell = string | number | boolean | null | undefined;

// Campos que comecam com = + - @ sao interpretados como formula por
// Excel/Sheets ao abrir o CSV (CSV/Excel Formula Injection). Como titulo/
// objetivo de indicador e sigla/nome de unidade sao texto livre cadastrado
// pelo Administrador, prefixamos com apostrofo para forcar interpretacao
// como texto puro — o apostrofo nao aparece visualmente na celula.
const FORMULA_TRIGGER_PATTERN = /^[=+\-@]/;

function escapeCsvField(value: CsvCell): string {
  if (value === null || value === undefined) {
    return '';
  }
  let str = String(value);
  if (FORMULA_TRIGGER_PATTERN.test(str)) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(rows: CsvCell[][]): string {
  return rows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n');
}
