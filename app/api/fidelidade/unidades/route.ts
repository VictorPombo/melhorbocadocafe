// =============================================================================
// API: Gestão de Lojas & Franquias
// GET: Retorna todas as lojas cadastradas
// POST: Cadastra uma nova loja / franquia
// PUT: Atualiza dados de uma loja existente
// DELETE: Desativa ou remove uma loja
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  listarUnidades,
  cadastrarUnidade,
  atualizarUnidade,
  removerUnidade,
} from "@/lib/fidelidade/mock-data";

export async function GET() {
  try {
    const unidades = listarUnidades();
    return NextResponse.json({ sucesso: true, unidades });
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || "Erro ao listar unidades" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.nome || typeof body.nome !== "string" || body.nome.trim().length === 0) {
      return NextResponse.json({ erro: "Nome da loja é obrigatório." }, { status: 400 });
    }

    const novaUnidade = cadastrarUnidade({
      nome: body.nome.trim(),
      cidade: body.cidade || "São Paulo - SP",
      bairro: body.bairro || "",
      endereco: body.endereco || "",
      telefone: body.telefone || "",
      caixas: Array.isArray(body.caixas) && body.caixas.length > 0 ? body.caixas : ["Caixa 01"],
      id: body.id,
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Loja cadastrada com sucesso!",
      unidade: novaUnidade,
      unidades: listarUnidades(),
    });
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || "Erro ao cadastrar unidade" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ erro: "ID da loja é obrigatório." }, { status: 400 });
    }

    const unidadeAtualizada = atualizarUnidade(body.id, body.dados || {});
    if (!unidadeAtualizada) {
      return NextResponse.json({ erro: "Loja não encontrada." }, { status: 404 });
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Loja atualizada com sucesso!",
      unidade: unidadeAtualizada,
      unidades: listarUnidades(),
    });
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || "Erro ao atualizar unidade" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ erro: "ID da loja é obrigatório." }, { status: 400 });
    }

    const removido = removerUnidade(id);
    if (!removido) {
      return NextResponse.json(
        { erro: "Não é possível remover a loja ou ela não foi encontrada." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Loja removida com sucesso!",
      unidades: listarUnidades(),
    });
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || "Erro ao remover unidade" }, { status: 500 });
  }
}
