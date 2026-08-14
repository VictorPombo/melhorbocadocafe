// =============================================================================
// Sorteio — Algoritmo ponderado para a roleta de prêmios
// =============================================================================

import type { Premio } from "./types";
import { premiosRoletaStore, listarPremios, giroStore } from "./mock-data";

/**
 * Sorteia um prêmio respeitando probabilidades e limites.
 * Usa roleta ponderada: cada prêmio tem um "peso" proporcional à sua probabilidade.
 */
export function sortearPremio(customPremios?: Premio[]): Premio {
  const base = customPremios && customPremios.length > 0 ? customPremios : premiosRoletaStore;
  const premiosAtivos = base.filter((p) => p.ativo !== false);

  if (premiosAtivos.length === 0) {
    // Fallback
    return base[0] || premiosRoletaStore[0];
  }

  // Soma total das probabilidades dos prêmios disponíveis
  const pesoTotal = premiosAtivos.reduce((s, p) => s + (Number(p.probabilidade) || 0), 0);

  // Gera número aleatório entre 0 e pesoTotal
  let sorteio = Math.random() * (pesoTotal > 0 ? pesoTotal : 100);

  // Percorre os prêmios subtraindo as probabilidades
  for (const premio of premiosAtivos) {
    sorteio -= Number(premio.probabilidade) || 0;
    if (sorteio <= 0) {
      return premio;
    }
  }

  // Fallback
  return premiosAtivos[premiosAtivos.length - 1];
}

/**
 * Retorna prêmios que ainda estão dentro dos limites diários/mensais.
 */
function getPremiosDisponiveis(): Premio[] {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  return premiosRoletaStore.filter((premio) => {
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
