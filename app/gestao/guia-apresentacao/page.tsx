"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  Layers,
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

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://melhorbocado.com.br";

  const LINKS_TESTE = [
    {
      id: "roleta",
      titulo: "1. Roleta de Fidelidade do Cliente (Simulação com QR Code Ativo)",
      descricao: "Simula o cliente abrindo a câmera e lendo a comanda da Unidade Tatuapé.",
      path: "/fidelidade/girar?codigo=TAT-8821&unidade=tatuape",
      badge: "Cliente Mobile",
      cor: "bg-pink-50 text-[#e6398f] border-pink-200",
    },
    {
      id: "cupons",
      titulo: "2. Carteira Digital de Cupons do Cliente",
      descricao: "Visualização dos cupons ganhos, prazos de validade e histórico.",
      path: "/fidelidade/meus-cupons",
      badge: "Cliente Mobile",
      cor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      id: "painel",
      titulo: "3. Painel de Gestão, Balcões & Roleta",
      descricao: "Gerador de QR codes de balcão por unidade, métricas ao vivo e editor dos 10 prêmios.",
      path: "/gestao/fidelidade",
      badge: "Administração",
      cor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "caixa",
      titulo: "4. Terminal de Validação do Caixa",
      descricao: "Tela do atendente para digitar ou ler o código do cupom e aplicar o desconto.",
      path: "/gestao/fidelidade/caixa",
      badge: "Operação Caixa",
      cor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 sm:px-6 lg:px-8 text-stone-900 print:bg-white print:p-0">
      {/* Barra de Ações Superior (Não impressa) */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-stone-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-[#e6398f]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900">
              Documento Executivo de Apresentação
            </h2>
            <p className="text-xs text-gray-500">
              Pronto para envio aos contratantes ou impressão em PDF.
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
        {/* CABEÇALHO DO DOCUMENTO */}
        <header className="border-b-2 border-stone-200 pb-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100 text-[#e6398f] font-black text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dossiê Técnico & Manual de Operação</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Sistema de Fidelidade & Gamificação
            </h1>
            <p className="text-stone-500 text-sm mt-1 font-medium">
              Melhor Bocado Café & Confeitaria • Plataforma Multilojas de Alta Conversão
            </p>
          </div>

          <div className="text-left sm:text-right bg-stone-50 p-4 rounded-2xl border border-stone-100 sm:bg-transparent sm:p-0 sm:border-none">
            <span className="text-[11px] uppercase tracking-widest font-extrabold text-stone-400 block">
              Versão Homologada
            </span>
            <span className="text-base font-black text-stone-800">
              Release 2.4.0 (Enterprise)
            </span>
            <p className="text-xs text-stone-400 mt-0.5">
              Data: {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>
        </header>

        {/* 1. SUMÁRIO EXECUTIVO */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-stone-900 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-pink-100 text-[#e6398f] flex items-center justify-center text-sm font-black">1</span>
            Sumário Executivo & Proposta de Valor
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-4">
            O <strong>Sistema de Fidelidade Melhor Bocado</strong> foi desenhado para transformar compradores casuais em clientes recorrentes de alto LTV (Lifetime Value). A plataforma combina gamificação em tempo real (Roleta Interativa com feedback sonoro e háptico), segurança antifraude atômica de uso único por compra e inteligência analítica de público-alvo para campanhas hiper-segmentadas de marketing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="text-2xl mb-1 block">🎰</span>
              <h4 className="font-extrabold text-stone-900 text-sm">Gamificação Imersiva</h4>
              <p className="text-xs text-stone-500 mt-1">
                Roleta SVG de alta legibilidade, tiques mecânicos sonoros e fanfarra de vitória na hora.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="text-2xl mb-1 block">🛡️</span>
              <h4 className="font-extrabold text-stone-900 text-sm">Antifraude Atômico</h4>
              <p className="text-xs text-stone-500 mt-1">
                Trava rigorosa de 1 giro por compra, QR Codes isolados por unidade e deduplicação inteligente por WhatsApp.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="text-2xl mb-1 block">🎯</span>
              <h4 className="font-extrabold text-stone-900 text-sm">Inteligência de CRM</h4>
              <p className="text-xs text-stone-500 mt-1">
                Segmentação demográfica por idade (nascimento), produtos favoritos e exportação direta para WhatsApp / Ads.
              </p>
            </div>
          </div>
        </section>

        {/* 2. LINKS DIRETOS PARA TESTE & HOMOLOGAÇÃO */}
        <section className="mb-10 page-break">
          <h2 className="text-xl font-black text-stone-900 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-pink-100 text-[#e6398f] flex items-center justify-center text-sm font-black">2</span>
            Links Diretos para Teste & Homologação dos Contratantes
          </h2>
          <p className="text-stone-600 text-sm mb-4">
            Utilize os links abaixo para validar em tempo real todos os módulos do sistema tanto no celular quanto no computador:
          </p>

          <div className="space-y-3">
            {LINKS_TESTE.map((link) => {
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
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all"
                    >
                      {copiado === link.id ? "✓ Copiado" : "Copiar Link"}
                    </button>

                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <span>Testar</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. GUIA PASSO A PASSO PARTE POR PARTE */}
        <section className="mb-10 space-y-6 page-break">
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-pink-100 text-[#e6398f] flex items-center justify-center text-sm font-black">3</span>
            Guia Operacional Passo a Passo (Parte por Parte)
          </h2>

          {/* PARTE 1: BALCÃO / CAIXA */}
          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-pink-100 text-[#e6398f]">
                <Store className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Parte 1: Operação no Balcão & Geração de QR Code
                </h3>
                <span className="text-xs text-stone-500">Fluxo do Atendente / Balconista</span>
              </div>
            </div>

            <ol className="space-y-2 text-xs text-stone-700 list-decimal list-inside font-medium leading-relaxed">
              <li>
                O atendente acessa o painel em <code className="bg-stone-200 px-1 py-0.5 rounded font-mono">/gestao/fidelidade</code> (Aba <strong>Gerador de QR Code</strong>).
              </li>
              <li>
                Seleciona a sua <strong>Unidade Ativa</strong> (ex: Tatuapé, Mooca, Campo Belo, Santana, Santo Amaro) e o <strong>Caixa</strong> correspondente.
              </li>
              <li>
                Clica em <strong>&ldquo;Gerar Novo QR Code de 1 Giro&rdquo;</strong>.
              </li>
              <li>
                O sistema exibe o QR Code em alta resolução na tela do tablet ou permite imprimir a comanda instantaneamente para entrega na mesa/balcão.
              </li>
              <li>
                <strong>Isolamento de Loja:</strong> Cada unidade opera seus próprios códigos com namespace exclusivo (ex: <code className="bg-stone-200 px-1 py-0.5 rounded font-mono">TAT-XXXX</code>), eliminando qualquer colisão ou interferência entre filiais.
              </li>
            </ol>
          </div>

          {/* PARTE 2: EXPERIÊNCIA DO CLIENTE */}
          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Smartphone className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Parte 2: Experiência Gamificada do Cliente
                </h3>
                <span className="text-xs text-stone-500">Fluxo do Cliente Mobile (Sem necessidade de baixar app)</span>
              </div>
            </div>

            <ol className="space-y-2 text-xs text-stone-700 list-decimal list-inside font-medium leading-relaxed">
              <li>
                O cliente aponta a câmera do celular para o QR Code da comanda ou do display do balcão.
              </li>
              <li>
                A tela abre diretamente na Roleta da Loja com os 4 campos obrigatórios de identificação: <strong>Nome Completo</strong>, <strong>Celular / WhatsApp (com DDD)</strong>, <strong>Data de Nascimento (DD/MM/AAAA)</strong> e <strong>Unidade</strong>.
              </li>
              <li>
                Ao clicar em <strong>&ldquo;Girar a Roleta!&rdquo;</strong>, o backend processa o sorteio ponderado, aciona a animação de rotação com tiques sonoros mecânicos sincronizados e fanfarra de vitória.
              </li>
              <li>
                O cliente recebe na hora o <strong>Código Alfanumérico de Resgate</strong> (ex: <code className="bg-stone-200 px-1 py-0.5 rounded font-mono">MB-88A2</code>) com validade e instruções.
              </li>
              <li>
                <strong>Deduplicação Inteligente:</strong> Ao informar o mesmo WhatsApp em visitas futuras, o sistema reconhece o cliente automaticamente, unifica seu histórico e contabiliza sua 2ª, 3ª ou 4ª visita sem gerar cadastros duplicados.
              </li>
            </ol>
          </div>

          {/* PARTE 3: GESTOR & CONFIGURADOR DE PRÊMIOS */}
          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Sliders className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Parte 3: Gestão & Configuração dos 10 Prêmios
                </h3>
                <span className="text-xs text-stone-500">Ajuste de Margem e Probabilidades</span>
              </div>
            </div>

            <ol className="space-y-2 text-xs text-stone-700 list-decimal list-inside font-medium leading-relaxed">
              <li>
                No painel administrativo, o gestor clica na aba <strong>&ldquo;Editar 10 Prêmios&rdquo;</strong>.
              </li>
              <li>
                Pode personalizar: <strong>Nome do Prêmio</strong> (ex: Donut Pistache Nobre, Café Latte), <strong>Tipo</strong> (Produto ou Desconto %), <strong>Valor</strong>, <strong>Cor da Fatia</strong> e <strong>Probabilidade (%)</strong>.
              </li>
              <li>
                O validador garante que a soma das probabilidades totalize exatamente 100%.
              </li>
              <li>
                Ao clicar em <strong>Salvar Configuração</strong>, todos os balcões e roletas dos clientes passam a utilizar as novas configurações imediatamente sem necessidade de reiniciar servidores.
              </li>
            </ol>
          </div>

          {/* PARTE 4: DEMOGRAFIA & DADOS COLETADOS NA ROLETA */}
          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Parte 4: Dados Demográficos Coletados na Roleta
                </h3>
                <span className="text-xs text-stone-500">Inteligência de Base e Perfil Real de Clientes</span>
              </div>
            </div>

            <ol className="space-y-2 text-xs text-stone-700 list-decimal list-inside font-medium leading-relaxed">
              <li>
                O gestor acessa a aba <strong>&ldquo;Público-Alvo & Demografia&rdquo;</strong>.
              </li>
              <li>
                Visualiza a <strong>Distribuição por Faixa Etária</strong> calculada diretamente com base na Data de Nascimento informada pelos clientes na roleta (18-24, 25-34, 35-44, 45-54, 55+ anos).
              </li>
              <li>
                Acompanha a <strong>Idade Média</strong> do público da confeitaria e a <strong>Taxa de Retorno</strong> (clientes que retornaram para 2ª+ visita).
              </li>
              <li>
                Acessa a <strong>Base Completa de Clientes Coletados</strong> (Nome, WhatsApp, Nascimento, Idade, Loja e Total de Visitas) com filtros e busca instantânea para auditoria e controle gerencial.
              </li>
            </ol>
          </div>

          {/* PARTE 5: VALIDAÇÃO E RESGATE DO PRÊMIO NO CAIXA */}
          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-pink-100 text-[#e6398f]">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Parte 5: Validação e Resgate do Prêmio no Caixa
                </h3>
                <span className="text-xs text-stone-500">Fechamento do Ciclo Operacional no Balcão</span>
              </div>
            </div>

            <ol className="space-y-2 text-xs text-stone-700 list-decimal list-inside font-medium leading-relaxed">
              <li>
                O cliente apresenta o código do cupom gerado na roleta (ex: <code className="bg-stone-200 px-1 py-0.5 rounded font-mono font-bold text-stone-900">MB-S0F9</code>) ao operador do caixa.
              </li>
              <li>
                O atendente acessa a tela <strong>&ldquo;Terminal do Caixa&rdquo;</strong> (<code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">/gestao/fidelidade/caixa</code>).
              </li>
              <li>
                Digita o código ou escaneia o cupom e clica em <strong>&ldquo;Validar e Resgatar&rdquo;</strong>.
              </li>
              <li>
                O sistema valida a autenticidade, confirma o desconto ou brinde, aplica na compra e queima o cupom, impedindo reuso.
              </li>
              <li>
                O resgate é registrado no <strong>Feed em Tempo Real</strong> do painel administrativo.
              </li>
            </ol>
          </div>
        </section>

        {/* 4. SEGURANÇA, ANTIFRAUDE & REGRAS DE NEGÓCIO */}
        <section className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-950 text-white shadow-xl">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Arquitetura de Segurança & Antifraude</span>
          </div>

          <h3 className="text-xl font-black mb-3">
            Garantia de 1 Giro por Compra & Blindagem Contra Fraudes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-300">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <h5 className="font-bold text-white mb-1">🔒 Consumo Único de Código</h5>
              <p>
                Assim que a roleta é acionada, o código do QR Code é invalidado atomicamente no banco. Tentativas de recarregar a página ou reutilizar o código exibem banner de bloqueio.
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <h5 className="font-bold text-white mb-1">🏢 Isolamento Multi-Unidades</h5>
              <p>
                Os QR codes gerados na Mooca não podem ser resgatados no Tatuapé sem a devida autorização configurada, preservando os centros de custo de cada loja.
              </p>
            </div>
          </div>
        </section>

        {/* ASSINATURA / RODAPÉ */}
        <footer className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>
            Melhor Bocado Café & Confeitaria • Sistema de Gestão e Fidelização Integrado.
          </p>
          <p className="font-mono">
            Documento gerado para homologação técnica e comercial.
          </p>
        </footer>
      </main>
    </div>
  );
}

function Sliders(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="1" x2="7" y1="14" y2="14" />
      <line x1="9" x2="15" y1="8" y2="8" />
      <line x1="17" x2="23" y1="16" y2="16" />
    </svg>
  );
}
