"use client";

import { useMemo } from "react";
import { calcInsights, calcTimeline } from "@/lib/dashboard";
import { TrendingUp, TrendingDown, Users, Trophy, Calendar, Clock, Target, UserPlus, Package, Star } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  TrendingDown: <TrendingDown className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Target: <Target className="w-4 h-4" />,
  UserPlus: <UserPlus className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  Star: <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />,
};

export default function InsightsPage() {
  const data = useMemo(() => ({
    insights: calcInsights(),
    timeline: calcTimeline(),
  }), []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-800"> Insights & Timeline</h1>

      {/* Insights */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Insights Automáticos</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.insights.map((ins, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl ${ins.tipo === "positivo" ? "bg-green-50" : ins.tipo === "negativo" ? "bg-red-50" : "bg-gray-50"}`}>
              <span className={`shrink-0 flex items-center justify-center ${ins.tipo === "positivo" ? "text-green-600" : ins.tipo === "negativo" ? "text-red-600" : "text-gray-500"}`}>
                {ICON_MAP[ins.icone] || <span className="w-2 h-2 rounded-full bg-current" />}
              </span>
              <p className={`text-sm ${ins.tipo === "positivo" ? "text-green-700" : ins.tipo === "negativo" ? "text-red-700" : "text-gray-600"}`}>{ins.texto}</p>
            </div>
          ))}
          {data.insights.length === 0 && <p className="text-gray-400 text-sm col-span-2 text-center py-6">Nenhum insight gerado ainda</p>}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4"> Timeline da Unidade</h2>
        <div className="relative space-y-0">
          {data.timeline.map((ev, i) => (
            <div key={i} className="relative flex items-start gap-4 pb-6">
              {i !== data.timeline.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-[-8px] w-px bg-gray-200" />
              )}
              <div className="relative z-10 w-6 h-6 shrink-0 rounded-full bg-white border-2 border-[#e6398f] flex items-center justify-center text-[#e6398f]">
                {ICON_MAP[ev.icone] || <span className="w-2 h-2 rounded-full bg-[#e6398f]"/>}
              </div>
              <div className="pt-0.5">
                <p className="text-sm text-gray-700">{ev.texto}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {ev.diasAtras === 0 ? "Hoje" : ev.diasAtras === 1 ? "Ontem" : `${ev.diasAtras} dias atrás`}
                </p>
              </div>
            </div>
          ))}
          {data.timeline.length === 0 && <p className="text-gray-400 text-sm">Nenhum evento recente</p>}
        </div>
      </div>
    </div>
  );
}
