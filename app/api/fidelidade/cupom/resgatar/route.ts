// =============================================================================
// API: Resgatar cupom no Caixa pelo Balconista
// POST /api/fidelidade/cupom/resgatar
// Body: { codigo_cupom, balconista? }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { resgatarCupomPorBalconista, buscarPremioPorId } from "@/lib/fidelidade/mock-data";
import { resgatarCupomDb } from "@/lib/fidelidade/supabase-service";

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

    let resultado = resgatarCupomPorBalconista(
      codigo_cupom,
      balconista || "Operador Balcão",
      unidade
    );

    if (!resultado.sucesso) {
      const dbRes = await resgatarCupomDb(codigo_cupom, unidade || "tatuape");
      if (dbRes) {
        if (!dbRes.sucesso && dbRes.motivo === "ja_utilizado") {
          return NextResponse.json(
            { erro: "Este cupom já foi utilizado.", cupom: dbRes.cupom },
            { status: 400 }
          );
        }
        if (dbRes.sucesso && dbRes.cupom) {
          const premio = buscarPremioPorId(dbRes.cupom.premio_id) || {
            nome: dbRes.cupom.premio_nome,
            tipo: dbRes.cupom.premio_tipo,
            valor: dbRes.cupom.premio_valor,
            icone: dbRes.cupom.premio_icone,
          };
          return NextResponse.json({
            sucesso: true,
            mensagem: "Cupom resgatado com sucesso via Banco de Dados!",
            cupom: dbRes.cupom,
            premio,
          });
        }
      }

      return NextResponse.json(
        { erro: resultado.mensagem, cupom: resultado.cupom },
        { status: 400 }
      );
    }

    // Sincroniza resgate no Supabase
    try {
      await resgatarCupomDb(codigo_cupom, unidade || "tatuape");
    } catch (dbErr) {
      console.error("[Database] Erro ao sincronizar resgate no Supabase:", dbErr);
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
