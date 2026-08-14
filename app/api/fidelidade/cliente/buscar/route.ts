// =============================================================================
// API: Busca cliente por WhatsApp
// POST /api/fidelidade/cliente/buscar
// Body: { whatsapp: string }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { buscarClientePorWhatsapp } from "@/lib/fidelidade/mock-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const zapInput = body.whatsapp || body.celular || "";
    const cleanDigits = String(zapInput).replace(/\D/g, "");

    if (!cleanDigits || cleanDigits.length < 8) {
      return NextResponse.json(
        { erro: "WhatsApp é obrigatório e deve conter DDD." },
        { status: 400 }
      );
    }

    const cliente = buscarClientePorWhatsapp(cleanDigits);

    if (cliente) {
      return NextResponse.json({
        encontrado: true,
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          whatsapp: cliente.whatsapp,
          nascimento: cliente.nascimento,
          qtd_compras: cliente.qtd_compras || 1,
          unidade: cliente.unidade_cadastro || cliente.loja_preferida || "tatuape",
        },
      });
    }

    return NextResponse.json({ encontrado: false });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro interno" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zapInput = searchParams.get("whatsapp") || searchParams.get("celular") || "";
    const cleanDigits = String(zapInput).replace(/\D/g, "");

    if (!cleanDigits || cleanDigits.length < 8) {
      return NextResponse.json(
        { erro: "WhatsApp é obrigatório e deve conter DDD." },
        { status: 400 }
      );
    }

    const cliente = buscarClientePorWhatsapp(cleanDigits);

    if (cliente) {
      return NextResponse.json({
        encontrado: true,
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          whatsapp: cliente.whatsapp,
          nascimento: cliente.nascimento,
          qtd_compras: cliente.qtd_compras || 1,
          unidade: cliente.unidade_cadastro || cliente.loja_preferida || "tatuape",
        },
      });
    }

    return NextResponse.json({ encontrado: false });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro interno" },
      { status: 500 }
    );
  }
}
