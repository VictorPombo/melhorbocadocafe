// =============================================================================
// API: Busca cliente por WhatsApp
// POST /api/fidelidade/cliente/buscar
// Body: { whatsapp: string }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { buscarClientePorWhatsapp } from "@/lib/fidelidade/mock-data";

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

    if (cliente) {
      return NextResponse.json({
        encontrado: true,
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          whatsapp: cliente.whatsapp,
        },
      });
    }

    return NextResponse.json({ encontrado: false });
  } catch {
    return NextResponse.json(
      { erro: "Erro interno" },
      { status: 500 }
    );
  }
}
