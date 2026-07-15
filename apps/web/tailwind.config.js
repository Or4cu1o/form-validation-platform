/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: 'oklch(97.5% 0.006 85)',
          raised: 'oklch(99% 0.003 85)',
        },
        ink: {
          DEFAULT: 'oklch(22% 0.02 260)',
          muted: 'oklch(45% 0.015 260)',
          faint: 'oklch(62% 0.012 260)',
        },
        console: {
          DEFAULT: '#06514C',
          raised: '#05413d',
          border: '#043330',
        },
        accent: {
          DEFAULT: '#00549a',
          hover: '#00427a',
          ink: '#002b50',
        },
        status: {
          pendente: 'oklch(58% 0.02 260)',
          revisao: '#00549a',
          aprovacao: 'oklch(62% 0.14 245)',
          concluido: 'oklch(62% 0.13 155)',
          reprovado: 'oklch(58% 0.19 25)',
        },
        border: {
          DEFAULT: 'oklch(88% 0.008 85)',
          strong: 'oklch(78% 0.012 85)',
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
