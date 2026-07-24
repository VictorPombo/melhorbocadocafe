// =============================================================================
// API: Cadastra novo cliente
// POST /api/fidelidade/cliente/cadastrar
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  buscarClientePorWhatsapp,
  cadastrarCliente,
  getConfig,
} from "@/lib/fidelidade/mock-data";
import type { CanalAquisicao } from "@/lib/fidelidade/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, whatsapp, nascimento, canal_aquisicao, aceite_lgpd } = body;

    // Validações
    if (!nome || !whatsapp || !nascimento || !canal_aquisicao) {
      return NextResponse.json(
        { erro: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    if (!aceite_lgpd) {
      return NextResponse.json(
        { erro: "O aceite da política de privacidade é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se já existe
    const existente = buscarClientePorWhatsapp(whatsapp);
    if (existente) {
      return NextResponse.json(
        { erro: "Este WhatsApp já está cadastrado", cliente: { id: existente.id, nome: existente.nome } },
        { status: 409 }
      );
    }

    const lgpdVersao = getConfig("lgpd_texto_versao") || "1.0";

    const cliente = cadastrarCliente({
      nome,
      whatsapp: whatsapp.replace(/\D/g, ""),
      nascimento,
      canal_aquisicao: canal_aquisicao as CanalAquisicao,
      aceite_lgpd: true,
      aceite_lgpd_em: new Date().toISOString(),
      aceite_lgpd_texto_versao: lgpdVersao,
    });

    return NextResponse.json({
      sucesso: true,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        whatsapp: cliente.whatsapp,
      },
    });
  } catch {
    return NextResponse.json(
      { erro: "Erro interno" },
      { status: 500 }
    );
  }
}
