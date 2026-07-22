/**
 * Fonte única de branding white-label.
 *
 * Nenhuma página ou componente deve conter strings literais com o nome da
 * organização, do departamento ou do sistema — tudo deve ser importado
 * deste arquivo. `tailwind.config.ts` importa `brand.colors` diretamente,
 * então a paleta usada nas classes utilitárias (`bg-accent`, `text-ink`,
 * `bg-status-*` etc.) e os valores aqui expostos são a mesma fonte de
 * verdade, nunca hex soltos em componentes.
 */

export interface BrandLogoAssets {
  /** Logo para uso sobre fundos claros (paper). */
  light: string;
  /** Logo para uso sobre fundos escuros (console/sidebar, login). */
  dark: string;
  favicon: string;
}

export interface BrandStatusColors {
  pendente: string;
  revisao: string;
  aprovacao: string;
  concluido: string;
  reprovado: string;
}

export interface BrandColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface BrandColors {
  /** Azul institucional — cor de marca primária. */
  primary: string;
  primaryHover: string;
  primaryActive: string;
  /** Cor de texto/ícone sobre a cor primária. */
  onPrimary: string;
  /** Escala completa da cor primária (50 claro → 900 escuro). */
  primaryScale: BrandColorScale;

  /** Neutros de superfície e texto — tom frio alinhado ao azul primário. */
  paper: string;
  paperRaised: string;
  paperSunken: string;
  ink: string;
  inkMuted: string;
  inkFaint: string;
  border: string;
  borderStrong: string;

  /** Superfície escura (sidebar / painel de login). */
  console: string;
  consoleRaised: string;
  consoleBorder: string;

  /** Estados semânticos do workflow de indicadores. */
  status: BrandStatusColors;
}

export interface BrandConfig {
  organizationName: string;
  organizationFullName: string;
  departmentAcronym: string;
  departmentFullName: string;
  systemName: string;
  systemPurposeShort: string;
  logo: BrandLogoAssets;
  colors: BrandColors;
  copyrightLine: string;
}

const CURRENT_YEAR = new Date().getFullYear();

const ORGANIZATION_NAME = 'AGIR';
const ORGANIZATION_FULL_NAME = 'Associação de Gestão, Inovação e Resultados em Saúde';
const DEPARTMENT_ACRONYM = 'GCINFRA';
const DEPARTMENT_FULL_NAME = 'Gerência Corporativa de Infraestrutura';

export const brand: BrandConfig = {
  organizationName: ORGANIZATION_NAME,
  organizationFullName: ORGANIZATION_FULL_NAME,
  departmentAcronym: DEPARTMENT_ACRONYM,
  departmentFullName: DEPARTMENT_FULL_NAME,
  systemName: 'Governança e Automação de Indicadores de TI',
  systemPurposeShort:
    'Elaboração, revisão e validação de relatórios com trilha de auditoria completa, do lançamento à aprovação final.',
  logo: {
    light: '/logo-agir-branco.png',
    dark: '/logo-agir-branco.png',
    favicon: '/favicon.ico',
  },
  colors: {
    primary: '#00549a',
    primaryHover: '#00427a',
    primaryActive: '#00335f',
    onPrimary: '#ffffff',
    primaryScale: {
      50: '#eff6fb',
      100: '#dceaf5',
      200: '#b7d4ea',
      300: '#86b8d9',
      400: '#4a92c0',
      500: '#1974a8',
      600: '#00549a',
      700: '#00427a',
      800: '#00335f',
      900: '#062544',
    },

    paper: '#f7f9fc',
    paperRaised: '#ffffff',
    paperSunken: '#eef2f7',
    ink: '#101826',
    inkMuted: '#47566b',
    inkFaint: '#6b7c92',
    border: '#e3e8ef',
    borderStrong: '#c7d0dc',

    console: '#0b1522',
    consoleRaised: '#142235',
    consoleBorder: '#24374d',

    // Roxo dedicado — nunca reutilizado em nenhum outro papel semântico da
    // paleta — para que "pendente de aprovação" não se confunda com o azul
    // primário de marca (usado em botões, links e navegação ativa).
    status: {
      pendente: '#64748b',
      revisao: '#a16207',
      aprovacao: '#6d28d9',
      concluido: '#15803d',
      reprovado: '#b91c1c',
    },
  },
  copyrightLine: `${DEPARTMENT_ACRONYM} — ${DEPARTMENT_FULL_NAME} | © ${CURRENT_YEAR} ${ORGANIZATION_NAME} - ${ORGANIZATION_FULL_NAME}`,
};
