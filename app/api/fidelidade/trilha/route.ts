// =============================================================================
// API: Gestão da Trilha de Visitas de Fidelidade por Unidade / Franquia
// GET: Retorna as etapas da trilha da unidade ou geral
// PUT: Salva/reseta a trilha da unidade específica ou da rede
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  listarTrilhaVisitas,
  atualizarEtapaTrilha,
  salvarTrilhaCompleta,
  resetarTrilhaPadrao,
  obterConfiguracaoVisita,
} from "@/lib/fidelidade/mock-data";
import {
  buscarTrilhaDb,
  salvarTrilhaDb,
  resetarTrilhaDb,
} from "@/lib/fidelidade/supabase-service";
import type { EtapaTrilhaVisita } from "@/lib/fidelidade/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitaParam = searchParams.get("visita");
    const unidadeParam = searchParams.get("unidade") || searchParams.get("loja") || "geral";

    if (visitaParam) {
      const etapa = obterConfiguracaoVisita(Number(visitaParam));
      return NextResponse.json({ sucesso: true, etapa });
    }

    // 1. Tenta buscar no Supabase pela unidade solicitada
    const dbTrilha = await buscarTrilhaDb(unidadeParam);
    if (dbTrilha && dbTrilha.length > 0) {
      return NextResponse.json({
        sucesso: true,
        trilha: dbTrilha,
        unidade: unidadeParam,
      });
    }

    // 2. Fallback
    const trilha = listarTrilhaVisitas();
    return NextResponse.json({ sucesso: true, trilha, unidade: "geral" });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro ao listar trilha de visitas" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const unidadeAlvo = (body.unidade || body.loja || "geral").toLowerCase();

    // Ação de restauração de fábrica
    if (body.acao === "resetar") {
      await resetarTrilhaDb(unidadeAlvo);
      const trilhaRestaurada = (await buscarTrilhaDb(unidadeAlvo)) || resetarTrilhaPadrao();
      return NextResponse.json({
        sucesso: true,
        mensagem: `Trilha de visitas restaurada para o padrão (${unidadeAlvo === "geral" || unidadeAlvo === "todas" ? "Rede Geral" : unidadeAlvo})!`,
        trilha: trilhaRestaurada,
        unidade: unidadeAlvo,
      });
    }

    // Salvar trilha completa
    if (Array.isArray(body.trilha)) {
      await salvarTrilhaDb(body.trilha, unidadeAlvo);
      salvarTrilhaCompleta(body.trilha);
      return NextResponse.json({
        sucesso: true,
        mensagem: `Trilha de visitas salva com sucesso para ${unidadeAlvo === "geral" || unidadeAlvo === "todas" ? "a Rede Geral" : `a unidade ${unidadeAlvo}`}!`,
        trilha: body.trilha,
        unidade: unidadeAlvo,
      });
    }

    // Atualizar etapa específica
    if (body.visita && typeof body.visita === "number") {
      const res = atualizarEtapaTrilha(body.visita, body.dados || {});
      return NextResponse.json(res);
    }

    return NextResponse.json(
      { erro: "Parâmetros inválidos para atualização da trilha." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro ao atualizar trilha de visitas" },
      { status: 500 }
    );
  }
}
