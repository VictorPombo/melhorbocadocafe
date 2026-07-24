"use client";

import { useMemo } from "react";
import { calcOrigemClientes } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function CanaisPage() {
  const canais = useMemo(() => calcOrigemClientes(90), []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-800"> Origem dos Clientes</h1>

      {/* Gráfico */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Faturamento por Canal</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={canais} layout="vertical" margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(v: number) => `R$${v}`} />
            <YAxis type="category" dataKey="canal" tick={{ fontSize: 11, fill: "#6b7280" }} width={100} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12 }} />
            <Bar dataKey="faturamento" fill="#e6398f" radius={[0, 6, 6, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detalhes */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Detalhes por Canal</h2>
        <div className="space-y-3">
          {canais.map((c) => (
            <div key={c.canal} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">{c.canal}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.clientes} clientes · {c.recorrencia}% retornaram</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#e6398f]">{formatCurrency(c.faturamento)}</p>
                <p className="text-[10px] text-gray-400">Ticket {formatCurrency(c.ticketMedio)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
