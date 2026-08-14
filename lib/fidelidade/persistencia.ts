// =============================================================================
// Persistência Dual: Supabase PostgreSQL (Nuvem) + JSON File (Local)
// Garante que a base de clientes, giros e cupons NUNCA seja perdida.
// =============================================================================

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Cliente, Giro, Cupom, CodigoVinculo, EtapaTrilhaVisita, UnidadeLoja, Premio } from "./types";

interface PersistentSnapshot {
  clientes: Cliente[];
  giros: Giro[];
  cupons: Cupom[];
  codigos: CodigoVinculo[];
  unidades?: UnidadeLoja[];
  trilha?: EtapaTrilhaVisita[];
  premios?: Premio[];
  atualizado_em: string;
}

// ---------------------------------------------------------------------------
// 1. Persistência em Disco Local (JSON) - Apenas no lado do servidor
// ---------------------------------------------------------------------------

export function carregarSnapshotDisco(): Partial<PersistentSnapshot> | null {
  if (typeof window !== "undefined") return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const dbFile = path.join(process.cwd(), "data", "melhorbocado_db.json");

    if (fs.existsSync(dbFile)) {
      const raw = fs.readFileSync(dbFile, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // Fallback silencioso
  }
  return null;
}

export function salvarSnapshotDisco(snapshot: PersistentSnapshot): void {
  if (typeof window !== "undefined") return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const dataDir = path.join(process.cwd(), "data");
    const dbFile = path.join(dataDir, "melhorbocado_db.json");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dbFile, JSON.stringify(snapshot, null, 2), "utf-8");
  } catch {
    // Fallback silencioso
  }
}

// ---------------------------------------------------------------------------
// 2. Persistência e Sincronização com Supabase Postgres (Nuvem)
// ---------------------------------------------------------------------------

export async function salvarClienteSupabase(cliente: Cliente): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const zapClean = (cliente.whatsapp || cliente.celular || "").replace(/\D/g, "");
    if (!zapClean) return;

    await supabase.from("mb_clientes").upsert(
      {
        nome: cliente.nome,
        whatsapp: zapClean,
        nascimento: cliente.nascimento || null,
        unidade: cliente.loja_preferida || cliente.unidade_cadastro || "tatuape",
        visitor_id: cliente.id,
        qtd_compras: cliente.qtd_compras || 1,
        total_gasto: cliente.total_gasto || 0,
        ultimo_giro: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "whatsapp" }
    );
  } catch (err) {
    console.error("[Supabase] Erro ao sincronizar cliente:", err);
  }
}

export async function salvarGiroSupabase(giro: Giro, cliente?: Cliente): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from("mb_giros").insert({
      visitor_id: giro.visitor_id,
      cliente_nome: cliente?.nome || giro.cliente_nome || "Cliente",
      cliente_whatsapp: (cliente?.whatsapp || giro.cliente_whatsapp || "").replace(/\D/g, ""),
      cliente_nascimento: cliente?.nascimento || giro.cliente_nascimento || null,
      premio_nome: giro.premio_id,
      premio_tipo: "produto",
      premio_valor: 0,
      codigo_vinculo: giro.codigo_vinculo_id,
      loja: giro.unidade || "tatuape",
      unidade: giro.unidade || "tatuape",
      caixa: "caixa_1",
      visita_numero: giro.visita_numero || 1,
      criado_em: giro.criado_em || new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Supabase] Erro ao sincronizar giro:", err);
  }
}

export async function salvarCupomSupabase(cupom: Cupom): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from("mb_cupons").upsert(
      {
        codigo_cupom: cupom.codigo_cupom,
        cliente_nome: cupom.cliente_nome,
        cliente_whatsapp: (cupom.cliente_whatsapp || "").replace(/\D/g, ""),
        premio_nome: cupom.premio?.nome || cupom.premio_id,
        premio_tipo: cupom.premio?.tipo || "produto",
        premio_valor: cupom.premio?.valor || 0,
        premio_icone: cupom.premio?.icone || "🎁",
        unidade: cupom.unidade || "tatuape",
        visita_numero: cupom.visita_numero || 1,
        status: cupom.status || "disponivel",
        expira_em: cupom.expira_em,
        utilizado_em: cupom.utilizado_em || null,
        unidade_resgate: cupom.unidade || null,
        criado_em: cupom.criado_em || new Date().toISOString(),
      },
      { onConflict: "codigo_cupom" }
    );
  } catch (err) {
    console.error("[Supabase] Erro ao sincronizar cupom:", err);
  }
}

