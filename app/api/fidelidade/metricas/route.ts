import { NextResponse } from "next/server";
import {
  giroStore,
  cupomStore,
  clienteStore,
  premiosRoletaStore,
} from "@/lib/fidelidade/mock-data";
import { UNIDADES_LOJA, type UnidadeLoja } from "@/lib/fidelidade/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let dbClientes: any[] = [];
    let dbGiros: any[] = [];
    let dbCupons: any[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const [resClientes, resGiros, resCupons] = await Promise.all([
          supabase.from("mb_clientes").select("*"),
          supabase.from("mb_giros").select("*"),
          supabase.from("mb_cupons").select("*"),
        ]);

        if (resClientes.data) dbClientes = resClientes.data;
        if (resGiros.data) dbGiros = resGiros.data;
        if (resCupons.data) dbCupons = resCupons.data;
      } catch (err) {
        console.error("[Metricas] Fallback para store em memória:", err);
      }
    }

    // Unifica clientes da memória e do banco
    const mapClientes = new Map<string, any>();
    clienteStore.forEach((c) => {
      const zap = (c.whatsapp || "").replace(/\D/g, "");
      if (zap) mapClientes.set(zap, c);
    });
    dbClientes.forEach((c) => {
      const zap = (c.whatsapp || "").replace(/\D/g, "");
      if (zap) {
        mapClientes.set(zap, {
          id: c.id,
          nome: c.nome,
          whatsapp: c.whatsapp,
          nascimento: c.nascimento,
          qtd_compras: c.total_visitas || 1,
          qtd_resgates: c.total_resgates || 0,
          unidade_cadastro: c.unidade_origem || "tatuape",
          loja_preferida: c.unidade_origem || "tatuape",
          tags: c.tags || ["Fidelizado"],
          primeira_compra: c.primeira_visita_em || c.created_at,
          ultima_compra: c.ultima_visita_em || c.updated_at,
          origem: "Supabase DB",
        });
      }
    });
    const listaClientesFinal = Array.from(mapClientes.values());

    const cuponsUtilizados = cupomStore.filter((c) => c.status === "utilizado");
    const cuponsDbUtilizados = dbCupons.filter((c) => c.utilizado);
    const totalResgates = Math.max(cuponsUtilizados.length, cuponsDbUtilizados.length);

    const totalGiros = Math.max(giroStore.length, dbGiros.length);
    const totalClientes = listaClientesFinal.length;

    const taxaResgateGeral =
      totalGiros > 0 ? Math.round((totalResgates / totalGiros) * 100) : 0;

    // Métricas Reais por Unidade
    const metricasUnidades = UNIDADES_LOJA.map((u: UnidadeLoja) => {
      const scansUnidade = giroStore.filter((g) => g.unidade === u.id).length;
      const resgatesUnidade = cuponsUtilizados.filter((c) => c.unidade === u.id).length;
      const taxa = scansUnidade > 0 ? Math.round((resgatesUnidade / scansUnidade) * 100) : 0;

      return {
        id: u.id,
        nome: u.nome,
        scans: scansUnidade,
        resgates: resgatesUnidade,
        taxa: taxa,
      };
    });

    // Frequência Real de Visitas a partir dos Clientes Cadastrados
    const clientesTotal = clienteStore.length || 1;
    const c1 = clienteStore.filter((c) => c.qtd_compras === 1).length;
    const c2 = clienteStore.filter((c) => c.qtd_compras >= 2 && c.qtd_compras <= 4).length;
    const c3 = clienteStore.filter((c) => c.qtd_compras >= 5 && c.qtd_compras <= 9).length;
    const c4 = clienteStore.filter((c) => c.qtd_compras >= 10).length;

    const frequenciaVisitas = [
      {
        nivel: "1ª Compra / 1º Giro",
        qtd: c1,
        percentual: clienteStore.length > 0 ? Math.round((c1 / clientesTotal) * 100) : 0,
        cor: "bg-blue-500",
      },
      {
        nivel: "2 a 4 Compras (Recorrente)",
        qtd: c2,
        percentual: clienteStore.length > 0 ? Math.round((c2 / clientesTotal) * 100) : 0,
        cor: "bg-[#e6398f]",
      },
      {
        nivel: "5 a 9 Compras (Frequente)",
        qtd: c3,
        percentual: clienteStore.length > 0 ? Math.round((c3 / clientesTotal) * 100) : 0,
        cor: "bg-purple-500",
      },
      {
        nivel: "10+ Compras (VIP / Fiel)",
        qtd: c4,
        percentual: clienteStore.length > 0 ? Math.round((c4 / clientesTotal) * 100) : 0,
        cor: "bg-amber-500",
      },
    ];

    // Feed de Resgates Recentes Reais com Data e Hora
    const resgatesRecentes = cuponsUtilizados.slice(-8).reverse().map((c) => {
      const premioObj = premiosRoletaStore.find((p) => p.id === c.premio_id);
      const lojaObj = UNIDADES_LOJA.find((u) => u.id === c.unidade);

      const dataObj = c.utilizado_em ? new Date(c.utilizado_em) : new Date(c.criado_em);
      const dataFmt = dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      const horaFmt = dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const anoFmt = dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

      return {
        id: c.id,
        cliente: c.cliente_nome || "Cliente",
        unidade_id: c.unidade || "tatuape",
        unidade: lojaObj ? lojaObj.nome : "Tatuapé",
        premio: premioObj ? premioObj.nome : "Prêmio Sorteado",
        codigo: c.codigo_cupom,
        hora: `${dataFmt} • ${horaFmt}`,
        dataHora: `${anoFmt} às ${horaFmt}`,
        visita: c.visita_numero === 1 ? "1ª Visita" : `${c.visita_numero}ª Visita`,
      };
    });

    // Histórico Completo de Cupons / Giros Reais
    const historicoCompleto = cupomStore.slice().reverse().map((c) => {
      const premioObj = premiosRoletaStore.find((p) => p.id === c.premio_id);
      const lojaObj = UNIDADES_LOJA.find((u) => u.id === c.unidade);
      const dataObj = new Date(c.criado_em);
      const dataFmt = dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
      const horaFmt = dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      return {
        id: c.id,
        cliente: c.cliente_nome || "Cliente",
        whatsapp: c.cliente_whatsapp || "—",
        premio: premioObj ? premioObj.nome : "Prêmio",
        cupom: c.codigo_cupom,
        status: c.status,
        data: `${dataFmt} às ${horaFmt}`,
        unidade_id: c.unidade || "tatuape",
        unidade: lojaObj ? lojaObj.nome : "Tatuapé",
      };
    });

    return NextResponse.json({
      sucesso: true,
      totalGiros,
      totalResgates,
      totalClientes: listaClientesFinal.length,
      taxaResgate: taxaResgateGeral,
      metricasUnidades,
      frequenciaVisitas,
      resgatesRecentes,
      historicoCompleto,
      clientes: listaClientesFinal,
    });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || "Erro ao carregar métricas" },
      { status: 500 }
    );
  }
}
