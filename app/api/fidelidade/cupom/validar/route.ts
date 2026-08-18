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
    let cupom = buscarCupomPorCodigo(cleanCodigo);

    // Se não estiver na memória desta lambda, busca no banco Supabase
    if (!cupom && isSupabaseConfigured && supabase) {
      const { data: dbCupom } = await supabase
        .from("mb_cupons")
        .select("*")
        .eq("codigo_cupom", cleanCodigo)
        .maybeSingle();

      if (dbCupom) {
        let clienteNome = "Cliente Fidelidade";
        let clienteNasc = null;

        // Tenta buscar o nome do cliente pelo id do cliente ou pelo giro
        if (dbCupom.cliente_id) {
          const { data: cl } = await supabase
            .from("mb_clientes")
            .select("nome, nascimento")
            .eq("id", dbCupom.cliente_id)
            .maybeSingle();
          if (cl?.nome) {
            clienteNome = cl.nome;
            clienteNasc = cl.nascimento;
          }
        }

        if (clienteNome === "Cliente Fidelidade" && dbCupom.giro_id) {
          const { data: gi } = await supabase
            .from("mb_giros")
            .select("nome, nascimento")
            .eq("id", dbCupom.giro_id)
            .maybeSingle();
          if (gi?.nome) {
            clienteNome = gi.nome;
            clienteNasc = gi.nascimento;
          }
        }

        cupom = {
          id: dbCupom.id,
          codigo_cupom: dbCupom.codigo_cupom,
          premio_id: dbCupom.premio_id,
          cliente_id: dbCupom.cliente_id,
          cliente_nome: clienteNome,
          cliente_nascimento: clienteNasc,
          unidade: dbCupom.unidade === "itaim_bibi" ? "pinheiros" : dbCupom.unidade,
          visita_numero: dbCupom.visita_numero || 1,
          criado_em: dbCupom.criado_em,
          expira_em: dbCupom.expira_em,
          status: dbCupom.utilizado ? "utilizado" : "disponivel",
          utilizado_em: dbCupom.utilizado_em,
          balconista_resgatou: dbCupom.utilizado_unidade,
        } as any;
      }
    }

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
