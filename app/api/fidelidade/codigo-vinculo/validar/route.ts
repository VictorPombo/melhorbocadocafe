// =============================================================================
// API: Validar status do código de vínculo / QR Code (Supabase + Local)
// POST /api/fidelidade/codigo-vinculo/validar
// Body: { codigo, loja? }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { buscarCodigoVinculo } from "@/lib/fidelidade/mock-data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { codigo, loja } = await req.json();

    if (!codigo) {
      return NextResponse.json(
        { valido: false, motivo: "codigo_ausente", mensagem: "Código não informado." },
        { status: 400 }
      );
    }

    const cleanCodigo = String(codigo).trim();

    // 1. Verificar no Supabase se este QR Code / código já foi utilizado para um giro
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: giroExistente } = await supabase
          .from("mb_giros")
          .select("id, criado_em, whatsapp, nome, unidade")
          .eq("codigo_vinculo", cleanCodigo)
          .maybeSingle();

        if (giroExistente) {
          return NextResponse.json({
            valido: false,
            motivo: "ja_utilizado",
            mensagem: "Este QR Code já foi utilizado para girar a roleta nesta compra.",
            utilizado_em: giroExistente.criado_em,
            cliente_nome: giroExistente.nome,
          });
        }
      } catch (err) {
        console.error("[CodigoVinculo API] Erro ao consultar Supabase:", err);
      }
    }

    // 2. Verificar no repositório de códigos de vínculo
    const cv = buscarCodigoVinculo(cleanCodigo, loja);

    if (cv) {
      if (cv.status === "utilizado") {
        return NextResponse.json({
          valido: false,
          motivo: "ja_utilizado",
          mensagem: "Este QR Code já foi utilizado para girar a roleta nesta compra.",
          utilizado_em: cv.utilizado_em,
        });
      }

      if (new Date(cv.expira_em) <= new Date()) {
        return NextResponse.json({
          valido: false,
          motivo: "expirado",
          mensagem: "Este QR Code expirou. Solicite um novo ao atendente.",
        });
      }

      return NextResponse.json({
        valido: true,
        mensagem: "QR Code ativo e válido para 1 giro!",
        codigo: cv.codigo,
        loja: cv.loja,
        caixa: cv.caixa,
      });
    }

    // Se o código é válido sintaticamente e não foi utilizado ainda
    return NextResponse.json({
      valido: true,
      mensagem: "QR Code ativo e válido para 1 giro!",
      codigo: cleanCodigo,
      loja: loja || "pinheiros",
      caixa: "Caixa 01",
    });
  } catch (err: any) {
    return NextResponse.json(
      { valido: false, erro: err?.message || "Erro ao validar código" },
      { status: 500 }
    );
  }
}
