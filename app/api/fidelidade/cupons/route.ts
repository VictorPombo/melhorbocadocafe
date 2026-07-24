// =============================================================================
// API: Buscar cupons do cliente
// POST /api/fidelidade/cupons
// Body: { whatsapp }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  buscarClientePorWhatsapp,
  listarCuponsDoCliente,
  buscarPremioPorId,
} from "@/lib/fidelidade/mock-data";

export async function POST(req: NextRequest) {
  try {
    const { whatsapp } = await req.json();

    if (!whatsapp) {
      return NextResponse.json(
        { erro: "WhatsApp é obrigatório" },
        { status: 400 }
      );
    }

    const cliente = buscarClientePorWhatsapp(whatsapp);
    if (!cliente) {
      return NextResponse.json(
        { erro: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const cupons = listarCuponsDoCliente(cliente.id).map((cupom) => {
      const premio = buscarPremioPorId(cupom.premio_id);
      return {
        id: cupom.id,
        codigo_cupom: cupom.codigo_cupom,
        status: cupom.status,
        criado_em: cupom.criado_em,
        expira_em: cupom.expira_em,
        utilizado_em: cupom.utilizado_em,
        premio: premio
          ? { nome: premio.nome, tipo: premio.tipo, valor: premio.valor }
          : null,
      };
    });

    return NextResponse.json({
      cliente: { nome: cliente.nome },
      cupons,
    });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
