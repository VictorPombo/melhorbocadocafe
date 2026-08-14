"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Calendar,
  Repeat,
  Store,
  Clock,
  Search,
  Filter,
  Cake,
  Phone,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";
import type { Cliente } from "@/lib/fidelidade/types";
import { UNIDADES_LOJA } from "@/lib/fidelidade/types";

interface PainelPublicoAlvoProps {
  clientes: Cliente[];
}

export function PainelPublicoAlvo({ clientes }: PainelPublicoAlvoProps) {
  const [busca, setBusca] = useState("");
  const [filtroUnidade, setFiltroUnidade] = useState("todos");
  const [filtroFaixa, setFiltroFaixa] = useState("todos");

  // Função para calcular idade precisa a partir da string DD/MM/AAAA ou ISO
  function calcularIdade(nascStr: string): number {
    if (!nascStr) return 0;
    let dia = 1,
      mes = 1,
      ano = 2000;

    if (nascStr.includes("/")) {
      const parts = nascStr.split("/");
      dia = parseInt(parts[0], 10) || 1;
      mes = parseInt(parts[1], 10) || 1;
      ano = parseInt(parts[2], 10) || 2000;
    } else if (nascStr.includes("-")) {
      const parts = nascStr.split("-");
      ano = parseInt(parts[0], 10) || 2000;
      mes = parseInt(parts[1], 10) || 1;
      dia = parseInt(parts[2], 10) || 1;
    }

    const hoje = new Date();
    let idade = hoje.getFullYear() - ano;
    const m = hoje.getMonth() + 1 - mes;
    if (m < 0 || (m === 0 && hoje.getDate() < dia)) {
      idade--;
    }
    return Math.max(idade, 0);
  }

  function getFaixaEtaria(idade: number): string {
    if (idade <= 0) return "Não informada";
    if (idade < 25) return "18-24 anos";
    if (idade < 35) return "25-34 anos";
    if (idade < 45) return "35-44 anos";
    if (idade < 55) return "45-54 anos";
    return "55+ anos";
  }

  // Estatísticas agregadas a partir dos clientes da roleta
  const metricas = useMemo(() => {
    const total = clientes.length;
    if (total === 0) {
      return {
        total: 0,
        idadeMedia: 0,
        taxaRecorrencia: 0,
        recorrentes: 0,
        novos: 0,
      };
    }

    let somaIdade = 0;
    let qtdComIdade = 0;
    let recorrentes = 0;

    clientes.forEach((c) => {
      const idade = calcularIdade(c.nascimento);
      if (idade > 0 && idade < 110) {
        somaIdade += idade;
        qtdComIdade++;
      }
      if (c.qtd_compras > 1) {
        recorrentes++;
      }
    });

    const idadeMedia = qtdComIdade > 0 ? (somaIdade / qtdComIdade).toFixed(1) : "0";
    const taxaRecorrencia = Math.round((recorrentes / total) * 100);

    return {
      total,
      idadeMedia,
      taxaRecorrencia,
      recorrentes,
      novos: total - recorrentes,
    };
  }, [clientes]);

  // Distribuição por Faixa Etária
  const distribuicaoFaixas = useMemo(() => {
    const faixas = [
      { id: "18-24 anos", rotulo: "18 a 24 anos", min: 18, max: 24, cor: "bg-pink-500" },
      { id: "25-34 anos", rotulo: "25 a 34 anos", min: 25, max: 34, cor: "bg-[#e6398f]" },
      { id: "35-44 anos", rotulo: "35 a 44 anos", min: 35, max: 44, cor: "bg-purple-600" },
      { id: "45-54 anos", rotulo: "45 a 54 anos", min: 45, max: 54, cor: "bg-blue-500" },
      { id: "55+ anos", rotulo: "55+ anos", min: 55, max: 120, cor: "bg-amber-500" },
    ];

    const total = clientes.length || 1;

    return faixas.map((f) => {
      const count = clientes.filter((c) => {
        const idade = calcularIdade(c.nascimento);
        return idade >= f.min && idade <= f.max;
      }).length;
      const pct = Math.round((count / total) * 100);
      return {
        ...f,
        total: count,
        percentual: pct,
      };
    });
  }, [clientes]);

  // Distribuição por Frequência de Giros / Visitas
  const distribuicaoFrequencia = useMemo(() => {
    const total = clientes.length || 1;
    const niveis = [
      { rotulo: "1 Visita (Novo Cliente)", min: 1, max: 1, cor: "bg-blue-500" },
      { rotulo: "2 a 4 Visitas (Recorrente)", min: 2, max: 4, cor: "bg-[#e6398f]" },
      { rotulo: "5 a 9 Visitas (Frequente)", min: 5, max: 9, cor: "bg-purple-600" },
      { rotulo: "10+ Visitas (Fiel / VIP)", min: 10, max: 9999, cor: "bg-amber-500" },
    ];

    return niveis.map((n) => {
      const count = clientes.filter((c) => c.qtd_compras >= n.min && c.qtd_compras <= n.max).length;
      const pct = Math.round((count / total) * 100);
      return {
        ...n,
        total: count,
        percentual: pct,
      };
    });
  }, [clientes]);

  // Distribuição por Unidade de Cadastro
  const distribuicaoUnidades = useMemo(() => {
    const total = clientes.length || 1;
    return UNIDADES_LOJA.map((u) => {
      const count = clientes.filter(
        (c) => (c.unidade_cadastro || c.loja_preferida || "tatuape") === u.id
      ).length;
      const pct = Math.round((count / total) * 100);
      return {
        id: u.id,
        nome: u.nome,
        total: count,
        percentual: pct,
      };
    });
  }, [clientes]);

  // Lista de Clientes Filtrada para Consulta
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const matchBusca =
        !busca ||
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (c.whatsapp && c.whatsapp.includes(busca.replace(/\D/g, "")));

      const matchUnidade =
        filtroUnidade === "todos" ||
        (c.unidade_cadastro || c.loja_preferida || "tatuape") === filtroUnidade;

      const idade = calcularIdade(c.nascimento);
      const faixa = getFaixaEtaria(idade);
      const matchFaixa = filtroFaixa === "todos" || faixa === filtroFaixa;

      return matchBusca && matchUnidade && matchFaixa;
    });
  }, [clientes, busca, filtroUnidade, filtroFaixa]);

  return (
    <div className="space-y-6">
      {/* Header do Painel Demográfico */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> Inteligência de Público-Alvo
          </div>
          <h2 className="text-2xl font-black">Dados Demográficos Coletados na Roleta</h2>
          <p className="text-stone-400 text-xs mt-1 max-w-2xl">
            Painel analítico alimentado diretamente pelos cadastros realizados pelos clientes ao girarem a roleta nas lojas.
          </p>
        </div>

        <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/10 text-center shrink-0">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-bold">
            Base Coletada
          </span>
          <span className="text-2xl font-black text-pink-400">
            {metricas.total} <span className="text-xs text-white font-normal">clientes únicos</span>
          </span>
        </div>
      </div>

      {/* 4 Cards de Métricas Demográficas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Cadastros */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-[#e6398f] mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-gray-500">Cadastros na Roleta</p>
          <p className="text-2xl font-black text-gray-900 mt-0.5">{metricas.total}</p>
          <p className="text-[11px] text-gray-400 mt-1">Deduplicados por WhatsApp</p>
        </div>

        {/* Idade Média do Público */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-gray-500">Idade Média do Público</p>
          <p className="text-2xl font-black text-gray-900 mt-0.5">
            {metricas.total > 0 ? (
              <>
                {metricas.idadeMedia} <span className="text-xs font-normal text-gray-400">anos</span>
              </>
            ) : (
              <span className="text-xl text-gray-400 font-bold">—</span>
            )}
          </p>
          <p className="text-[11px] text-purple-600 font-bold mt-1">Calculada pela data de nascimento</p>
        </div>

        {/* Taxa de Recorrência */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-3">
            <Repeat className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-gray-500">Taxa de Recorrência</p>
          <p className="text-2xl font-black text-gray-900 mt-0.5">{metricas.taxaRecorrencia}%</p>
          <p className="text-[11px] text-green-600 font-bold mt-1">
            {metricas.recorrentes} clientes com 2ª+ visita
          </p>
        </div>

        {/* Unidade Principal */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
            <Store className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-gray-500">Maior Volume de Giros</p>
          <p className="text-2xl font-black text-gray-900 mt-0.5">Tatuapé</p>
          <p className="text-[11px] text-gray-400 mt-1">Líder em scans de balcão</p>
        </div>
      </div>

      {/* Gráficos de Faixas Etárias, Frequência e Unidades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Faixa Etária (Idade) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
              <Cake className="w-4 h-4 text-purple-600" />
              Faixas Etárias dos Clientes
            </h3>
            <span className="text-[11px] text-gray-400 font-bold">Nascimento</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {distribuicaoFaixas.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-700">{item.rotulo}</span>
                  <span className="text-gray-500">
                    {item.total} {item.total === 1 ? "cliente" : "clientes"} ({item.percentual}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`${item.cor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(item.percentual, item.total > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frequência de Visitas */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
              <Repeat className="w-4 h-4 text-[#e6398f]" />
              Frequência de Visitas / Giros
            </h3>
            <span className="text-[11px] text-gray-400 font-bold">Recorrência</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {distribuicaoFrequencia.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-700">{item.rotulo}</span>
                  <span className="text-gray-500">
                    {item.total} ({item.percentual}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`${item.cor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(item.percentual, item.total > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cadastros por Unidade / Filial */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              Cadastros por Loja
            </h3>
            <span className="text-[11px] text-gray-400 font-bold">Unidades</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {distribuicaoUnidades.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-700">{item.nome}</span>
                  <span className="text-gray-500">
                    {item.total} ({item.percentual}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.percentual, item.total > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Base de Clientes Cadastrados na Roleta */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-[#e6398f]" />
              Base de Clientes Coletados na Roleta
            </h3>
            <p className="text-xs text-gray-400">
              Registros individuais com identificação, idade, unidade e total de visitas
            </p>
          </div>

          {/* Filtros de Busca */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-gray-50 font-medium outline-none focus:border-[#e6398f]"
              />
            </div>

            <select
              value={filtroUnidade}
              onChange={(e) => setFiltroUnidade(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-gray-50 font-bold text-gray-700 outline-none"
            >
              <option value="todos">Todas as Lojas</option>
              {UNIDADES_LOJA.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>

            <select
              value={filtroFaixa}
              onChange={(e) => setFiltroFaixa(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-gray-50 font-bold text-gray-700 outline-none"
            >
              <option value="todos">Todas as Idades</option>
              <option value="18-24 anos">18-24 anos</option>
              <option value="25-34 anos">25-34 anos</option>
              <option value="35-44 anos">35-44 anos</option>
              <option value="45-54 anos">45-54 anos</option>
              <option value="55+ anos">55+ anos</option>
            </select>
          </div>
        </div>

        {/* Tabela de Registros */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-2">Cliente</th>
                <th className="pb-3 px-2">Celular / WhatsApp</th>
                <th className="pb-3 px-2">Nascimento & Idade</th>
                <th className="pb-3 px-2">Faixa Etária</th>
                <th className="pb-3 px-2">Loja de Cadastro</th>
                <th className="pb-3 px-2 text-center">Visitas / Giros</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clientesFiltrados.map((cliente) => {
                const idade = calcularIdade(cliente.nascimento);
                const faixa = getFaixaEtaria(idade);
                const lojaObj = UNIDADES_LOJA.find(
                  (u) => u.id === (cliente.unidade_cadastro || cliente.loja_preferida)
                );

                return (
                  <tr key={cliente.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-2 font-bold text-gray-900">
                      {cliente.nome}
                    </td>
                    <td className="py-3 px-2 text-gray-600 font-mono">
                      {cliente.whatsapp || cliente.celular || "—"}
                    </td>
                    <td className="py-3 px-2 text-gray-700">
                      <span className="font-semibold">{cliente.nascimento}</span>
                      {idade > 0 && (
                        <span className="text-gray-400 text-[11px] ml-1">({idade} anos)</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {faixa}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-700 font-medium">
                      {lojaObj ? lojaObj.nome : "Tatuapé"}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-50 text-[#e6398f] border border-pink-200">
                        {cliente.qtd_compras === 1 ? "1ª Visita" : `${cliente.qtd_compras} Visitas`}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 font-medium">
                    Nenhum cliente encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

