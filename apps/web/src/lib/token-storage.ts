// Token guardado em sessionStorage (nao localStorage): sobrevive a reload de pagina mas eh
// limpo ao fechar a aba, reduzindo a janela de exposicao a roubo via XSS. A API deste projeto
// eh stateless (Bearer JWT, sem cookie de sessao), entao sessionStorage eh o compromisso
// pratico dado o design existente do backend; ver SECURITY-NOTES.md para o tradeoff completo.
const TOKEN_KEY = 'formops.accessToken';

export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}
