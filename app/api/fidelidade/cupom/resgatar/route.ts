// =============================================================================
// API: Resgatar cupom no Caixa pelo Balconista (Supabase Primary)
// POST /api/fidelidade/cupom/resgatar
// Body: { codigo_cupom, balconista?, unidade? }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { resgatarCupomPorBalconista, buscarPremioPorId } from "@/lib/fidelidade/mock-data";
import { resgatarCupomDb } from "@/lib/fidelidade/supabase-service";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

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

    const cleanCodigo = codigo_cupom.toUpperCase().trim();
    const targetUnidade = unidade || "santana";

    // 1. Supabase como fonte primária
    if (isSupabaseConfigured && supabase) {
      const dbRes = await resgatarCupomDb(cleanCodigo, targetUnidade);
      if (dbRes) {
        if (!dbRes.sucesso && dbRes.motivo === "ja_utilizado") {
          return NextResponse.json(
            { erro: "Este cupom já foi utilizado anteriormente.", cupom: dbRes.cupom },
            { status: 400 }
          );
        }
        if (!dbRes.sucesso && dbRes.motivo === "expirado") {
          return NextResponse.json(
            { erro: "Este cupom está expirado e não pode mais ser resgatado.", cupom: dbRes.cupom },
            { status: 400 }
          );
        }
        if (dbRes.sucesso && dbRes.cupom) {
          const premio = {
            id: dbRes.cupom.premio_id,
            nome: dbRes.cupom.premio_nome || "Prêmio Fidelidade",
            tipo: dbRes.cupom.premio_tipo || "produto",
            valor: Number(dbRes.cupom.premio_valor || 0),
            icone: dbRes.cupom.premio_icone || "☕",
          };

          // Também atualiza mock em memória se existir
          try {
            resgatarCupomPorBalconista(cleanCodigo, balconista || "Balcão", targetUnidade);
          } catch {}

          return NextResponse.json({
            sucesso: true,
            mensagem: "Cupom resgatado com sucesso!",
            cupom: dbRes.cupom,
            premio,
          });
        }
      }
    }

    // 2. Fallback de memória local
    const resultado = resgatarCupomPorBalconista(
      cleanCodigo,
      balconista || "Operador Balcão",
      targetUnidade
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
