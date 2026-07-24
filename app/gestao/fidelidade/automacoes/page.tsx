"use client";

import { useState } from "react";
import { Brain, Zap, Clock, ToggleLeft, ToggleRight } from "lucide-react";

interface Automacao {
  id: string;
  nome: string;
  descricao: string;
  tipo: string;
  icone: string;
  ativa: boolean;
  ultimoDisparo: string | null;
  clientesImpactados: number;
  conversao: number | null; // % de conversão
  categoria: "recuperacao" | "fidelizacao" | "inteligencia";
}

const AUTOMACOES: Automacao[] = [
  {
    id: "auto_1",
    nome: "Aniversariante da semana",
    descricao:
      "Envia mensagem de parabéns + cupom especial (donut grátis + 20% desconto) 3 dias antes do aniversário.",
    tipo: "aniversario",
    icone: "🎂",
    ativa: true,
    ultimoDisparo: "2026-07-15 08:00",
    clientesImpactados: 5,
    conversao: 68,
    categoria: "fidelizacao",
  },
  {
    id: "auto_2",
    nome: "Recuperação de cliente inativo",
    descricao:
      'A IA detecta clientes com frequência semanal que não compram há 10+ dias. Dispara mensagem "Sentimos sua falta" com oferta personalizada baseada no histórico.',
    tipo: "inativo",
    icone: "⚠️",
    ativa: true,
    ultimoDisparo: "2026-07-15 09:00",
    clientesImpactados: 8,
    conversao: 42,
    categoria: "recuperacao",
  },
  {
    id: "auto_3",
    nome: "Reconhecimento VIP (AAA)",
    descricao:
      "Quando um cliente atinge o top 10% em gastos, recebe mensagem de reconhecimento + convite para programa VIP exclusivo. Formadores de opinião recebem tratamento especial.",
    tipo: "vip",
    icone: "👑",
    ativa: true,
    ultimoDisparo: "2026-07-14 12:00",
    clientesImpactados: 3,
    conversao: 85,
    categoria: "fidelizacao",
  },
  {
    id: "auto_4",
    nome: "Incentivo à 2ª compra",
    descricao:
      "Clientes que fizeram apenas 1 compra recebem cupom de desconto 48h depois para estimular recorrência. A IA escolhe o produto com maior probabilidade de conversão.",
    tipo: "primeira_compra",
    icone: "🎯",
    ativa: true,
    ultimoDisparo: "2026-07-15 10:00",
    clientesImpactados: 15,
    conversao: 31,
    categoria: "recuperacao",
  },
  {
    id: "auto_5",
    nome: "Recomendação de produto por IA",
    descricao:
      "Analisa o histórico de consumo e sugere produtos complementares. Ex: quem compra café espresso com frequência recebe sugestão de combo com donut.",
    tipo: "recomendacao",
    icone: "🧠",
    ativa: false,
    ultimoDisparo: null,
    clientesImpactados: 0,
    conversao: null,
    categoria: "inteligencia",
  },
  {
    id: "auto_6",
    nome: "Campanha geo-localizada",
    descricao:
      "Identifica concentrações de clientes por região e sugere ações de marketing local. Útil para divulgar nova unidade ou promoção regional.",
    tipo: "geo",
    icone: "📍",
    ativa: false,
    ultimoDisparo: null,
    clientesImpactados: 0,
    conversao: null,
    categoria: "inteligencia",
  },
  {
    id: "auto_7",
    nome: "Previsão de churn com IA",
    descricao:
      "Modelo preditivo que analisa padrões de frequência, ticket e horário para prever quando um cliente vai parar de comprar. Dispara ação preventiva automaticamente.",
    tipo: "churn_prediction",
    icone: "🔮",
    ativa: false,
    ultimoDisparo: null,
    clientesImpactados: 0,
    conversao: null,
    categoria: "inteligencia",
  },
  {
    id: "auto_8",
    nome: "Melhor horário de envio",
    descricao:
      "Para cada cliente, identifica o dia e hora com maior probabilidade de engajamento. Todas as mensagens são agendadas nesse horário ideal.",
    tipo: "best_time",
    icone: "⏰",
    ativa: false,
    ultimoDisparo: null,
    clientesImpactados: 0,
    conversao: null,
    categoria: "inteligencia",
  },
  {
    id: "auto_9",
    nome: "Geração de público para anúncios",
    descricao:
      "Cria automaticamente listas segmentadas (VIP, inativos, lovers de donut, fãs de café) para importar em Meta Ads e Google Ads.",
    tipo: "audiencia",
    icone: "📊",
    ativa: false,
    ultimoDisparo: null,
    clientesImpactados: 0,
    conversao: null,
    categoria: "inteligencia",
  },
];

