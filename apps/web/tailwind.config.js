/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#f8fafc', // slate-50
          raised: '#ffffff',  // pure white
        },
        ink: {
          DEFAULT: '#0f172a', // slate-900
          muted: '#475569',   // slate-600
          faint: '#94a3b8',   // slate-400
        },
        console: {
          DEFAULT: '#0f172a', // deep slate-900 for sidebar
          raised: '#1e293b',  // slate-800
          border: '#334155',  // slate-700
        },
        accent: {
          DEFAULT: '#00549a', // Agir Blue
          hover: '#00427a',
          ink: '#ffffff',
        },
        status: {
          pendente: '#64748b',
          revisao: '#00549a',
          aprovacao: '#0284c7',
          concluido: '#16a34a',
          reprovado: '#dc2626',
        },
        border: {
          DEFAULT: '#e2e8f0', // slate-200
          strong: '#cbd5e1',  // slate-300
        },
      },
      fontFamily: {
        display: ['"SF Pro Display"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"SF Pro Text"', '"SF Pro Display"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-lg': ['2.75rem', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        display: ['2rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-sm': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.005em' }],
      },
      boxShadow: {
        panel: '0 1px 2px oklch(22% 0.02 260 / 0.06), 0 8px 24px oklch(22% 0.02 260 / 0.06)',
        floating: '0 4px 12px oklch(22% 0.02 260 / 0.1), 0 16px 40px oklch(22% 0.02 260 / 0.16)',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        lg: '0.625rem',
      },
    },
  },
  plugins: [],
};
