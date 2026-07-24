"use client";

import { useState } from "react";
import {
  Users,
  Gift,
  TrendingUp,
  Target,
  BarChart2,
  Brain,
  MapPin,
  Zap,
} from "lucide-react";

// Dados mockados de métricas
const METRICAS = {
  cadastrosHoje: 12,
  cadastrosMes: 187,
  clientesAtivos: 143,
  clientesRecorrentes: 67,
  taxaConversao: 73,
  roiBrindes: 4.2,
  ticketMedioFidelidade: 34.5,
  ticketMedioGeral: 22.8,
  girosHoje: 9,
  girosMes: 156,
  cuponsUtilizados: 112,
  cuponsExpirados: 31,
};

const INSIGHTS_IA = [
  {
    tipo: "vip",
    icone: "👑",
    titulo: "3 clientes atingiram status VIP esta semana",
    descricao:
      "Maria Silva, João Santos e Carlos Lima ultrapassaram R$200 em compras. Sugestão: enviar mensagem de reconhecimento com prêmio exclusivo.",
    acao: "Criar campanha VIP",
    urgencia: "media",
  },
  {
    tipo: "risco",
    icone: "⚠️",
    titulo: "8 clientes não compram há mais de 15 dias",
    descricao:
      "Esses clientes tinham frequência semanal e pararam. A IA estima 70% de chance de churn se não forem abordados em 5 dias.",
    acao: "Disparar recuperação",
    urgencia: "alta",
  },
  {
    tipo: "oportunidade",
    icone: "🎯",
    titulo: "Padrão identificado: café + donut no período da tarde",
    descricao:
      "62% dos clientes que compram entre 14h-17h pedem combo. Sugestão: criar promoção combo tarde com desconto de 15%.",
    acao: "Criar promoção",
    urgencia: "baixa",
  },
  {
    tipo: "geo",
    icone: "📍",
    titulo: "Concentração de clientes na Zona Leste",
    descricao:
      "43% dos clientes cadastrados são da região do Tatuapé e Penha. Há potencial para ações de marketing geo-localizado e indicação de novos pontos.",
    acao: "Ver mapa",
    urgencia: "baixa",
  },
  {
    tipo: "aniversario",
    icone: "🎂",
    titulo: "5 aniversariantes nos próximos 7 dias",
    descricao:
      "Enviar mensagem de parabéns com cupom especial de aniversário (donut grátis + 20% desconto).",
    acao: "Agendar mensagens",
    urgencia: "media",
  },
  {
    tipo: "produto",
    icone: "🍩",
    titulo: "Donut Pistache é o favorito dos VIPs",
    descricao:
      "Clientes AAA compram Pistache 3x mais que a média. Sugestão: usar como brinde exclusivo para fidelização de alto valor.",
    acao: "Ajustar roleta",
    urgencia: "baixa",
  },
];

const SEGMENTOS_AUTO = [
  {
    nome: "Clientes AAA (Top 10%)",
    qtd: 14,
    ticket: "R$ 48,20",
    cor: "bg-yellow-500",
  },
  {
    nome: "Recorrentes (2+ compras/semana)",
    qtd: 67,
    ticket: "R$ 32,10",
    cor: "bg-green-500",
  },
  {
    nome: "Em risco de churn",
    qtd: 8,
    ticket: "R$ 28,50",
    cor: "bg-red-500",
  },
  {
    nome: "Novos (últimos 7 dias)",
    qtd: 23,
    ticket: "R$ 19,90",
    cor: "bg-blue-500",
  },
  {
    nome: "Aniversariantes do mês",
    qtd: 12,
    ticket: "R$ 27,30",
    cor: "bg-purple-500",
  },
  {
    nome: "Apenas 1 compra",
    qtd: 41,
    ticket: "R$ 18,40",
    cor: "bg-orange-500",
  },
];

