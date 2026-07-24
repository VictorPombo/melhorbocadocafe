// =============================================================================
// Factory — Retorna o adapter correto baseado na variável de ambiente
// Padrão: MockAdapter (sem dependência externa)
// =============================================================================

import type { IntegracaoVendas } from "../types";
import { MockAdapter } from "./mock-adapter";
import { DegustAdapter } from "./degust-adapter";

let instance: IntegracaoVendas | null = null;

export function getIntegracaoVendas(): IntegracaoVendas {
  if (instance) return instance;

  const adapter = process.env.INTEGRACAO_VENDAS_ADAPTER || "mock";

  switch (adapter) {
    case "degust":
      instance = new DegustAdapter();
      break;
    case "mock":
    default:
      instance = new MockAdapter();
      break;
  }

  return instance;
}
