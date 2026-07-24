// =============================================================================
// API: Buscar cupom por ID
// GET /api/fidelidade/cupom/[cupomId]
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { buscarCupomPorId, buscarPremioPorId } from "@/lib/fidelidade/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cupomId: string }> }
) {
  const { cupomId } = await params;

  const cupom = buscarCupomPorId(cupomId);
  if (!cupom) {
    return NextResponse.json(
      { erro: "Cupom não encontrado" },
      { status: 404 }
    );
  }

  const premio = buscarPremioPorId(cupom.premio_id);

  return NextResponse.json({
    cupom: {
      id: cupom.id,
      codigo_cupom: cupom.codigo_cupom,
      status: cupom.status,
      criado_em: cupom.criado_em,
      expira_em: cupom.expira_em,
      utilizado_em: cupom.utilizado_em,
    },
    premio: premio
      ? { nome: premio.nome, tipo: premio.tipo, valor: premio.valor }
      : null,
  });
}
