import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// O .env do monorepo fica na raiz (dois niveis acima de apps/web), nao em
// apps/web/.env. Le so a linha WEB_PORT diretamente do arquivo em vez de usar
// o loadEnv() do Vite, que carrega o NODE_ENV do .env junto e sobrescreve o
// modo de build (gera bundle de producao nao minificado).
function readRootEnvWebPort(): number | undefined {
  try {
    const content = readFileSync(new URL('../../.env', import.meta.url), 'utf-8');
    const match = content.match(/^WEB_PORT=(\d+)/m);
    return match ? Number(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: readRootEnvWebPort() ?? 5173,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/types/**'],
    },
  },
});
