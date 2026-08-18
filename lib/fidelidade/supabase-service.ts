import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Cliente, Cupom, Giro, Premio, EtapaTrilhaVisita, UnidadeLoja } from "./types";

// =============================================================================
// Supabase Database Service para o Melhor Bocado Café
// Garante persistência permanente de clientes, giros, cupons e resgates.
// =============================================================================

export async function salvarClienteDb(cliente: {
  nome: string;
  whatsapp: string;
  nascimento?: string;
  visitor_id?: string;
  unidade_origem?: string;
  total_visitas?: number;
}): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const zapClean = cliente.whatsapp.replace(/\D/g, "");
    const unidadeLoja = cliente.unidade_origem || "tatuape";

    // 1. Busca se este cliente já existe ESPECIFICAMENTE nesta unidade
    const { data: existente } = await supabase
      .from("mb_clientes")
      .select("*")
      .eq("whatsapp", zapClean)
      .eq("unidade_origem", unidadeLoja)
      .maybeSingle();

    if (existente) {
      const { data, error } = await supabase
        .from("mb_clientes")
        .update({
          nome: cliente.nome || existente.nome,
          nascimento: cliente.nascimento || existente.nascimento,
          visitor_id: cliente.visitor_id || existente.visitor_id,
          total_visitas: (existente.total_visitas || 1) + 1,
          ultima_visita_em: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existente.id)
        .select()
        .single();

      if (!error && data) return data;
    } else {
      const { data, error } = await supabase
        .from("mb_clientes")
        .insert({
          nome: cliente.nome,
          whatsapp: zapClean,
          nascimento: cliente.nascimento || "01/01/2000",
          visitor_id: cliente.visitor_id,
          total_visitas: cliente.total_visitas || 1,
          total_resgates: 0,
          unidade_origem: unidadeLoja,
          tags: ["Novo Cliente", "1º Giro"],
        })
        .select()
        .single();

      if (!error && data) return data;
    }
  } catch (err) {
    console.error("[Supabase] Erro ao salvar cliente por unidade:", err);
  }
  return null;
}

export async function salvarGiroDb(giro: {
  id?: string;
  visitor_id: string;
  codigo_vinculo?: string;
  premio_id: string;
  cliente_id?: string;
  unidade: string;
  nome: string;
  nascimento: string;
  whatsapp: string;
}): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const payload: any = {
      visitor_id: giro.visitor_id,
      codigo_vinculo: giro.codigo_vinculo,
      premio_id: giro.premio_id,
      cliente_id: giro.cliente_id,
      unidade: giro.unidade,
      nome: giro.nome,
      nascimento: giro.nascimento,
      whatsapp: giro.whatsapp.replace(/\D/g, ""),
    };
    if (giro.id) payload.id = giro.id;

    const { data, error } = await supabase
      .from("mb_giros")
      .insert(payload)
      .select()
      .single();

    if (!error && data) return data;
  } catch (err) {
    console.error("[Supabase] Erro ao registrar giro:", err);
  }
  return null;
}

export async function salvarCupomDb(cupom: {
  id?: string;
  codigo_cupom: string;
  cliente_id?: string;
  cliente_nome?: string;
  cliente_whatsapp?: string;
  giro_id?: string;
  premio_id: string;
  premio_nome: string;
  premio_tipo: string;
  premio_valor?: number;
  premio_icone?: string;
  premio_cor?: string;
  unidade: string;
  visita_numero: number;
  origem_cupom?: string;
  expira_em: string;
}): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const zapClean = (cupom.cliente_whatsapp || "").replace(/\D/g, "");
    const payload: any = {
      codigo_cupom: cupom.codigo_cupom,
      cliente_id: cupom.cliente_id || null,
      cliente_nome: cupom.cliente_nome || "Cliente",
      cliente_whatsapp: zapClean,
      giro_id: cupom.giro_id || null,
      premio_id: cupom.premio_id,
      premio_nome: cupom.premio_nome,
      premio_tipo: cupom.premio_tipo,
      premio_valor: cupom.premio_valor || 0,
      premio_icone: cupom.premio_icone,
      premio_cor: cupom.premio_cor,
      unidade: cupom.unidade === "itaim_bibi" ? "pinheiros" : cupom.unidade,
      visita_numero: cupom.visita_numero,
      origem_cupom: cupom.origem_cupom || "roleta",
      expira_em: cupom.expira_em,
      utilizado: false,
    };
    if (cupom.id) payload.id = cupom.id;

    const { data, error } = await supabase
      .from("mb_cupons")
      .upsert(payload, { onConflict: "codigo_cupom" })
      .select()
      .single();

    if (!error && data) return data;
  } catch (err) {
    console.error("[Supabase] Erro ao salvar cupom:", err);
  }
  return null;
}

