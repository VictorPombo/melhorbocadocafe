"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Printer,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Store,
  Users,
  Target,
  Sparkles,
  Gift,
  CheckCircle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Lock,
  Zap,
  ArrowRight,
  Maximize2,
  RefreshCw,
  Sliders,
  Settings,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";

export default function GuiaApresentacaoPage() {
  const [copiado, setCopiado] = useState<string | null>(null);

  function copiarLink(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  }

  function handleImprimir() {
    window.print();
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://melhorbocadocafe.vercel.app";

  const LINKS_FRANQUIA = [
    {
      id: "qrcode",
      titulo: "1. Gerador de QR Code de Balcão (Display & Totem)",
      descricao: "Tela de balcão com modo Tela Cheia e botão de recarga rápida a cada cliente.",
      path: "/gestao/fidelidade?tab=qrcode",
      badge: "Operação Balcão",
      cor: "bg-pink-50 text-[#e6398f] border-pink-200",
    },
    {
      id: "roleta",
      titulo: "2. Simulação da Roleta do Cliente (Mobile)",
      descricao: "Ambiente do cliente para escanear, cadastrar WhatsApp/idade e girar a roleta.",
      path: "/fidelidade/girar?unidade=tatuape",
      badge: "Cliente Mobile",
      cor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      id: "caixa",
      titulo: "3. Terminal de Validação do Caixa",
      descricao: "Painel do operador para digitar o código do cliente e aplicar o prêmio na compra.",
      path: "/gestao/fidelidade/caixa",
      badge: "Operação Caixa",
      cor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "clientes",
      titulo: "4. Base de Clientes da Franquia",
      descricao: "Visualização e busca de clientes fidelizados cadastrados exclusivamente na sua loja.",
      path: "/gestao/fidelidade/clientes",
      badge: "CRM Franquia",
      cor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "painel",
      titulo: "5. Painel Geral de Métricas & Fidelidade",
      descricao: "Dashboard com giros, cupons resgatados e taxa de conversão da sua unidade.",
      path: "/gestao/fidelidade",
      badge: "Gestão Loja",
      cor: "bg-blue-50 text-blue-700 border-blue-200",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 sm:px-6 lg:px-8 text-stone-900 print:bg-white print:p-0">
      {/* Barra de Ações Superior (Não impressa) */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-stone-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-[#e6398f]">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900">
              Guia Operacional das Franquias • Melhor Bocado
            </h2>
            <p className="text-xs text-gray-500">
              Tutorial oficial de uso para Franqueados, Gerentes e Operadores de Caixa.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/gestao/fidelidade"
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Voltar ao Painel
          </Link>

          <button
            onClick={handleImprimir}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] text-white font-extrabold text-xs shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Salvar em PDF / Imprimir</span>
          </button>
        </div>
      </div>

      {/* DOCUMENTO PRINCIPAL (FORMATO FOLHA EXECUTIVA / RELATÓRIO) */}
      <main className="max-w-5xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xl print:border-none print:shadow-none print:p-4 print:rounded-none">
        {/* CABEÇALHO DO MANUAL */}
        <header className="border-b-2 border-stone-200 pb-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100 text-[#e6398f] font-black text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Manual de Operação & Treinamento das Franquias</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Sistema de Fidelidade & Roleta da Franquia
            </h1>
            <p className="text-stone-500 text-sm mt-1 font-medium">
              Melhor Bocado Café & Confeitaria • Plataforma Integrada de Balcão, Caixa e Fidelização
            </p>
          </div>

          <div className="text-left sm:text-right bg-stone-50 p-4 rounded-2xl border border-stone-100 sm:bg-transparent sm:p-0 sm:border-none">
            <span className="text-[11px] uppercase tracking-widest font-extrabold text-stone-400 block">
              Versão Homologada
            </span>
            <span className="text-base font-black text-stone-800">
              Franquias v2.4 (Enterprise)
            </span>
            <p className="text-xs text-stone-400 mt-0.5">
              Atualização: {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>
        </header>

        {/* 1. VISÃO GERAL & PROPOSTA PARA A LOJA */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-stone-900 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-pink-100 text-[#e6398f] flex items-center justify-center text-sm font-black">1</span>
            Objetivo do Sistema na sua Franquia
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-4">
            O <strong>Sistema de Fidelidade Melhor Bocado</strong> transforma cada compra casual no balcão em uma experiência gamificada memorável. O cliente ganha 1 giro na Roleta por compra, cadastrando seu WhatsApp e data de nascimento. Isso gera **recorrência contínua**, aumenta o ticket médio da loja e alimenta a sua base exclusiva de clientes com dados demográficos reais.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="text-2xl mb-1 block">🏪</span>
              <h4 className="font-extrabold text-stone-900 text-sm">Isolamento Multi-Tenant</h4>
              <p className="text-xs text-stone-500 mt-1">
                Sua franquia tem acesso exclusivo aos seus clientes, giros e terminais. Nenhuma outra loja visualiza seus dados.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="text-2xl mb-1 block">🛡️</span>
              <h4 className="font-extrabold text-stone-900 text-sm">Antifraude de 1 Giro</h4>
              <p className="text-xs text-stone-500 mt-1">
                Cada QR Code de compra expira imediatamente após o primeiro giro do cliente, impedindo duplicidades.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="text-2xl mb-1 block">📱</span>
              <h4 className="font-extrabold text-stone-900 text-sm">Zero Instalação</h4>
              <p className="text-xs text-stone-500 mt-1">
                O cliente não precisa baixar nenhum app: abre direto na câmera do celular em segundos.
              </p>
            </div>
          </div>
        </section>

        {/* 2. LINKS DIRETOS PARA OPERAÇÃO E TESTES */}
        <section className="mb-10 page-break">
          <h2 className="text-xl font-black text-stone-900 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-pink-100 text-[#e6398f] flex items-center justify-center text-sm font-black">2</span>
            Links Operacionais para a Equipe da Loja
          </h2>
          <p className="text-stone-600 text-sm mb-4">
            Utilize os links diretos abaixo para operar e testar todos os módulos da sua franquia:
          </p>

          <div className="space-y-3">
            {LINKS_FRANQUIA.map((link) => {
              const fullUrl = `${baseUrl}${link.path}`;
              return (
                <div
                  key={link.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-pink-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${link.cor}`}>
                        {link.badge}
                      </span>
                      <h4 className="font-extrabold text-stone-900 text-sm">
                        {link.titulo}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-500">{link.descricao}</p>
                    <p className="text-[11px] font-mono text-stone-400 break-all">{fullUrl}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 print:hidden">
                    <button
                      onClick={() => copiarLink(fullUrl, link.id)}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      {copiado === link.id ? "✓ Copiado" : "Copiar Link"}
                    </button>

                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <span>Acessar</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. TUTORIAL PASSO A PASSO DA OPERAÇÃO DE BALCÃO */}
        <section className="mb-10 space-y-6 page-break">
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-pink-100 text-[#e6398f] flex items-center justify-center text-sm font-black">3</span>
            Tutorial Passo a Passo da Operação na Franquia
          </h2>

          {/* PASSO 1: BALCÃO / DISPLAY */}
          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-pink-100 text-[#e6398f]">
                <Store className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Passo 1: Preparar o Display / Tablet do Balcão
                </h3>
                <span className="text-xs text-stone-500">Operação no Início do Turno</span>
              </div>
            </div>

            <ol className="space-y-2.5 text-xs text-stone-700 list-decimal list-inside font-medium leading-relaxed">
              <li>
                O atendente entra no painel com o login da franquia e acessa a aba <strong>Gerador de QR Code</strong> (<code className="bg-stone-200 px-1.5 py-0.5 rounded font-mono">/gestao/fidelidade</code>).
              </li>
              <li>
                Selecione o <strong>Terminal / Caixa</strong> (ex: Caixa 01, Tablet Balcão ou Totem). Se precisar criar novos terminais, basta clicar no botão <strong>&ldquo;⚙️ Editar Terminais&rdquo;</strong>.
              </li>
              <li>
                Clique em <strong>&ldquo;Gerar Novo QR Code de 1 Giro&rdquo;</strong>.
              </li>
              <li>
                Para colocar no tablet virado para o cliente, clique no botão <strong>&ldquo;⛶ Tela Cheia&rdquo;</strong>. A tela expandirá em modo Totem Kiosk sem barras de navegação.
              </li>
              <li>
                <strong>Recarga Rápida:</strong> A cada cliente que finalizar a compra, clique no botão compacto <strong>&ldquo;↻ Recarregar&rdquo;</strong> localizado no canto inferior do QR code para gerar o próximo código em 1 segundo.
              </li>
            </ol>
          </div>

          {/* PASSO 2: CLIENTE */}
          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Smartphone className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Passo 2: O Cliente Escaneia & Gira a Roleta
                </h3>
                <span className="text-xs text-stone-500">Experiência Mobile Gamificada</span>
              </div>
            </div>

            <ol className="space-y-2.5 text-xs text-stone-700 list-decimal list-inside font-medium leading-relaxed">
              <li>
                O cliente aponta a câmera do celular para o QR Code exibido no display ou comanda.
              </li>
              <li>
                A tela da Roleta abre na hora com os campos de identificação: <strong>Nome Completo</strong>, <strong>WhatsApp com DDD</strong> e <strong>Data de Nascimento (DD/MM/AAAA)</strong>.
              </li>
              <li>
                O cliente clica em <strong>&ldquo;Girar a Roleta!&rdquo;</strong>. A roleta gira com efeitos sonoros mecânicos e sorteia o prêmio/desconto.
              </li>
              <li>
                O cliente recebe imediatamente o <strong>Código do Cupom de Resgate</strong> (ex: <code className="bg-stone-200 px-1.5 py-0.5 rounded font-mono font-bold text-stone-900">MB-88A2</code>) com validade e detalhes do benefício.
              </li>
              <li>
                <strong>Reconhecimento Automático:</strong> Clientes que já giraram anteriormente são reconhecidos pelo WhatsApp, acumulando histórico e avançando na Trilha de Fidelidade da sua loja.
              </li>
            </ol>
          </div>

          {/* PASSO 3: CAIXA / RESGATE */}
          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Passo 3: Validar e Baixar o Cupom no Caixa
                </h3>
                <span className="text-xs text-stone-500">Fechamento do Resgate no Ponto de Venda</span>
              </div>
            </div>

            <ol className="space-y-2.5 text-xs text-stone-700 list-decimal list-inside font-medium leading-relaxed">
              <li>
                O cliente apresenta o código do cupom na tela do celular ao operador do caixa.
              </li>
              <li>
                O operador abre a tela <strong>Painel do Caixa</strong> (<code className="bg-stone-200 px-1.5 py-0.5 rounded font-mono text-[11px]">/gestao/fidelidade/caixa</code>).
              </li>
              <li>
                Digita o código (ex: <code className="bg-stone-200 px-1.5 py-0.5 rounded font-mono">MB-88A2</code>) e clica em <strong>&ldquo;Validar e Resgatar&rdquo;</strong>.
              </li>
              <li>
                O sistema confirma o prêmio (ex: Café Expresso Grátis ou 10% de Desconto), aplica no pedido e queima o cupom imediatamente.
              </li>
              <li>
                O resgate é contabilizado em tempo real no dashboard da franquia.
              </li>
            </ol>
          </div>

          {/* PASSO 4: BASE DE CLIENTES & CRM */}
          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Passo 4: Gerenciar Base de Clientes da Unidade
                </h3>
                <span className="text-xs text-stone-500">Gestão de CRM & Inteligência de Público</span>
              </div>
            </div>

            <ol className="space-y-2.5 text-xs text-stone-700 list-decimal list-inside font-medium leading-relaxed">
              <li>
                Na aba lateral, clique em <strong>&ldquo;Base de Clientes&rdquo;</strong> (<code className="bg-stone-200 px-1.5 py-0.5 rounded font-mono text-[11px]">/gestao/fidelidade/clientes</code>).
              </li>
              <li>
                Consulte todos os clientes cadastrados na sua loja, com dados de WhatsApp, idade, quantidade de visitas e prêmios resgatados.
              </li>
              <li>
                Utilize a busca rápida por nome ou celular para localizar clientes em atendimento.
              </li>
              <li>
                Na aba <strong>Público-Alvo & Demografia</strong>, visualize os gráficos de faixas etárias e frequência de retorno da sua franquia.
              </li>
            </ol>
          </div>
        </section>

        {/* 4. BLINDAGEM DE SEGURANÇA MULTI-TENANT */}
        <section className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-950 text-white shadow-xl">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Blindagem de Segurança & Regras da Franquia</span>
          </div>

          <h3 className="text-xl font-black mb-3">
            Segurança Operacional e Confidencialidade de Dados
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-300">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <h5 className="font-bold text-white mb-1">🔒 Controle de Acesso por Login</h5>
              <p>
                Todas as telas administrativas são protegidas por Middleware no servidor. Cada franqueado visualiza estritamente os dados, clientes e relatórios da sua respectiva unidade.
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <h5 className="font-bold text-white mb-1">⚡ Validade Atômica de Cupons</h5>
              <p>
                Os cupons possuem prazo de validade configurado e só podem ser baixados 1 única vez no caixa da unidade autorizada, garantindo total controle financeiro.
              </p>
            </div>
          </div>
        </section>

        {/* ASSINATURA / RODAPÉ */}
        <footer className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>
            Melhor Bocado Café & Confeitaria • Guia Oficial de Treinamento das Franquias.
          </p>
          <p className="font-mono">
            Documento de homologação técnica e operacional.
          </p>
        </footer>
      </main>
    </div>
  );
}
