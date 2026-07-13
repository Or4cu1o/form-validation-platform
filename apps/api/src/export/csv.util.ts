type CsvCell = string | number | boolean | null | undefined;

function escapeCsvField(value: CsvCell): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(rows: CsvCell[][]): string {
  return rows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n');
}
