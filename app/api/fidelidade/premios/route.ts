// =============================================================================
// API: Listar e Atualizar Prêmios da Roleta (Painel de Gestão)
// GET /api/fidelidade/premios
// PUT /api/fidelidade/premios
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { listarPremios, atualizarPremio, resetarPremiosPadrao } from "@/lib/fidelidade/mock-data";
import type { Premio } from "@/lib/fidelidade/types";

export async function GET() {
  try {
    const premios = listarPremios();
    return NextResponse.json({
      sucesso: true,
      premios,
    });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro ao carregar prêmios" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { acao, premios, premio } = body;

    if (acao === "resetar") {
      const resetados = resetarPremiosPadrao();
      return NextResponse.json({
        sucesso: true,
        mensagem: "Prêmios restaurados para o padrão original.",
        premios: resetados,
      });
    }

    if (Array.isArray(premios)) {
      for (const p of premios) {
        if (p.id) {
          atualizarPremio(p.id, p);
        }
      }
      return NextResponse.json({
        sucesso: true,
        mensagem: "Todos os prêmios foram atualizados com sucesso!",
        premios: listarPremios(),
      });
    }

    if (premio && premio.id) {
      const res = atualizarPremio(premio.id, premio);
      if (!res.sucesso) {
        return NextResponse.json({ erro: res.erro }, { status: 400 });
      }
      return NextResponse.json({
        sucesso: true,
        mensagem: "Prêmio atualizado com sucesso!",
        premio: res.premio,
      });
    }

    return NextResponse.json(
      { erro: "Parâmetros inválidos para atualização de prêmios." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro ao salvar alterações nos prêmios" },
      { status: 500 }
    );
  }
}