export async function resgatarCupomDb(codigoCupom: string, unidadeResgate: string): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const cleanCodigo = codigoCupom.toUpperCase().trim();
    const codigoComPrefixo = cleanCodigo.startsWith("MB-") ? cleanCodigo : `MB-${cleanCodigo}`;
    const codigoSemPrefixo = cleanCodigo.replace("MB-", "");

    const { data: cupom, error } = await supabase
      .from("mb_cupons")
      .select("*")
      .or(`codigo_cupom.eq.${codigoComPrefixo},codigo_cupom.eq.${codigoSemPrefixo},codigo_cupom.eq.${cleanCodigo}`)
      .limit(1)
      .maybeSingle();

    if (error || !cupom) return null;

    if (cupom.utilizado) {
      return { sucesso: false, motivo: "ja_utilizado", cupom };
    }

    if (cupom.expira_em && new Date(cupom.expira_em) < new Date()) {
      return { sucesso: false, motivo: "expirado", cupom };
    }

    const { data: cupomAtualizado, error: errUpdate } = await supabase
      .from("mb_cupons")
      .update({
        utilizado: true,
        utilizado_em: new Date().toISOString(),
        utilizado_unidade: unidadeResgate,
      })
      .eq("id", cupom.id)
      .select()
      .single();

    if (!errUpdate && cupomAtualizado) {
      // Incrementa total de resgates do cliente
      if (cupom.cliente_id) {
        const { data: cliente } = await supabase
          .from("mb_clientes")
          .select("total_resgates")
          .eq("id", cupom.cliente_id)
          .maybeSingle();

        if (cliente) {
          await supabase
            .from("mb_clientes")
            .update({ total_resgates: (cliente.total_resgates || 0) + 1 })
            .eq("id", cupom.cliente_id);
        }
      }
      return { sucesso: true, cupom: cupomAtualizado };
    }
  } catch (err) {
    console.error("[Supabase] Erro ao resgatar cupom:", err);
  }
  return null;
}

export async function buscarClientePorWhatsappDb(
  whatsapp: string,
  unidade?: string
): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const zapClean = whatsapp.replace(/\D/g, "");
    let query = supabase.from("mb_clientes").select("*").eq("whatsapp", zapClean);

    if (unidade) {
      query = query.eq("unidade_origem", unidade);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.error("[Supabase] Erro ao buscar cliente por whatsapp e unidade:", err);
  }
  return null;
}

export async function calcularVisitasPorUnidadeDb(
  whatsapp: string,
  unidade: string
): Promise<number> {
  if (!isSupabaseConfigured || !supabase) return 1;

  try {
    const zapClean = whatsapp.replace(/\D/g, "");
    const { count, error } = await supabase
      .from("mb_giros")
      .select("*", { count: "exact", head: true })
      .eq("whatsapp", zapClean)
      .eq("unidade", unidade);

    if (!error && typeof count === "number") {
      return count + 1;
    }
  } catch (err) {
    console.error("[Supabase] Erro ao calcular visitas por unidade:", err);
  }
  return 1;
}