export default function FidelidadeDashboardPage() {
  const [tabInsights, setTabInsights] = useState<"insights" | "segmentos">(
    "insights"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-800">
              Fidelidade & Inteligência
            </h1>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-gray-200">
              ⚡ Sincronizado via API Degust/Linx
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Dados capturados → Ações inteligentes → Mais vendas
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-600 font-bold">
            Sistema ativo
          </span>
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Cadastros hoje"
          valor={METRICAS.cadastrosHoje}
          icone={<Users className="w-4 h-4" />}
          cor="text-blue-500"
          bgCor="bg-blue-50"
        />
        <KpiCard
          label="Cadastros / mês"
          valor={METRICAS.cadastrosMes}
          icone={<TrendingUp className="w-4 h-4" />}
          cor="text-green-500"
          bgCor="bg-green-50"
        />
        <KpiCard
          label="Taxa de conversão"
          valor={`${METRICAS.taxaConversao}%`}
          icone={<Target className="w-4 h-4" />}
          cor="text-purple-500"
          bgCor="bg-purple-50"
          detalhe="QR Code → Cadastro"
        />
        <KpiCard
          label="ROI brindes"
          valor={`${METRICAS.roiBrindes}x`}
          icone={<BarChart2 className="w-4 h-4" />}
          cor="text-[#e6398f]"
          bgCor="bg-pink-50"
          detalhe="Cada R$1 gasto gera R$4,20"
        />
      </div>

      {/* Ticket médio comparativo */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-500 mb-4">
          Impacto da fidelidade no ticket médio
        </h3>
        <div className="flex items-end gap-8">
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">Cliente sem cadastro</p>
            <div className="h-8 rounded-lg bg-gray-200 flex items-center px-3">
              <span className="text-sm font-bold text-gray-500">
                R$ {METRICAS.ticketMedioGeral.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">
              Cliente fidelidade{" "}
              <span className="text-green-500 font-bold">
                +{(
                  ((METRICAS.ticketMedioFidelidade - METRICAS.ticketMedioGeral) /
                    METRICAS.ticketMedioGeral) *
                  100
                ).toFixed(0)}
                %
              </span>
            </p>
            <div
              className="h-8 rounded-lg bg-gradient-to-r from-[#e6398f] to-[#b51e6c] flex items-center px-3"
              style={{
                width: `${(METRICAS.ticketMedioFidelidade / METRICAS.ticketMedioFidelidade) * 100}%`,
              }}
            >
              <span className="text-sm font-bold text-white">
                R$ {METRICAS.ticketMedioFidelidade.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cupons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Giros hoje"
          valor={METRICAS.girosHoje}
          icone={<Gift className="w-4 h-4" />}
          cor="text-orange-500"
          bgCor="bg-orange-50"
        />
        <KpiCard
          label="Giros / mês"
          valor={METRICAS.girosMes}
          icone={<Gift className="w-4 h-4" />}
          cor="text-orange-500"
          bgCor="bg-orange-50"
        />
        <KpiCard
          label="Cupons utilizados"
          valor={METRICAS.cuponsUtilizados}
          icone={<Zap className="w-4 h-4" />}
          cor="text-green-500"
          bgCor="bg-green-50"
          detalhe={`${((METRICAS.cuponsUtilizados / (METRICAS.cuponsUtilizados + METRICAS.cuponsExpirados)) * 100).toFixed(0)}% de aproveitamento`}
        />
        <KpiCard
          label="Cupons expirados"
          valor={METRICAS.cuponsExpirados}
          icone={<Zap className="w-4 h-4" />}
          cor="text-red-400"
          bgCor="bg-red-50"
        />
      </div>

      {/* Inteligência — Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTabInsights("insights")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
              tabInsights === "insights"
                ? "text-[#e6398f] border-b-2 border-[#e6398f]"
                : "text-gray-400"
            }`}
          >
            <Brain className="w-4 h-4" />
            Insights da IA
          </button>
          <button
            onClick={() => setTabInsights("segmentos")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
              tabInsights === "segmentos"
                ? "text-[#e6398f] border-b-2 border-[#e6398f]"
                : "text-gray-400"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Segmentos Automáticos
          </button>
        </div>

        <div className="p-5">
          {tabInsights === "insights" ? (
            <div className="space-y-3">
              {INSIGHTS_IA.map((insight, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-4 border transition-all hover:shadow-md ${
                    insight.urgencia === "alta"
                      ? "border-red-200 bg-red-50/50"
                      : insight.urgencia === "media"
                      ? "border-yellow-200 bg-yellow-50/30"
                      : "border-gray-100 bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icone}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800">
                        {insight.titulo}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {insight.descricao}
                      </p>
                    </div>
                    <button className="shrink-0 px-3 py-1.5 rounded-lg bg-[#e6398f]/10 text-[#e6398f] text-xs font-bold hover:bg-[#e6398f]/20 transition-all">
                      {insight.acao}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {SEGMENTOS_AUTO.map((seg, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:shadow-sm transition-all"
                >
                  <div className={`w-3 h-3 rounded-full ${seg.cor}`} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">
                      {seg.nome}
                    </p>
                    <p className="text-xs text-gray-400">
                      Ticket médio: {seg.ticket}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-gray-800">
                      {seg.qtd}
                    </p>
                    <p className="text-[10px] text-gray-400">clientes</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold hover:bg-gray-200 transition-all">
                    Campanha
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plano estratégico — o que o sistema faz com os dados */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-[#e6398f]" />
          <h3 className="font-bold">
            O que o sistema faz com os dados capturados
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              icone: "👑",
              titulo: "Identifica clientes AAA",
              desc: "Reconhece formadores de opinião e cria campanhas exclusivas para reter os top 10%",
            },
            {
              icone: "📍",
              titulo: "Marketing geo-localizado",
              desc: "Usa localização dos clientes para ações por região, avaliar pontos para nova unidade",
            },
            {
              icone: "🧠",
              titulo: "Previsão de churn com IA",
              desc: "Prevê quando um cliente vai parar de comprar e sugere campanha de recuperação automática",
            },
            {
              icone: "🛍️",
              titulo: "Recomendação de produtos",
              desc: "Sugere produtos com base no histórico individual de cada cliente",
            },
            {
              icone: "⏰",
              titulo: "Melhor horário de contato",
              desc: "Identifica o dia e hora ideal para enviar campanhas para cada cliente",
            },
            {
              icone: "📊",
              titulo: "Lifetime Value (LTV)",
              desc: "Calcula o potencial de cada cliente e sugere onde vale investir em marketing",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
            >
              <span className="text-xl">{item.icone}</span>
              <div>
                <p className="text-sm font-bold">{item.titulo}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  valor,
  icone,
  cor,
  bgCor,
  detalhe,
}: {
  label: string;
  valor: string | number;
  icone: React.ReactNode;
  cor: string;
  bgCor: string;
  detalhe?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${bgCor} ${cor}`}>{icone}</div>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-800">{valor}</p>
      {detalhe && (
        <p className="text-[10px] text-gray-400 mt-1">{detalhe}</p>
      )}
    </div>
  );
}
