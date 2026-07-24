// =============================================================================
// MockAdapter — Implementação simulada da IntegracaoVendas
// Gera vendas falsas para testar o sistema de ponta a ponta sem o Degust.
// =============================================================================

import type { IntegracaoVendas, VendaPDV } from "../types";
import { gerarVendasRecentes } from "../mock-data";

export class MockAdapter implements IntegracaoVendas {
  private autenticado = false;

  async autenticar(): Promise<boolean> {
    // Mock: sempre autentica com sucesso
    this.autenticado = true;
    console.log("[MockAdapter] Autenticado com sucesso (simulado)");
    return true;
  }

  async buscarVendaPorNumero(
    loja: string,
    numeroVenda: number
  ): Promise<VendaPDV | null> {
    // Gera uma venda simulada com o número solicitado
    const vendas = gerarVendasRecentes(loja, "1", 1, 5);
    if (vendas.length > 0) {
      vendas[0].numero_venda = numeroVenda;
      return vendas[0];
    }
    return null;
  }

  async listarVendasRecentesDoCaixa(
    loja: string,
    caixa: string,
    desdeHorario: Date
  ): Promise<VendaPDV[]> {
    const minutosAtras = Math.ceil(
      (Date.now() - desdeHorario.getTime()) / 60000
    );
    const vendas = gerarVendasRecentes(loja, caixa, 3, minutosAtras);

    // Filtra apenas as que estão dentro da janela
    return vendas.filter(
      (v) => new Date(v.data_hora).getTime() >= desdeHorario.getTime()
    );
  }

  async sincronizarVendas(loja: string, desde: Date): Promise<VendaPDV[]> {
    const minutosAtras = Math.ceil((Date.now() - desde.getTime()) / 60000);
    return gerarVendasRecentes(loja, "1", 5, minutosAtras);
  }
}