export async function buscarCuponsPorClienteWhatsappDb(
  whatsapp: string
): Promise<{ cliente: any; cupons: any[] } | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const zapClean = (whatsapp || "").replace(/\D/g, "");
    if (!zapClean || zapClean.length < 8) return null;

    const ultimos8 = zapClean.slice(-8);

    // 1. Busca cliente por whatsapp
    const { data: cliente } = await supabase
      .from("mb_clientes")
      .select("*")
      .or(`whatsapp.eq.${zapClean},whatsapp.like.%${ultimos8}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2. Busca cupons pelo WhatsApp diretamente na coluna indexada
    const { data: cuponsPorZap } = await supabase
      .from("mb_cupons")
      .select("*")
      .or(`cliente_whatsapp.eq.${zapClean},cliente_whatsapp.like.%${ultimos8}`)
      .order("criado_em", { ascending: false });

    let todosCupons = cuponsPorZap || [];

    // Se não encontrou por zap direto, busca pelos IDs de cliente e giros
    if (todosCupons.length === 0) {
      const { data: giros } = await supabase
        .from("mb_giros")
        .select("id, cliente_id, visitor_id")
        .or(`whatsapp.eq.${zapClean},whatsapp.like.%${ultimos8}`);

      const clienteIds = new Set<string>();
      const giroIds = new Set<string>();

      if (cliente?.id) clienteIds.add(cliente.id);
      if (cliente?.visitor_id) clienteIds.add(cliente.visitor_id);
      clienteIds.add(`cli_${zapClean}`);

      (giros || []).forEach((g: any) => {
        if (g.cliente_id) clienteIds.add(g.cliente_id);
        if (g.visitor_id) clienteIds.add(g.visitor_id);
        if (g.id) giroIds.add(g.id);
      });

      const idList = Array.from(clienteIds);
      const gList = Array.from(giroIds);

      if (idList.length > 0 || gList.length > 0) {
        let query = supabase
          .from("mb_cupons")
          .select("*")
          .order("criado_em", { ascending: false });

        if (idList.length > 0 && gList.length > 0) {
          query = query.or(`cliente_id.in.(${idList.join(",")}),giro_id.in.(${gList.join(",")})`);
        } else if (idList.length > 0) {
          query = query.in("cliente_id", idList);
        } else if (gList.length > 0) {
          query = query.in("giro_id", gList);
        }

        const { data: cuponsFallback } = await query;
        if (cuponsFallback && cuponsFallback.length > 0) {
          todosCupons = cuponsFallback;
        }
      }
    }

    const nomeCliente = cliente?.nome || todosCupons[0]?.cliente_nome || "Cliente";

    const cupons = todosCupons.map((c: any) => ({
      id: c.id,
      codigo_cupom: c.codigo_cupom,
      premio_id: c.premio_id,
      premio: {
        id: c.premio_id,
        nome: c.premio_nome || "Prêmio Fidelidade",
        tipo: c.premio_tipo || "produto",
        valor: Number(c.premio_valor) || 0,
        icone: c.premio_icone || "🎁",
        cor_fatia: c.premio_cor || "#e6398f",
      },
      cliente_nome: c.cliente_nome || nomeCliente,
      cliente_whatsapp: c.cliente_whatsapp || zapClean,
      unidade: c.unidade === "itaim_bibi" ? "pinheiros" : c.unidade,
      visita_numero: c.visita_numero || 1,
      origem_cupom: c.origem_cupom || "roleta",
      status: c.utilizado
        ? "utilizado"
        : new Date(c.expira_em) < new Date()
        ? "expirado"
        : "disponivel",
      criado_em: c.criado_em,
      expira_em: c.expira_em,
      utilizado_em: c.utilizado_em || null,
      utilizado_unidade: c.utilizado_unidade === "itaim_bibi" ? "pinheiros" : c.utilizado_unidade || null,
    }));

    return {
      cliente: cliente || { nome: nomeCliente, whatsapp: zapClean },
      cupons,
    };
  } catch (err) {
    console.error("[Supabase] Erro ao processar busca de cupons:", err);
    return null;
  }
}
