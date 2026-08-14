-- =============================================================================
-- MIGRATION: Adição de Unidade, Visita Número e RPC de Giro com Unidade
-- Data: 2026-08-12
-- =============================================================================

ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS unidade_cadastro TEXT DEFAULT 'tatuape';
ALTER TABLE public.roleta_giros ADD COLUMN IF NOT EXISTS unidade TEXT DEFAULT 'tatuape';
ALTER TABLE public.roleta_giros ADD COLUMN IF NOT EXISTS visita_numero INT DEFAULT 1;
ALTER TABLE public.roleta_giros ADD COLUMN IF NOT EXISTS cliente_nome TEXT;
ALTER TABLE public.roleta_giros ADD COLUMN IF NOT EXISTS cliente_nascimento DATE;

ALTER TABLE public.cupons ADD COLUMN IF NOT EXISTS unidade TEXT DEFAULT 'tatuape';
ALTER TABLE public.cupons ADD COLUMN IF NOT EXISTS visita_numero INT DEFAULT 1;
ALTER TABLE public.cupons ADD COLUMN IF NOT EXISTS cliente_nome TEXT;
ALTER TABLE public.cupons ADD COLUMN IF NOT EXISTS cliente_nascimento DATE;
ALTER TABLE public.cupons ADD COLUMN IF NOT EXISTS balconista_resgatou TEXT;

-- Atualização da RPC fn_sortear_girar_roleta
CREATE OR REPLACE FUNCTION public.fn_sortear_girar_roleta(
  p_visitor_id TEXT,
  p_codigo_vinculo TEXT,
  p_cliente_id UUID DEFAULT NULL,
  p_loja TEXT DEFAULT 'tatuape',
  p_caixa TEXT DEFAULT 'caixa_1',
  p_cliente_nome TEXT DEFAULT NULL,
  p_cliente_nascimento DATE DEFAULT NULL
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
  v_visita_numero INT := 1;
BEGIN
  -- A. Calcula o número de visitas deste cliente/visitor
  SELECT COUNT(*) + 1 INTO v_visita_numero
  FROM public.roleta_giros
  WHERE visitor_id = p_visitor_id OR (p_cliente_id IS NOT NULL AND cliente_id = p_cliente_id);

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
    visitor_id, cliente_id, premio_id, codigo_vinculo, loja, caixa, unidade, visita_numero, cliente_nome, cliente_nascimento
  ) VALUES (
    p_visitor_id, p_cliente_id, v_premio.id, p_codigo_vinculo, p_loja, p_caixa, p_loja, v_visita_numero, p_cliente_nome, p_cliente_nascimento
  ) RETURNING id INTO v_giro_id;

  -- D. Gera código de cupom único (Ex: MB-A8K2)
  v_codigo_cupom := 'MB-' || upper(substring(md5(random()::text) from 1 for 4));

  INSERT INTO public.cupons (
    visitor_id, cliente_id, premio_id, giro_id, codigo_cupom, expira_em, unidade, visita_numero, cliente_nome, cliente_nascimento
  ) VALUES (
    p_visitor_id, p_cliente_id, v_premio.id, v_giro_id, v_codigo_cupom, (now() + INTERVAL '7 days'), p_loja, v_visita_numero, p_cliente_nome, p_cliente_nascimento
  ) RETURNING id INTO v_cupom_id;

  -- E. Retorna o resultado completo em JSON
  RETURN jsonb_build_object(
    'sucesso', true,
    'giro_id', v_giro_id,
    'visita_numero', v_visita_numero,
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
