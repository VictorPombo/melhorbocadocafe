// =============================================================================
// API: Resgatar cupom no Caixa pelo Balconista
// POST /api/fidelidade/cupom/resgatar
// Body: { codigo_cupom, balconista? }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { resgatarCupomPorBalconista, buscarPremioPorId } from "@/lib/fidelidade/mock-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codigo_cupom, balconista, unidade } = body;

    if (!codigo_cupom) {
      return NextResponse.json(
        { erro: "Código do cupom é obrigatório." },
        { status: 400 }
      );
    }

    const resultado = resgatarCupomPorBalconista(
      codigo_cupom,
      balconista || "Operador Balcão",
      unidade
    );

    if (!resultado.sucesso) {
      return NextResponse.json(
        { erro: resultado.mensagem, cupom: resultado.cupom },
        { status: 400 }
      );
    }

    const premio = resultado.cupom ? buscarPremioPorId(resultado.cupom.premio_id) : null;

    return NextResponse.json({
      sucesso: true,
      mensagem: resultado.mensagem,
      cupom: resultado.cupom,
      premio,
    });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro ao efetuar resgate do cupom" },
      { status: 500 }
    );
  }
}
