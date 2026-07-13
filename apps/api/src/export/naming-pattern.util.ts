const UNSAFE_FILENAME_CHARS = /[\r\n\t/\\:*?"<>|]/g;

export function interpolateNamingPattern(pattern: string, tokens: Record<string, string>): string {
  const interpolated = Object.entries(tokens).reduce(
    (acc, [key, value]) => acc.split(`{${key}}`).join(value),
    pattern,
  );
  return interpolated.replace(UNSAFE_FILENAME_CHARS, '-').trim();
}
