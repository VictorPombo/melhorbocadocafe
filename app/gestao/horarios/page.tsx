"use client";

import { useMemo } from "react";
import { getVendasByPeriodo, formatCurrency } from "@/lib/mock-data";

export default function HorariosPage() {
  const { heatmap, dias } = useMemo(() => {
    const heatmap: Record<string, Record<number, { vendas: number; fat: number }>> = {};
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    dias.forEach((d) => { heatmap[d] = {}; for (let h = 8; h <= 20; h++) heatmap[d][h] = { vendas: 0, fat: 0 }; });
    getVendasByPeriodo(30).forEach((v) => {
      const day = dias[new Date(v.criadoEm).getDay()];
      const hour = parseInt(v.horario.split(":")[0]);
      if (heatmap[day] && heatmap[day][hour]) {
        heatmap[day][hour].vendas++;
        heatmap[day][hour].fat += v.valorTotal;
      }
    });
    return { heatmap, dias };
  }, []);

  const maxVendas = Math.max(...Object.values(heatmap).flatMap((d) => Object.values(d).map((c) => c.vendas)), 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-800"> Horários de Movimento</h1>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <p className="text-xs text-gray-400 mb-4">Últimos 30 dias · Passe o mouse para ver detalhes</p>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex gap-1.5 mb-1.5">
              <div className="w-10" />
              {Array.from({ length: 13 }, (_, i) => i + 8).map((h) => (
                <div key={h} className="flex-1 text-center text-[10px] text-gray-400 font-medium">{h}h</div>
              ))}
            </div>
            {dias.map((dia) => (
              <div key={dia} className="flex gap-1.5 mb-1.5">
                <div className="w-10 text-xs text-gray-500 font-medium flex items-center">{dia}</div>
                {Array.from({ length: 13 }, (_, i) => i + 8).map((h) => {
                  const cell = heatmap[dia]?.[h] || { vendas: 0, fat: 0 };
                  const intensity = cell.vendas / maxVendas;
                  return (
                    <div key={h} className="flex-1 aspect-square rounded-lg relative group cursor-default transition-transform hover:scale-110" style={{ backgroundColor: intensity > 0 ? `rgba(230, 57, 143, ${0.08 + intensity * 0.7})` : "#f9fafb" }}>
                      {cell.vendas > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-gray-800 text-white text-[10px] px-3 py-2 rounded-lg whitespace-nowrap shadow-lg pointer-events-none">
                          <p className="font-bold">{dia} {h}h</p>
                          <p>{cell.vendas} vendas · {formatCurrency(cell.fat)}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-4 justify-end">
              <span className="text-[10px] text-gray-400">Menos</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
                <div key={v} className="w-4 h-4 rounded" style={{ backgroundColor: `rgba(230, 57, 143, ${0.08 + v * 0.7})` }} />
              ))}
              <span className="text-[10px] text-gray-400">Mais</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
