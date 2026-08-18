// =============================================================================
// API: Busca cliente por WhatsApp (Isolado por Loja / Franquia)
// POST & GET /api/fidelidade/cliente/buscar
// Params / Body: { whatsapp: string, unidade?: string }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { buscarClientePorWhatsapp } from "@/lib/fidelidade/mock-data";
import {
  buscarClientePorWhatsappDb,
  calcularVisitasPorUnidadeDb,
} from "@/lib/fidelidade/supabase-service";

async function processarBuscaCliente(zapInput: string, unidadeInput?: string) {
  const cleanDigits = String(zapInput).replace(/\D/g, "");

  if (!cleanDigits || cleanDigits.length < 8) {
    return { erro: "WhatsApp é obrigatório e deve conter DDD.", status: 400 };
  }

  const unidade = (unidadeInput || "").trim().toLowerCase();

  // 1. Busca no Supabase especificamente para ESTA unidade
  if (unidade) {
    const dbClienteNaLoja = await buscarClientePorWhatsappDb(cleanDigits, unidade);
    if (dbClienteNaLoja) {
      const visitasNestaLoja = await calcularVisitasPorUnidadeDb(cleanDigits, unidade);
      return {
        encontrado: true,
        cliente: {
          id: dbClienteNaLoja.id,
          nome: dbClienteNaLoja.nome,
          whatsapp: dbClienteNaLoja.whatsapp,
          nascimento: dbClienteNaLoja.nascimento,
          qtd_compras: Math.max(dbClienteNaLoja.total_visitas || 1, visitasNestaLoja - 1),
          unidade: dbClienteNaLoja.unidade_origem || unidade,
        },
      };
    }

    // Se NÃO está cadastrado nesta loja, busca se tem perfil em outra loja para pré-preencher nome/nasc
    const dbClienteOutraLoja = await buscarClientePorWhatsappDb(cleanDigits);
    return {
      encontrado: false,
      sugestao: dbClienteOutraLoja
        ? {
            nome: dbClienteOutraLoja.nome,
            nascimento: dbClienteOutraLoja.nascimento,
          }
        : null,
    };
  }

  // Busca genérica se não passou unidade
  let cliente = buscarClientePorWhatsapp(cleanDigits, unidade);
  if (!cliente) {
    const dbCliente = await buscarClientePorWhatsappDb(cleanDigits, unidade);
    if (dbCliente) {
      return {
        encontrado: true,
        cliente: {
          id: dbCliente.id,
          nome: dbCliente.nome,
          whatsapp: dbCliente.whatsapp,
          nascimento: dbCliente.nascimento,
          qtd_compras: dbCliente.total_visitas || 1,
          unidade: dbCliente.unidade_origem || "tatuape",
        },
      };
    }
  }

  if (cliente) {
    return {
      encontrado: true,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        whatsapp: cliente.whatsapp,
        nascimento: cliente.nascimento,
        qtd_compras: cliente.qtd_compras || 1,
        unidade: cliente.unidade_cadastro || cliente.loja_preferida || "tatuape",
      },
    };
  }

  return { encontrado: false };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const zapInput = body.whatsapp || body.celular || "";
    const unidadeInput = body.unidade || body.loja || "";
    const result = await processarBuscaCliente(zapInput, unidadeInput);

    if ("erro" in result) {
      return NextResponse.json({ erro: result.erro }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || "Erro interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zapInput = searchParams.get("whatsapp") || searchParams.get("celular") || "";
    const unidadeInput = searchParams.get("unidade") || searchParams.get("loja") || "";
    const result = await processarBuscaCliente(zapInput, unidadeInput);

    if ("erro" in result) {
      return NextResponse.json({ erro: result.erro }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || "Erro interno" }, { status: 500 });
  }
}
