-- =============================================================================
-- MIGRATION: Roleta Gamificada - Fidelidade Melhor Bocado Café
-- Data: 2026-07-30
-- Descrição: Estrutura para 10 prêmios configuráveis, giros por visitor_id sem login
--            e controle de cupons atômico via RPC SQL.
-- =============================================================================

-- 1. Tabela de Clientes (Base se ainda não existir)
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  whatsapp TEXT UNIQUE NOT NULL,
  nascimento DATE,
  canal_aquisicao TEXT DEFAULT 'outro',
  aceite_lgpd BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Prêmios (10 fatias da roleta visual)
CREATE TABLE IF NOT EXISTS public.premios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('produto', 'desconto')),
  valor NUMERIC NOT NULL DEFAULT 0,
  probabilidade NUMERIC NOT NULL DEFAULT 10, -- Peso na roleta (0-100)
  posicao_roleta INT NOT NULL CHECK (posicao_roleta BETWEEN 1 AND 10),
  ativo BOOLEAN NOT NULL DEFAULT true,
  limite_diario INT DEFAULT NULL,
  limite_mensal INT DEFAULT NULL,
  cor_fatia TEXT NOT NULL DEFAULT '#e6398f',
  icone TEXT NOT NULL DEFAULT '🎁',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garantir índice único para posição da roleta em prêmios ativos
CREATE UNIQUE INDEX IF NOT EXISTS idx_premios_posicao_roleta ON public.premios(posicao_roleta);

-- 3. Tabela de Histórico de Giros (Sem necessidade de login via visitor_id)
CREATE TABLE IF NOT EXISTS public.roleta_giros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL, -- Identificador único do dispositivo/browser
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  premio_id UUID NOT NULL REFERENCES public.premios(id),
  codigo_vinculo TEXT NOT NULL,
  loja TEXT NOT NULL DEFAULT 'tatuape',
  caixa TEXT DEFAULT 'caixa_1',
  ip_address TEXT,
  user_agent TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_giros_visitor_id ON public.roleta_giros(visitor_id);
CREATE INDEX IF NOT EXISTS idx_giros_codigo_vinculo ON public.roleta_giros(codigo_vinculo);

-- 4. Tabela de Cupons Gerados
CREATE TABLE IF NOT EXISTS public.cupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  premio_id UUID NOT NULL REFERENCES public.premios(id),
  giro_id UUID UNIQUE REFERENCES public.roleta_giros(id) ON DELETE CASCADE,
  codigo_cupom TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'utilizado', 'expirado')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  utilizado_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cupons_visitor_id ON public.cupons(visitor_id);
CREATE INDEX IF NOT EXISTS idx_cupons_codigo ON public.cupons(codigo_cupom);

