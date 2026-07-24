// =============================================================================
// DegustAdapter — Implementação real da IntegracaoVendas (stub)
// Será implementado na Fase 8 com os endpoints documentados em docs/degust-api.md
// =============================================================================

import type { IntegracaoVendas, VendaPDV } from "../types";

/**
 * Adapter real para a API Degust (Linx).
 * 
 * Variáveis de ambiente necessárias:
 * - DEGUST_API_BASE_URL
 * - DEGUST_USUARIO
 * - DEGUST_SENHA
 * - DEGUST_CODIGO_FRANQUEADOR
 * - DEGUST_CODIGO_LOJA
 * 
 * Ver docs/degust-api.md para detalhes.
 */
export class DegustAdapter implements IntegracaoVendas {
  async autenticar(): Promise<boolean> {
    // TODO: Fase 8 — POST /api/usuario/autenticar
    throw new Error(
      "[DegustAdapter] Não implementado. Configure INTEGRACAO_VENDAS_ADAPTER=mock para usar o MockAdapter."
    );
  }

  async buscarVendaPorNumero(
    _loja: string,
    _numeroVenda: number
  ): Promise<VendaPDV | null> {
    // TODO: Fase 8 — POST /api/venda/relatorio-vendas com filtro
    throw new Error("[DegustAdapter] Não implementado.");
  }

  async listarVendasRecentesDoCaixa(
    _loja: string,
    _caixa: string,
    _desdeHorario: Date
  ): Promise<VendaPDV[]> {
    // TODO: Fase 8 — POST /api/venda/relatorio-vendas-periodo-sincronizado
    throw new Error("[DegustAdapter] Não implementado.");
  }

  async sincronizarVendas(_loja: string, _desde: Date): Promise<VendaPDV[]> {
    // TODO: Fase 8 — Polling periódico via relatorio-vendas-periodo-sincronizado
    throw new Error("[DegustAdapter] Não implementado.");
  }
}
