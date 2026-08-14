// =============================================================================
// API: Validar cupom no Caixa pelo Balconista
// GET /api/fidelidade/cupom/validar?codigo=MB-88K2
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { buscarCupomPorCodigo, buscarPremioPorId } from "@/lib/fidelidade/mock-data";
import { UNIDADES_LOJA, type UnidadeLoja } from "@/lib/fidelidade/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const codigo = searchParams.get("codigo");

    if (!codigo) {
      return NextResponse.json(
        { erro: "Código do cupom é obrigatório." },
        { status: 400 }
      );
    }

    const cupom = buscarCupomPorCodigo(codigo);

    if (!cupom) {
      return NextResponse.json(
        { erro: "Cupom não encontrado. Verifique o código e tente novamente." },
        { status: 404 }
      );
    }

    const premio = buscarPremioPorId(cupom.premio_id);
    const unidadeObj = UNIDADES_LOJA.find((u: UnidadeLoja) => u.id === cupom.unidade);

    const isDisponivel = cupom.status === "disponivel";

    return NextResponse.json({
      sucesso: true,
      cupom: {
        id: cupom.id,
        codigo_cupom: cupom.codigo_cupom,
        status: cupom.status,
        visita_numero: isDisponivel ? (cupom.visita_numero || 1) : null,
        cliente_nome: isDisponivel ? (cupom.cliente_nome || "Cliente Fidelidade") : null,
        cliente_nascimento: isDisponivel ? (cupom.cliente_nascimento || null) : null,
        unidade_id: cupom.unidade,
        unidade_nome: unidadeObj ? unidadeObj.nome : cupom.unidade,
        criado_em: cupom.criado_em,
        expira_em: cupom.expira_em,
        utilizado_em: cupom.utilizado_em,
        balconista_resgatou: cupom.balconista_resgatou,
      },
      premio: premio
        ? {
            id: premio.id,
            nome: premio.nome,
            tipo: premio.tipo,
            valor: premio.valor,
            icone: premio.icone,
          }
        : { nome: "Prêmio Surpresa", icone: "🍩" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro ao validar cupom" },
      { status: 500 }
    );
  }
}
