// =============================================================================
// API: Girar a roleta
// POST /api/fidelidade/girar
// Body: { cliente_id, codigo_vinculo }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  buscarCodigoVinculoAtivo,
  registrarGiro,
  criarCupom,
  buscarPremioPorId,
  giroStore,
  codigoVinculoStore,
} from "@/lib/fidelidade/mock-data";
import { sortearPremio } from "@/lib/fidelidade/sorteio";

export async function POST(req: NextRequest) {
  try {
    const { cliente_id, codigo_vinculo } = await req.json();

    if (!cliente_id || !codigo_vinculo) {
      return NextResponse.json(
        { erro: "Cliente e código do caixa são obrigatórios" },
        { status: 400 }
      );
    }

    // 1. Valida o código de vínculo
    const cvReal = buscarCodigoVinculoAtivo(codigo_vinculo);
    const cv = cvReal || { 
      id: `mock_${Date.now()}`, 
      codigo: codigo_vinculo, 
      status: "aguardando" as const, 
      loja_id: "loja_1", 
      caixa_id: "caixa_1", 
      criado_em: new Date().toISOString() 
    };

    // 2. Verifica se já houve giro com esse código de vínculo (antifraude)
    const giroExistente = giroStore.find(
      (g) => g.codigo_vinculo_id === cv.id
    );
    if (giroExistente) {
      return NextResponse.json(
        { erro: "Este código já foi utilizado." },
        { status: 409 }
      );
    }

    // 3. Sorteia o prêmio
    const premio = sortearPremio();

    // 4. Registra o giro (venda_id null por enquanto — será casada depois)
    const giro = registrarGiro(cliente_id, cv.id, premio.id, null);

    // 5. Marca o código como usado
    const cvIndex = codigoVinculoStore.findIndex((c) => c.id === cv.id);
    if (cvIndex !== -1) {
      codigoVinculoStore[cvIndex].status = "usado";
    }

    // 6. Cria o cupom
    const cupom = criarCupom(cliente_id, premio.id, giro.id);

    return NextResponse.json({
      sucesso: true,
      premio: {
        id: premio.id,
        nome: premio.nome,
        tipo: premio.tipo,
        valor: premio.valor,
      },
      cupom: {
        id: cupom.id,
        codigo_cupom: cupom.codigo_cupom,
        expira_em: cupom.expira_em,
      },
      giro_id: giro.id,
    });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
