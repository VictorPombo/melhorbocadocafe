// =============================================================================
// API: Validar cupom no Caixa pelo Balconista
// GET /api/fidelidade/cupom/validar?codigo=MB-88K2
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { buscarCupomPorCodigo, buscarPremioPorId } from "@/lib/fidelidade/mock-data";
import { UNIDADES_LOJA, type UnidadeLoja } from "@/lib/fidelidade/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

    const cleanCodigo = codigo.toUpperCase().trim();
    const codigoComPrefixo = cleanCodigo.startsWith("MB-") ? cleanCodigo : `MB-${cleanCodigo}`;
    const codigoSemPrefixo = cleanCodigo.replace("MB-", "");

    let dbCupom: any = null;

    // 1. SUPABASE É A FONTE PRIMÁRIA DE VERDADE
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from("mb_cupons")
          .select("*")
          .or(`codigo_cupom.eq.${codigoComPrefixo},codigo_cupom.eq.${codigoSemPrefixo},codigo_cupom.eq.${cleanCodigo}`)
          .order("criado_em", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          dbCupom = data;
        }
      } catch (err) {
        console.error("[Cupom Validar API] Erro ao consultar Supabase:", err);
      }
    }

    let cupomFinal: any = null;

    if (dbCupom) {
      let clienteNome = dbCupom.cliente_nome || "Cliente";
      let clienteNasc = dbCupom.cliente_nascimento || null;

      if (clienteNome === "Cliente" && dbCupom.cliente_id) {
        const { data: cl } = await supabase!
          .from("mb_clientes")
          .select("nome, nascimento")
          .eq("id", dbCupom.cliente_id)
          .maybeSingle();
        if (cl?.nome) {
          clienteNome = cl.nome;
          clienteNasc = cl.nascimento || clienteNasc;
        }
      }

      if (clienteNome === "Cliente" && dbCupom.giro_id) {
        const { data: gi } = await supabase!
          .from("mb_giros")
          .select("nome, nascimento")
          .eq("id", dbCupom.giro_id)
          .maybeSingle();
        if (gi?.nome) {
          clienteNome = gi.nome;
          clienteNasc = gi.nascimento || clienteNasc;
        }
      }

      const isUtilizado = Boolean(dbCupom.utilizado);
      const isExpirado = dbCupom.expira_em ? new Date(dbCupom.expira_em) < new Date() : false;
      const statusFinal = isUtilizado ? "utilizado" : isExpirado ? "expirado" : "disponivel";

      cupomFinal = {
        id: dbCupom.id,
        codigo_cupom: dbCupom.codigo_cupom,
        status: statusFinal,
        visita_numero: dbCupom.visita_numero || 1,
        cliente_nome: clienteNome,
        cliente_nascimento: clienteNasc,
        unidade_id: dbCupom.unidade === "itaim_bibi" ? "pinheiros" : dbCupom.unidade,
        unidade_nome: UNIDADES_LOJA.find((u) => u.id === dbCupom.unidade)?.nome || dbCupom.unidade,
        criado_em: dbCupom.criado_em,
        expira_em: dbCupom.expira_em,
        utilizado_em: dbCupom.utilizado_em,
        balconista_resgatou: dbCupom.utilizado_unidade,
        premio: {
          id: dbCupom.premio_id,
          nome: dbCupom.premio_nome || "Prêmio Fidelidade",
          icone: dbCupom.premio_icone || "🍩",
          tipo: dbCupom.premio_tipo || "produto",
          valor: Number(dbCupom.premio_valor || 0),
        },
      };
    } else {
      // 2. Fallback de memória local
      const localCupom = buscarCupomPorCodigo(cleanCodigo);
      if (localCupom) {
        const localPremio = buscarPremioPorId(localCupom.premio_id);
        const unidadeObj = UNIDADES_LOJA.find((u: UnidadeLoja) => u.id === localCupom.unidade);
        const isExp = new Date(localCupom.expira_em) < new Date();
        const statusLocal = localCupom.status === "utilizado" ? "utilizado" : isExp ? "expirado" : "disponivel";

        cupomFinal = {
          id: localCupom.id,
          codigo_cupom: localCupom.codigo_cupom,
          status: statusLocal,
          visita_numero: localCupom.visita_numero || 1,
          cliente_nome: localCupom.cliente_nome || "Cliente",
          cliente_nascimento: localCupom.cliente_nascimento || null,
          unidade_id: localCupom.unidade,
          unidade_nome: unidadeObj ? unidadeObj.nome : localCupom.unidade,
          criado_em: localCupom.criado_em,
          expira_em: localCupom.expira_em,
          utilizado_em: localCupom.utilizado_em,
          balconista_resgatou: localCupom.balconista_resgatou,
          premio: localPremio || { nome: "Prêmio Fidelidade", icone: "🍩", tipo: "produto", valor: 0 },
        };
      }
    }

    if (!cupomFinal) {
      return NextResponse.json(
        { erro: "Cupom não encontrado. Verifique o código e tente novamente." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      cupom: {
        id: cupomFinal.id,
        codigo_cupom: cupomFinal.codigo_cupom,
        status: cupomFinal.status,
        visita_numero: cupomFinal.visita_numero,
        cliente_nome: cupomFinal.cliente_nome,
        cliente_nascimento: cupomFinal.cliente_nascimento,
        unidade_id: cupomFinal.unidade_id,
        unidade_nome: cupomFinal.unidade_nome,
        criado_em: cupomFinal.criado_em,
        expira_em: cupomFinal.expira_em,
        utilizado_em: cupomFinal.utilizado_em,
        balconista_resgatou: cupomFinal.balconista_resgatou,
      },
      premio: cupomFinal.premio,
    });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro ao validar cupom" },
      { status: 500 }
    );
  }
}
