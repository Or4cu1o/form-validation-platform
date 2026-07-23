// Distribui `total` pontos igualmente entre `count` indicadores, usando o
// metodo dos maiores restos (apportionment) para que a soma exata bata com
// `total` mesmo quando a divisao nao e exata (ex.: 10/13 indicadores).
// Os primeiros `restante` itens recebem 1 centavo a mais que os demais.
export function distributeScoreWeights(count: number, total = 10): number[] {
  if (count <= 0) {
    return [];
  }

  const totalCents = Math.round(total * 100);
  const baseCents = Math.floor(totalCents / count);
  const remainderCents = totalCents - baseCents * count;

  return Array.from({ length: count }, (_, index) => {
    const cents = baseCents + (index < remainderCents ? 1 : 0);
    return cents / 100;
  });
}
