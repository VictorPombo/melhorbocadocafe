// =============================================================================
// API: Buscar cupom por ID
// GET /api/fidelidade/cupom/[cupomId]
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { buscarCupomPorId, buscarPremioPorId } from "@/lib/fidelidade/mock-data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cupomId: string }> }
) {
  const { cupomId } = await params;

  let cupom = buscarCupomPorId(cupomId);

  if (!cupom && isSupabaseConfigured && supabase) {
    const { data: dbCupom } = await supabase
      .from("mb_cupons")
      .select("*")
      .or(`id.eq.${cupomId},codigo_cupom.eq.${cupomId.toUpperCase()}`)
      .maybeSingle();

    if (dbCupom) {
      cupom = {
        id: dbCupom.id,
        codigo_cupom: dbCupom.codigo_cupom,
        premio_id: dbCupom.premio_id,
        status: dbCupom.utilizado ? "utilizado" : "disponivel",
        criado_em: dbCupom.criado_em,
        expira_em: dbCupom.expira_em,
        utilizado_em: dbCupom.utilizado_em,
        premio: {
          id: dbCupom.premio_id,
          nome: dbCupom.premio_nome,
          tipo: dbCupom.premio_tipo,
          valor: Number(dbCupom.premio_valor) || 0,
        },
      } as any;
    }
  }

  if (!cupom) {
    return NextResponse.json(
      { erro: "Cupom não encontrado" },
      { status: 404 }
    );
  }

  const premio = buscarPremioPorId(cupom.premio_id) || cupom.premio;

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
