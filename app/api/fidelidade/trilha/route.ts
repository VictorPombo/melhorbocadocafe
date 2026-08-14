// =============================================================================
// API: Gestão da Trilha de Visitas de Fidelidade (1ª a 10ª Visita)
// GET: Retorna as 10 etapas da trilha
// PUT: Atualiza uma etapa específica ou a trilha inteira / reseta padrão
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  listarTrilhaVisitas,
  atualizarEtapaTrilha,
  salvarTrilhaCompleta,
  resetarTrilhaPadrao,
  obterConfiguracaoVisita,
} from "@/lib/fidelidade/mock-data";
import type { EtapaTrilhaVisita } from "@/lib/fidelidade/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitaParam = searchParams.get("visita");

    if (visitaParam) {
      const etapa = obterConfiguracaoVisita(Number(visitaParam));
      return NextResponse.json({ sucesso: true, etapa });
    }

    const trilha = listarTrilhaVisitas();
    return NextResponse.json({ sucesso: true, trilha });
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

    // Ação de restauração de fábrica
    if (body.acao === "resetar") {
      const trilhaRestaurada = resetarTrilhaPadrao();
      return NextResponse.json({
        sucesso: true,
        mensagem: "Trilha de visitas restaurada para o padrão!",
        trilha: trilhaRestaurada,
      });
    }

    // Salvar trilha completa
    if (Array.isArray(body.trilha)) {
      const res = salvarTrilhaCompleta(body.trilha);
      return NextResponse.json(res);
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
