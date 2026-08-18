// =============================================================================
// API: Girar a roleta gamificada (com Trava Antifraude & Deduplicação)
// POST /api/fidelidade/girar
// Body: { visitor_id, nome, nascimento, whatsapp, unidade, codigo_vinculo? }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  registrarGiro,
  criarCupom,
  calcularNumeroVisita,
  buscarOuCriarClienteIdentificado,
  consumirCodigoVinculo,
  buscarCodigoVinculo,
} from "@/lib/fidelidade/mock-data";
import { sortearPremio } from "@/lib/fidelidade/sorteio";
import { salvarClienteDb, salvarGiroDb, salvarCupomDb } from "@/lib/fidelidade/supabase-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      visitor_id,
      nome,
      nascimento,
      whatsapp,
      celular,
      unidade = "tatuape",
      codigo_vinculo,
      cliente_id,
    } = body;

    const zapInput = (whatsapp || celular || "").trim();

    if (!visitor_id) {
      return NextResponse.json(
        { erro: "Identificador de visitante é obrigatório." },
        { status: 400 }
      );
    }

    if (!nome || !nascimento || !unidade || !zapInput) {
      return NextResponse.json(
        {
          erro: "Por favor, preencha todos os campos obrigatórios: Nome Completo, Data de Nascimento, Celular/WhatsApp e Unidade.",
        },
        { status: 400 }
      );
    }

    // 1. Identificação única e deduplicação do cliente por WhatsApp + Nome + Nascimento
    const { cliente: clienteResolvido, ehNovoCliente, visitaNumero } =
      buscarOuCriarClienteIdentificado(
        nome,
        nascimento,
        zapInput,
        unidade,
        visitor_id
      );
    const currentClienteId = clienteResolvido.id;

    // 2. Trava Antifraude de Uso Único de QR Code / Código de Compra
    const vinculoCode = (codigo_vinculo || "").trim();

    if (!vinculoCode) {
      return NextResponse.json(
        {
          erro: "QR Code obrigatório. Para girar a roleta, aponte a câmera do seu celular para o QR Code gerado no balcão da loja.",
          requer_qrcode: true,
        },
        { status: 400 }
      );
    }

    // Validação de uso único no banco de dados Supabase para esta loja
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: giroExistente } = await supabase
          .from("mb_giros")
          .select("id, criado_em")
          .eq("codigo_vinculo", vinculoCode)
          .eq("unidade", unidade)
          .maybeSingle();

        if (giroExistente) {
          return NextResponse.json(
            {
              erro: "Este QR Code já foi utilizado nesta compra. Cada compra dá direito a 1 giro exclusivo. Para girar novamente, solicite um novo QR Code ao atendente em sua próxima compra!",
              ja_utilizado: true,
            },
            { status: 400 }
          );
        }
      } catch (err) {
        console.error("[Girar API] Erro ao validar trava do QR Code no Supabase:", err);
      }
    }

    const consumo = consumirCodigoVinculo(vinculoCode, unidade, currentClienteId);
    if (!consumo.sucesso) {
      if (consumo.motivo === "ja_utilizado") {
        return NextResponse.json(
          {
            erro: "Este QR Code já foi utilizado nesta compra. Cada compra dá direito a 1 giro exclusivo. Para girar novamente, solicite um novo QR Code ao atendente em sua próxima compra!",
            ja_utilizado: true,
          },
          { status: 400 }
        );
      }
      if (consumo.motivo === "expirado") {
        return NextResponse.json(
          {
            erro: "Este QR Code expirou o tempo de validade. Solicite um novo QR Code ao atendente.",
            expirado: true,
          },
          { status: 400 }
        );
      }
    }

    const finalVinculoCode = vinculoCode;

    // Tentar executar via Supabase RPC se configurado
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc("fn_sortear_girar_roleta", {
          p_visitor_id: visitor_id,
          p_codigo_vinculo: finalVinculoCode,
          p_cliente_id: currentClienteId,
          p_loja: unidade || "tatuape",
          p_caixa: "caixa_1",
          p_cliente_nome: nome,
          p_cliente_nascimento: nascimento,
          p_cliente_whatsapp: zapInput,
        });

        if (!error && data) {
          return NextResponse.json(data);
        }
      } catch {
        // Fallback em memória transparente
      }
    }

    // 3. Obter configuração da etapa da visita atual na Trilha de Fidelidade
    const { obterConfiguracaoVisita } = await import("@/lib/fidelidade/mock-data");
    const etapaVisita = obterConfiguracaoVisita(visitaNumero);

    let premioFinal: {
      id: string;
      nome: string;
      tipo: import("@/lib/fidelidade/types").TipoPremio;
      valor: number;
      posicao_roleta?: number;
      cor_fatia?: string;
      icone?: string;
    };

    let origemCupom: "roleta" | "trilha_fixa" = "roleta";

    if (etapaVisita.modo === "fixo" && etapaVisita.premio_fixo) {
      // Prêmio Fixo Direto da Trilha (sem roleta)
      origemCupom = "trilha_fixa";
      premioFinal = {
        id: `trilha_fixo_${etapaVisita.visita}`,
        nome: etapaVisita.premio_fixo.nome,
        tipo: etapaVisita.premio_fixo.tipo,
        valor: etapaVisita.premio_fixo.valor,
        posicao_roleta: 1,
        cor_fatia: etapaVisita.premio_fixo.cor,
        icone: etapaVisita.premio_fixo.icone,
      };
    } else {
      // Modo Roleta da Sorte (usa a roleta exclusiva da etapa se configurada, ou a roleta padrão)
      const sorteado = sortearPremio(
        etapaVisita.premios_roleta && etapaVisita.premios_roleta.length > 0
          ? etapaVisita.premios_roleta
          : undefined
      );
      origemCupom = "roleta";
      premioFinal = {
        id: sorteado.id,
        nome: sorteado.nome,
        tipo: sorteado.tipo,
        valor: sorteado.valor,
        posicao_roleta: sorteado.posicao_roleta,
        cor_fatia: sorteado.cor_fatia,
        icone: sorteado.icone,
      };
    }

    const giro = registrarGiro(
      visitor_id,
      finalVinculoCode,
      premioFinal.id,
      null,
      currentClienteId,
      unidade,
      nome,
      nascimento,
      zapInput
    );

    const cupom = criarCupom(
      visitor_id,
      premioFinal.id,
      giro.id,
      currentClienteId,
      unidade,
      visitaNumero,
      nome,
      nascimento,
      zapInput,
      origemCupom
    );

    // Persistência no Supabase (Database Postgres Real)
    try {
      const dbCliente = await salvarClienteDb({
        nome,
        whatsapp: zapInput,
        nascimento,
        visitor_id,
        unidade_origem: unidade,
        total_visitas: visitaNumero,
      });

      const effectiveClienteId = dbCliente?.id || currentClienteId;

      await salvarGiroDb({
        id: giro.id,
        visitor_id,
        codigo_vinculo: finalVinculoCode,
        premio_id: premioFinal.id,
        cliente_id: effectiveClienteId,
        unidade,
        nome,
        nascimento,
        whatsapp: zapInput,
      });

      await salvarCupomDb({
        id: cupom.id,
        codigo_cupom: cupom.codigo_cupom,
        cliente_id: effectiveClienteId,
        cliente_nome: nome,
        cliente_whatsapp: zapInput,
        giro_id: giro.id,
        premio_id: premioFinal.id,
        premio_nome: premioFinal.nome,
        premio_tipo: premioFinal.tipo,
        premio_valor: premioFinal.valor,
        premio_icone: premioFinal.icone,
        premio_cor: premioFinal.cor_fatia,
        unidade,
        visita_numero: visitaNumero,
        origem_cupom: origemCupom,
        expira_em: cupom.expira_em,
      });
    } catch (dbErr) {
      console.error("[Database] Erro ao sincronizar giro com Supabase:", dbErr);
    }

    return NextResponse.json({
      sucesso: true,
      modo: etapaVisita.modo,
      etapa: etapaVisita,
      giro_id: giro.id,
      visita_numero: visitaNumero,
      unidade,
      cliente_nome: nome,
      cliente_whatsapp: zapInput,
      eh_novo_cliente: ehNovoCliente,
      premio: premioFinal,
      cupom: {
        id: cupom.id,
        codigo_cupom: cupom.codigo_cupom,
        expira_em: cupom.expira_em,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro interno ao girar a roleta" },
      { status: 500 }
    );
  }
}