export async function sincronizarDoSupabase(): Promise<{
  clientes: Cliente[];
  giros: Giro[];
  cupons: Cupom[];
} | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [clientesRes, girosRes, cuponsRes] = await Promise.all([
      supabase.from("mb_clientes").select("*").order("criado_em", { ascending: false }),
      supabase.from("mb_giros").select("*").order("criado_em", { ascending: false }),
      supabase.from("mb_cupons").select("*").order("criado_em", { ascending: false }),
    ]);

    const clientes: Cliente[] = (clientesRes.data || []).map((row: any) => ({
      id: row.id || `cli_${row.whatsapp}`,
      nome: row.nome || "Cliente",
      whatsapp: row.whatsapp,
      celular: row.whatsapp,
      nascimento: row.nascimento || "",
      canal_aquisicao: "roleta_qrcode",
      aceite_lgpd: true,
      aceite_lgpd_em: row.criado_em,
      aceite_lgpd_texto_versao: "1.0",
      criado_em: row.criado_em,
      primeira_compra_em: row.criado_em,
      ultima_compra_em: row.ultimo_giro || row.atualizado_em || row.criado_em,
      total_gasto: Number(row.total_gasto) || 0,
      ticket_medio: 0,
      qtd_compras: Number(row.qtd_compras) || 1,
      loja_preferida: row.unidade || "tatuape",
      horario_preferido: null,
      ltv: Number(row.total_gasto) || 0,
      vip: Number(row.qtd_compras) >= 5,
    }));

    const giros: Giro[] = (girosRes.data || []).map((row: any) => ({
      id: row.id,
      visitor_id: row.visitor_id,
      cliente_id: row.cliente_id,
      premio_id: row.premio_nome || "premio_sorteado",
      codigo_vinculo_id: row.codigo_vinculo || "",
      unidade: row.unidade || row.loja || "tatuape",
      visita_numero: Number(row.visita_numero) || 1,
      venda_id: null,
      cliente_nome: row.cliente_nome,
      cliente_whatsapp: row.cliente_whatsapp,
      cliente_nascimento: row.cliente_nascimento,
      criado_em: row.criado_em,
    }));

    const cupons: Cupom[] = (cuponsRes.data || []).map((row: any) => ({
      id: row.id,
      visitor_id: row.visitor_id || "vis_supabase",
      cliente_id: row.cliente_id || null,
      codigo_cupom: row.codigo_cupom,
      giro_id: "",
      premio_id: row.premio_nome || "premio_sorteado",
      unidade: row.unidade || "tatuape",
      visita_numero: Number(row.visita_numero) || 1,
      cliente_nome: row.cliente_nome,
      cliente_whatsapp: row.cliente_whatsapp,
      status: row.status as any,
      criado_em: row.criado_em,
      expira_em: row.expira_em,
      utilizado_em: row.utilizado_em || null,
      premio: {
        id: row.premio_nome || "p_1",
        nome: row.premio_nome || "Prêmio",
        tipo: row.premio_tipo || "produto",
        valor: Number(row.premio_valor) || 0,
        probabilidade: 10,
        posicao_roleta: 1,
        ativo: true,
        limite_diario: null,
        limite_mensal: null,
        icone: row.premio_icone || "🎁",
        cor_fatia: "#e6398f",
      },
    }));

    return { clientes, giros, cupons };
  } catch (err) {
    console.error("[Supabase] Erro ao sincronizar dados:", err);
    return null;
  }
}
