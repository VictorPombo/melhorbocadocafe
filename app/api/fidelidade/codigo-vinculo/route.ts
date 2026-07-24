// =============================================================================
// API: Gerar código de vínculo para o caixa
// POST /api/fidelidade/codigo-vinculo
// Body: { loja, caixa }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { gerarCodigoVinculo } from "@/lib/fidelidade/mock-data";

export async function POST(req: NextRequest) {
  try {
    const { loja, caixa } = await req.json();

    const cv = gerarCodigoVinculo(loja || "loja_1", caixa || "1");

    return NextResponse.json({
      sucesso: true,
      codigo: cv.codigo,
      expira_em: cv.expira_em,
      id: cv.id,
    });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
