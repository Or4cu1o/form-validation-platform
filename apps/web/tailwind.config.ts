import type { Config } from 'tailwindcss';
import { brand } from './src/config/brand';

const { colors } = brand;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: colors.paper,
          raised: colors.paperRaised,
          sunken: colors.paperSunken,
        },
        ink: {
          DEFAULT: colors.ink,
          muted: colors.inkMuted,
          faint: colors.inkFaint,
        },
        console: {
          DEFAULT: colors.console,
          raised: colors.consoleRaised,
          border: colors.consoleBorder,
        },
        accent: {
          50: colors.primaryScale[50],
          100: colors.primaryScale[100],
          200: colors.primaryScale[200],
          300: colors.primaryScale[300],
          400: colors.primaryScale[400],
          500: colors.primaryScale[500],
          600: colors.primaryScale[600],
          700: colors.primaryScale[700],
          800: colors.primaryScale[800],
          900: colors.primaryScale[900],
          DEFAULT: colors.primary,
          hover: colors.primaryHover,
          active: colors.primaryActive,
          ink: colors.onPrimary,
        },
        status: {
          pendente: colors.status.pendente,
          revisao: colors.status.revisao,
          aprovacao: colors.status.aprovacao,
          concluido: colors.status.concluido,
          reprovado: colors.status.reprovado,
        },
        border: {
          DEFAULT: colors.border,
          strong: colors.borderStrong,
        },
      },
      fontFamily: {
        // Inter também para títulos/display: a hierarquia vem de peso
        // (font-semibold/font-bold) e escala de tamanho, não de uma segunda
        // família serifada — decisão de design revisada após avaliação
        // visual direta do produto (ver histórico de iteração).
        display: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-lg': ['3.25rem', { lineHeight: '1.04', letterSpacing: '-0.015em' }],
        display: ['2.25rem', { lineHeight: '1.08', letterSpacing: '-0.01em' }],
        'display-sm': ['1.625rem', { lineHeight: '1.15', letterSpacing: '-0.005em' }],
        'display-xs': ['1.25rem', { lineHeight: '1.25', letterSpacing: '0' }],
      },
      boxShadow: {
        xs: '0 1px 2px oklch(22% 0.03 255 / 0.05)',
        panel: '0 1px 2px oklch(22% 0.03 255 / 0.05), 0 6px 20px oklch(22% 0.03 255 / 0.06)',
        raised: '0 2px 6px oklch(22% 0.03 255 / 0.08), 0 10px 28px oklch(22% 0.03 255 / 0.08)',
        floating: '0 8px 16px oklch(22% 0.03 255 / 0.12), 0 24px 56px oklch(22% 0.03 255 / 0.20)',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        lg: '0.625rem',
        xl: '0.875rem',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '220ms',
        slow: '320ms',
      },
      keyframes: {
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'rise-in': 'rise-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
} satisfies Config;
