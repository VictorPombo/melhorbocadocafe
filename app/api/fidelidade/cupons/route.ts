// =============================================================================
// API: Buscar cupons do cliente (Supabase Real-Time + Fallback)
// GET & POST /api/fidelidade/cupons
// Query / Body: { whatsapp }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  buscarClientePorWhatsapp,
  listarCuponsDoCliente,
  buscarPremioPorId,
} from "@/lib/fidelidade/mock-data";
import { buscarCuponsPorClienteWhatsappDb } from "@/lib/fidelidade/supabase-service";

async function processarBuscaCupons(zapInput: string) {
  const cleanDigits = String(zapInput).replace(/\D/g, "");

  if (!cleanDigits || cleanDigits.length < 8) {
    return { erro: "Por favor, digite seu WhatsApp com DDD.", status: 400 };
  }

  // 1. Tentar consultar no Supabase Postgres (Persistência Real)
  try {
    const resDb = await buscarCuponsPorClienteWhatsappDb(cleanDigits);
    if (resDb && Array.isArray(resDb.cupons) && resDb.cupons.length > 0) {
      return {
        sucesso: true,
        cliente: { nome: resDb.cliente?.nome || "Cliente" },
        cliente_nome: resDb.cliente?.nome || "Cliente",
        cupons: resDb.cupons,
      };
    }
  } catch (dbErr) {
    console.error("[Cupons API] Erro ao consultar Supabase:", dbErr);
  }

  // 2. Fallback em memória
  const cliente = buscarClientePorWhatsapp(cleanDigits);
  const cuponsRaw = listarCuponsDoCliente(cliente?.id || cleanDigits);

  const nomeCliente = cliente?.nome || cuponsRaw[0]?.cliente_nome || "Cliente";

  const cupons = cuponsRaw.map((cupom) => {
    const premio = buscarPremioPorId(cupom.premio_id);
    return {
      ...cupom,
      unidade: cupom.unidade === "itaim_bibi" ? "pinheiros" : cupom.unidade,
      premio: premio || {
        id: cupom.premio_id,
        nome: "Brinde Especial Melhor Bocado",
        tipo: "produto",
        valor: 0,
        probabilidade: 10,
        posicao_roleta: 1,
        ativo: true,
        limite_diario: null,
        limite_mensal: null,
        cor_fatia: "#e6398f",
        icone: "🎁",
      },
    };
  });

  return {
    sucesso: true,
    cliente: { nome: nomeCliente },
    cliente_nome: nomeCliente,
    cupons,
  };
}

export async function GET(req: NextRequest) {
  try {
    const zap = req.nextUrl.searchParams.get("whatsapp") || req.nextUrl.searchParams.get("celular") || "";
    const result = await processarBuscaCupons(zap);
    if ("erro" in result) {
      return NextResponse.json({ erro: result.erro }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const zapInput = body.whatsapp || body.celular || "";
    const result = await processarBuscaCupons(zapInput);
    if ("erro" in result) {
      return NextResponse.json({ erro: result.erro }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || "Erro interno" }, { status: 500 });
  }
}