// Mock de log recente
const LOG_RECENTE = [
  {
    hora: "08:00",
    tipo: "aniversario",
    cliente: "Fernanda Costa",
    status: "enviado",
  },
  {
    hora: "09:00",
    tipo: "inativo",
    cliente: "Ana Oliveira",
    status: "enviado",
  },
  {
    hora: "09:00",
    tipo: "inativo",
    cliente: "Roberto Dias",
    status: "enviado",
  },
  {
    hora: "10:00",
    tipo: "primeira_compra",
    cliente: "Lucas Martins",
    status: "enviado",
  },
  {
    hora: "10:00",
    tipo: "primeira_compra",
    cliente: "Camila Nunes",
    status: "erro",
  },
];

export default function AutomacoesPage() {
  const [automacoes, setAutomacoes] = useState(AUTOMACOES);
  const [tabCategoria, setTabCategoria] = useState<
    "todas" | "recuperacao" | "fidelizacao" | "inteligencia"
  >("todas");

  function toggleAutomacao(id: string) {
    setAutomacoes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ativa: !a.ativa } : a))
    );
  }

  const filtradas =
    tabCategoria === "todas"
      ? automacoes
      : automacoes.filter((a) => a.categoria === tabCategoria);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">
            Automações Inteligentes
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            O sistema trabalha sozinho, 24/7
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock className="w-4 h-4" />
          Última execução: hoje 10:00
        </div>
      </div>

      {/* Tabs de categoria */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {(
          [
            { k: "todas", l: "Todas" },
            { k: "recuperacao", l: "🎯 Recuperação" },
            { k: "fidelizacao", l: "👑 Fidelização" },
            { k: "inteligencia", l: "🧠 IA & Estratégia" },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => setTabCategoria(t.k)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              tabCategoria === t.k
                ? "bg-white text-[#e6398f] shadow-sm"
                : "text-gray-400"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* Lista de automações */}
      <div className="space-y-3">
        {filtradas.map((auto) => (
          <div
            key={auto.id}
            className={`bg-white rounded-2xl border p-5 transition-all ${
              auto.ativa ? "border-gray-100" : "border-gray-200 opacity-70"
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{auto.icone}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-800">{auto.nome}</p>
                  {auto.categoria === "inteligencia" && !auto.ativa && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-600">
                      Em breve
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {auto.descricao}
                </p>

                {/* Métricas */}
                {auto.ativa && (
                  <div className="flex gap-4 mt-3">
                    {auto.ultimoDisparo && (
                      <span className="text-[10px] text-gray-400">
                        Último: {auto.ultimoDisparo}
                      </span>
                    )}
                    {auto.clientesImpactados > 0 && (
                      <span className="text-[10px] text-gray-400">
                        {auto.clientesImpactados} clientes impactados
                      </span>
                    )}
                    {auto.conversao !== null && (
                      <span className="text-[10px] text-green-500 font-bold">
                        {auto.conversao}% conversão
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleAutomacao(auto.id)}
                className="shrink-0"
              >
                {auto.ativa ? (
                  <ToggleRight className="w-8 h-8 text-green-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-300" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Log recente */}
      <div className="bg-gray-900 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h3 className="font-bold text-sm">Log de hoje</h3>
        </div>
        <div className="space-y-2">
          {LOG_RECENTE.map((log, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-xs py-1.5 border-b border-white/10 last:border-0"
            >
              <span className="text-gray-500 font-mono w-12">{log.hora}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  log.status === "enviado" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-gray-400">{log.tipo}</span>
              <span className="text-gray-300 font-medium">{log.cliente}</span>
              <span
                className={`ml-auto text-[10px] font-bold ${
                  log.status === "enviado" ? "text-green-400" : "text-red-400"
                }`}
              >
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
