// =============================================================================
// API: Validar status do código de vínculo / QR Code
// POST /api/fidelidade/codigo-vinculo/validar
// Body: { codigo, loja? }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { buscarCodigoVinculo } from "@/lib/fidelidade/mock-data";

export async function POST(req: NextRequest) {
  try {
    const { codigo, loja } = await req.json();

    if (!codigo) {
      return NextResponse.json(
        { valido: false, motivo: "codigo_ausente", mensagem: "Código não informado." },
        { status: 400 }
      );
    }

    const cv = buscarCodigoVinculo(codigo, loja);

    if (!cv) {
      return NextResponse.json({
        valido: false,
        motivo: "nao_encontrado",
        mensagem: "Código de compra / QR Code não encontrado.",
      });
    }

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
  } catch (err: any) {
    return NextResponse.json(
      { valido: false, erro: err?.message || "Erro ao validar código" },
      { status: 500 }
    );
  }
}
