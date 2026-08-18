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
          supabase.from("mb_clientes").select("*").order("created_at", { ascending: false }),
          supabase.from("mb_giros").select("*").order("criado_em", { ascending: false }),
          supabase.from("mb_cupons").select("*").order("criado_em", { ascending: false }),
        ]);

        if (resClientes.data) dbClientes = resClientes.data;
        if (resGiros.data) dbGiros = resGiros.data;
        if (resCupons.data) dbCupons = resCupons.data;
      } catch (err) {
        console.error("[Metricas] Erro ao buscar dados do Supabase:", err);
      }
    }

    // 1. Unificar Clientes (Supabase + Memória)
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
    const clientesById = new Map<string, any>();
    listaClientesFinal.forEach((cli) => {
      if (cli.id) clientesById.set(cli.id, cli);
      if (cli.whatsapp) clientesById.set(cli.whatsapp.replace(/\D/g, ""), cli);
    });

    // 2. Unificar Giros (Supabase + Memória)
    const mapGiros = new Map<string, any>();
    giroStore.forEach((g) => {
      if (g.id) mapGiros.set(g.id, g);
    });
    dbGiros.forEach((g) => {
      if (g.id) {
        mapGiros.set(g.id, {
          id: g.id,
          visitor_id: g.visitor_id,
          codigo_vinculo: g.codigo_vinculo,
          premio_id: g.premio_id,
          cliente_id: g.cliente_id,
          unidade: (g.unidade || "tatuape").toLowerCase(),
          nome: g.nome,
          nascimento: g.nascimento,
          whatsapp: g.whatsapp,
          criado_em: g.criado_em,
        });
      }
    });
    const listaGirosFinal = Array.from(mapGiros.values());

    // 3. Unificar Cupons (Supabase + Memória)
    const mapCupons = new Map<string, any>();
    cupomStore.forEach((c) => {
      if (c.codigo_cupom) mapCupons.set(c.codigo_cupom, c);
    });
    dbCupons.forEach((c) => {
      const codigo = c.codigo_cupom;
      if (codigo) {
        const clienteRelacionado =
          clientesById.get(c.cliente_id) ||
          listaClientesFinal.find(
            (cl) => cl.id === c.cliente_id || (cl.whatsapp && c.cliente_id && cl.whatsapp.includes(c.cliente_id))
          );

        mapCupons.set(codigo, {
          id: c.id,
          codigo_cupom: c.codigo_cupom,
          cliente_id: c.cliente_id,
          cliente_nome: clienteRelacionado?.nome || c.premio_nome ? clienteRelacionado?.nome || "Cliente Cadastrado" : "Cliente",
          cliente_whatsapp: clienteRelacionado?.whatsapp || "—",
          giro_id: c.giro_id,
          premio_id: c.premio_id,
          premio_nome: c.premio_nome,
          premio_tipo: c.premio_tipo,
          premio_valor: c.premio_valor,
          premio_icone: c.premio_icone,
          premio_cor: c.premio_cor,
          unidade: (c.unidade || "tatuape").toLowerCase(),
          visita_numero: c.visita_numero || 1,
          origem_cupom: c.origem_cupom,
          expira_em: c.expira_em,
          status: c.utilizado ? "utilizado" : new Date(c.expira_em) < new Date() ? "expirado" : "disponivel",
          utilizado: !!c.utilizado,
          utilizado_em: c.utilizado_em,
          utilizado_unidade: (c.utilizado_unidade || c.unidade || "tatuape").toLowerCase(),
          criado_em: c.criado_em,
        });
      }
    });
    const listaCuponsFinal = Array.from(mapCupons.values());

    const cuponsUtilizados = listaCuponsFinal.filter(
      (c) => c.status === "utilizado" || c.utilizado === true
    );
    const totalResgates = cuponsUtilizados.length;
    const totalGiros = listaGirosFinal.length;
    const totalClientes = listaClientesFinal.length;

    const taxaResgateGeral =
      totalGiros > 0 ? Math.round((totalResgates / totalGiros) * 100) : 0;

    // Métricas Reais por Unidade
    const metricasUnidades = UNIDADES_LOJA.map((u: UnidadeLoja) => {
      const scansUnidade = listaGirosFinal.filter(
        (g) => (g.unidade || "").toLowerCase() === u.id.toLowerCase()
      ).length;
      const resgatesUnidade = cuponsUtilizados.filter(
        (c) => ((c.utilizado_unidade || c.unidade) || "").toLowerCase() === u.id.toLowerCase()
      ).length;
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
    const clientesTotal = listaClientesFinal.length || 1;
    const c1 = listaClientesFinal.filter((c) => c.qtd_compras === 1).length;
    const c2 = listaClientesFinal.filter((c) => c.qtd_compras >= 2 && c.qtd_compras <= 4).length;
    const c3 = listaClientesFinal.filter((c) => c.qtd_compras >= 5 && c.qtd_compras <= 9).length;
    const c4 = listaClientesFinal.filter((c) => c.qtd_compras >= 10).length;

    const frequenciaVisitas = [
      {
        nivel: "1ª Compra / 1º Giro",
        qtd: c1,
        percentual: listaClientesFinal.length > 0 ? Math.round((c1 / clientesTotal) * 100) : 0,
        cor: "bg-blue-500",
      },
      {
        nivel: "2 a 4 Compras (Recorrente)",
        qtd: c2,
        percentual: listaClientesFinal.length > 0 ? Math.round((c2 / clientesTotal) * 100) : 0,
        cor: "bg-[#e6398f]",
      },
      {
        nivel: "5 a 9 Compras (Frequente)",
        qtd: c3,
        percentual: listaClientesFinal.length > 0 ? Math.round((c3 / clientesTotal) * 100) : 0,
        cor: "bg-purple-500",
      },
      {
        nivel: "10+ Compras (VIP / Fiel)",
        qtd: c4,
        percentual: listaClientesFinal.length > 0 ? Math.round((c4 / clientesTotal) * 100) : 0,
        cor: "bg-amber-500",
      },
    ];

    // Feed de Resgates Recentes Reais com Data e Hora
    const resgatesRecentes = cuponsUtilizados
      .sort((a, b) => new Date(b.utilizado_em || b.criado_em).getTime() - new Date(a.utilizado_em || a.criado_em).getTime())
      .slice(0, 12)
      .map((c) => {
        const premioObj = premiosRoletaStore.find((p) => p.id === c.premio_id);
        const lojaObj = UNIDADES_LOJA.find((u) => u.id === (c.utilizado_unidade || c.unidade));

        const dataObj = c.utilizado_em ? new Date(c.utilizado_em) : new Date(c.criado_em);
        const dataFmt = dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        const horaFmt = dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const anoFmt = dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

        return {
          id: c.id,
          cliente: c.cliente_nome || "Cliente",
          unidade_id: (c.utilizado_unidade || c.unidade || "tatuape").toLowerCase(),
          unidade: lojaObj ? lojaObj.nome : "Tatuapé",
          premio: c.premio_nome || (premioObj ? premioObj.nome : "Café Expresso Grátis"),
          codigo: c.codigo_cupom,
          hora: `${dataFmt} • ${horaFmt}`,
          dataHora: `${anoFmt} às ${horaFmt}`,
          visita: c.visita_numero === 1 ? "1ª Visita" : `${c.visita_numero}ª Visita`,
        };
      });

    // Histórico Completo de Cupons / Giros Reais
    const historicoCompleto = listaCuponsFinal
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
      .map((c) => {
        const premioObj = premiosRoletaStore.find((p) => p.id === c.premio_id);
        const lojaObj = UNIDADES_LOJA.find((u) => u.id === c.unidade);
        const dataObj = new Date(c.criado_em);
        const dataFmt = dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
        const horaFmt = dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

        return {
          id: c.id,
          cliente: c.cliente_nome || "Cliente",
          whatsapp: c.cliente_whatsapp || "—",
          premio: c.premio_nome || (premioObj ? premioObj.nome : "Prêmio"),
          cupom: c.codigo_cupom,
          status: c.status,
          data: `${dataFmt} às ${horaFmt}`,
          unidade_id: (c.unidade || "tatuape").toLowerCase(),
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
