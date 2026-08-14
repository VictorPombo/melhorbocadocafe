// =============================================================================
// API: Gerar código de vínculo / QR Code de compra para o caixa
// POST /api/fidelidade/codigo-vinculo
// Body: { loja, caixa }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { gerarCodigoVinculo, codigoVinculoStore } from "@/lib/fidelidade/mock-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { loja = "tatuape", caixa = "caixa_1" } = body;

    const cv = gerarCodigoVinculo(loja, caixa);

    let host = req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || "http";

    // Se estiver rodando localmente (localhost ou 127.0.0.1), usa o IP da rede local para o celular conseguir abrir via Wi-Fi
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      host = "192.168.15.10:3000";
    }

    const qrUrl = `${proto}://${host}/fidelidade/girar?codigo=${cv.codigo}&unidade=${loja}`;

    return NextResponse.json({
      sucesso: true,
      codigo: cv.codigo,
      loja: cv.loja,
      caixa: cv.caixa,
      status: cv.status,
      expira_em: cv.expira_em,
      id: cv.id,
      qr_url: qrUrl,
      qr_payload: qrUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro ao gerar código de compra" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loja = searchParams.get("loja");
    const caixa = searchParams.get("caixa");

    let codigos = [...codigoVinculoStore];
    if (loja) codigos = codigos.filter((c) => c.loja === loja);
    if (caixa) codigos = codigos.filter((c) => c.caixa === caixa);

    return NextResponse.json({
      sucesso: true,
      total: codigos.length,
      codigos: codigos.slice(-10).reverse(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro ao buscar códigos" },
      { status: 500 }
    );
  }
}
