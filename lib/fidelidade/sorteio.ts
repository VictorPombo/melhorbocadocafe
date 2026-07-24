// =============================================================================
// Sorteio — Algoritmo ponderado para a roleta de prêmios
// =============================================================================

import type { Premio } from "./types";
import { MOCK_PREMIOS, giroStore } from "./mock-data";

/**
 * Sorteia um prêmio respeitando probabilidades e limites.
 * Usa roleta ponderada: cada prêmio tem um "peso" proporcional à sua probabilidade.
 */
export function sortearPremio(): Premio {
  const premiosAtivos = getPremiosDisponiveis();

  if (premiosAtivos.length === 0) {
    // Fallback: retorna o primeiro prêmio ativo sem limites
    return MOCK_PREMIOS.find((p) => p.ativo) || MOCK_PREMIOS[0];
  }

  // Soma total das probabilidades dos prêmios disponíveis
  const pesoTotal = premiosAtivos.reduce((s, p) => s + p.probabilidade, 0);

  // Gera número aleatório entre 0 e pesoTotal
  let sorteio = Math.random() * pesoTotal;

  // Percorre os prêmios subtraindo as probabilidades
  for (const premio of premiosAtivos) {
    sorteio -= premio.probabilidade;
    if (sorteio <= 0) {
      return premio;
    }
  }

  // Fallback (não deveria chegar aqui)
  return premiosAtivos[premiosAtivos.length - 1];
}

/**
 * Retorna prêmios que ainda estão dentro dos limites diários/mensais.
 */
function getPremiosDisponiveis(): Premio[] {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  return MOCK_PREMIOS.filter((premio) => {
    if (!premio.ativo) return false;

    // Conta giros com este prêmio hoje
    if (premio.limite_diario !== null) {
      const girosHoje = giroStore.filter(
        (g) =>
          g.premio_id === premio.id &&
          new Date(g.criado_em).getTime() >= hoje.getTime()
      ).length;
      if (girosHoje >= premio.limite_diario) return false;
    }

    // Conta giros com este prêmio neste mês
    if (premio.limite_mensal !== null) {
      const girosMes = giroStore.filter(
        (g) =>
          g.premio_id === premio.id &&
          new Date(g.criado_em).getTime() >= inicioMes.getTime()
      ).length;
      if (girosMes >= premio.limite_mensal) return false;
    }

    return true;
  });
}