-- 5. Tabela de Configurações Gerais da Roleta
CREATE TABLE IF NOT EXISTS public.roleta_config (
  chave TEXT PRIMARY KEY,
  valor JSONB NOT NULL,
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.roleta_config (chave, valor)
VALUES 
  ('modo_sorteio', '"probabilidade"'::jsonb),
  ('max_giros_diarios_por_visitor', '3'::jsonb),
  ('duracao_cupom_dias', '7'::jsonb)
ON CONFLICT (chave) DO NOTHING;

-- 6. Seed dos 10 Prêmios Iniciais da Roleta
INSERT INTO public.premios (nome, tipo, valor, probabilidade, posicao_roleta, ativo, cor_fatia, icone)
VALUES
  ('Donut Glazed Clássico', 'produto', 0, 15, 1, true, '#e6398f', '🍩'),
  ('10% de Desconto', 'desconto', 10, 20, 2, true, '#f43f5e', '💰'),
  ('Café Expresso Grátis', 'produto', 0, 15, 3, true, '#d97706', '☕'),
  ('15% de Desconto', 'desconto', 15, 10, 4, true, '#8b5cf6', '🎉'),
  ('Donut Chocolate Belga', 'produto', 0, 10, 5, true, '#ec4899', '🍫'),
  ('5% de Desconto', 'desconto', 5, 15, 6, true, '#10b981', '🏷️'),
  ('Capuccino Pequeno', 'produto', 0, 5, 7, true, '#3b82f6', '🥤'),
  ('20% de Desconto VIP', 'desconto', 20, 3, 8, true, '#ef4444', '🌟'),
  ('Mini Donut Recheado', 'produto', 0, 5, 9, true, '#6366f1', '🧁'),
  ('Tente Novamente', 'desconto', 0, 2, 10, true, '#6b7280', '🔄')
ON CONFLICT (id) DO NOTHING;

-- 7. Função RPC atômica para sorteio e gravação no banco
CREATE OR REPLACE FUNCTION public.fn_sortear_girar_roleta(
  p_visitor_id TEXT,
  p_codigo_vinculo TEXT,
  p_cliente_id UUID DEFAULT NULL,
  p_loja TEXT DEFAULT 'tatuape',
  p_caixa TEXT DEFAULT 'caixa_1'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_giro_existente INT;
  v_premio RECORD;
  v_giro_id UUID;
  v_cupom_id UUID;
  v_codigo_cupom TEXT;
  v_peso_total NUMERIC;
  v_sorteio NUMERIC;
  v_acumulado NUMERIC := 0;
BEGIN
  -- A. Valida se o código de vínculo já foi utilizado
  SELECT COUNT(*) INTO v_giro_existente 
  FROM public.roleta_giros 
  WHERE codigo_vinculo = p_codigo_vinculo;

  IF v_giro_existente > 0 THEN
    RAISE EXCEPTION 'Este código de 4 dígitos já foi utilizado.';
  END IF;

  -- B. Sorteia o prêmio respeitando a probabilidade entre os ativos
  SELECT SUM(probabilidade) INTO v_peso_total FROM public.premios WHERE ativo = true;

  IF v_peso_total IS NULL OR v_peso_total <= 0 THEN
    SELECT * INTO v_premio FROM public.premios WHERE ativo = true ORDER BY posicao_roleta LIMIT 1;
  ELSE
    v_sorteio := random() * v_peso_total;

    FOR v_premio IN 
      SELECT * FROM public.premios WHERE ativo = true ORDER BY posicao_roleta
    LOOP
      v_acumulado := v_acumulado + v_premio.probabilidade;
      IF v_sorteio <= v_acumulado THEN
        EXIT;
      END IF;
    END LOOP;
  END IF;

  -- C. Registra o giro no histórico
  INSERT INTO public.roleta_giros (
    visitor_id, cliente_id, premio_id, codigo_vinculo, loja, caixa
  ) VALUES (
    p_visitor_id, p_cliente_id, v_premio.id, p_codigo_vinculo, p_loja, p_caixa
  ) RETURNING id INTO v_giro_id;

  -- D. Gera código de cupom único (Ex: MB-A8K2)
  v_codigo_cupom := 'MB-' || upper(substring(md5(random()::text) from 1 for 4));

  INSERT INTO public.cupons (
    visitor_id, cliente_id, premio_id, giro_id, codigo_cupom, expira_em
  ) VALUES (
    p_visitor_id, p_cliente_id, v_premio.id, v_giro_id, v_codigo_cupom, (now() + INTERVAL '7 days')
  ) RETURNING id INTO v_cupom_id;

  -- E. Retorna o resultado completo em JSON
  RETURN jsonb_build_object(
    'sucesso', true,
    'giro_id', v_giro_id,
    'premio', jsonb_build_object(
      'id', v_premio.id,
      'nome', v_premio.nome,
      'tipo', v_premio.tipo,
      'valor', v_premio.valor,
      'posicao_roleta', v_premio.posicao_roleta,
      'cor_fatia', v_premio.cor_fatia,
      'icone', v_premio.icone
    ),
    'cupom', jsonb_build_object(
      'id', v_cupom_id,
      'codigo_cupom', v_codigo_cupom,
      'expira_em', (now() + INTERVAL '7 days')
    )
  );
END;
$$;

-- 8. Habilitar RLS (Row Level Security)
ALTER TABLE public.premios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roleta_giros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roleta_config ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
CREATE POLICY "Permitir leitura pública de prêmios ativos" 
  ON public.premios FOR SELECT USING (true);

CREATE POLICY "Permitir leitura de cupons por visitor_id" 
  ON public.cupons FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de giros" 
  ON public.roleta_giros FOR INSERT WITH CHECK (true);
