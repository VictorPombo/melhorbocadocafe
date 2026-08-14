import { NextResponse } from "next/server";
import { limparTudo } from "@/lib/fidelidade/mock-data";

export async function POST() {
  limparTudo();
  return NextResponse.json({ sucesso: true, mensagem: "Base de dados zerada com sucesso para testes reais." });
}

export async function GET() {
  limparTudo();
  return NextResponse.json({ sucesso: true, mensagem: "Base de dados zerada com sucesso para testes reais." });
}
