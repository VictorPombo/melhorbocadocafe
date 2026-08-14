-- =============================================================================
-- MIGRATION: Trava Antifraude de Uso Único de QR Code & Deduplicação por WhatsApp
-- Data: 2026-08-14
-- =============================================================================

ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS celular TEXT;

ALTER TABLE public.roleta_giros ADD COLUMN IF NOT EXISTS cliente_whatsapp TEXT;
ALTER TABLE public.roleta_giros ADD COLUMN IF NOT EXISTS status_codigo TEXT DEFAULT 'utilizado';

ALTER TABLE public.cupons ADD COLUMN IF NOT EXISTS cliente_whatsapp TEXT;

CREATE INDEX IF NOT EXISTS idx_giros_codigo_vinculo_unique ON public.roleta_giros(codigo_vinculo);
CREATE INDEX IF NOT EXISTS idx_clientes_whatsapp_clean ON public.clientes((regexp_replace(whatsapp, '\D', '', 'g')));

-- Atualização da RPC fn_sortear_girar_roleta com trava antifraude e deduplicação
CREATE OR REPLACE FUNCTION public.fn_sortear_girar_roleta(
  p_visitor_id TEXT,
  p_codigo_vinculo TEXT,
  p_cliente_id UUID DEFAULT NULL,
  p_loja TEXT DEFAULT 'tatuape',
  p_caixa TEXT DEFAULT 'caixa_1',
  p_cliente_nome TEXT DEFAULT NULL,
  p_cliente_nascimento DATE DEFAULT NULL,
  p_cliente_whatsapp TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_giro_existente INT := 0;
  v_premio RECORD;
  v_giro_id UUID;
  v_cupom_id UUID;
  v_codigo_cupom TEXT;
  v_peso_total NUMERIC;
  v_sorteio NUMERIC;
  v_acumulado NUMERIC := 0;
  v_visita_numero INT := 1;
  v_final_cliente_id UUID := p_cliente_id;
  v_zap_clean TEXT;
BEGIN
  -- 1. TRAVA ANTIFRAUDE: Código de vínculo / QR code não pode ser reutilizado
  IF p_codigo_vinculo IS NOT NULL AND p_codigo_vinculo <> '' THEN
    SELECT COUNT(*) INTO v_giro_existente
    FROM public.roleta_giros
    WHERE codigo_vinculo = p_codigo_vinculo;

    IF v_giro_existente > 0 THEN
      RAISE EXCEPTION 'MB_CODE_ALREADY_USED: Este QR Code já foi utilizado nesta compra. Solicite um novo QR Code ao atendente.'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- 2. DEDUPLICAÇÃO DE CLIENTE: Busca por WhatsApp se não passou ID
  IF p_cliente_whatsapp IS NOT NULL AND p_cliente_whatsapp <> '' THEN
    v_zap_clean := regexp_replace(p_cliente_whatsapp, '\D', '', 'g');
    
    IF v_final_cliente_id IS NULL AND v_zap_clean <> '' THEN
      SELECT id INTO v_final_cliente_id
      FROM public.clientes
      WHERE regexp_replace(COALESCE(whatsapp, celular, ''), '\D', '', 'g') = v_zap_clean
      LIMIT 1;
    END IF;
  END IF;

  -- 3. Calcula o número de visitas deste cliente/visitor
  SELECT COUNT(*) + 1 INTO v_visita_numero
  FROM public.roleta_giros
  WHERE visitor_id = p_visitor_id 
     OR (v_final_cliente_id IS NOT NULL AND cliente_id = v_final_cliente_id)
     OR (v_zap_clean IS NOT NULL AND cliente_whatsapp = v_zap_clean);

  -- 4. Sorteia o prêmio respeitando a probabilidade entre os ativos
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

  -- 5. Registra o giro no histórico consumindo o código
  INSERT INTO public.roleta_giros (
    visitor_id, cliente_id, premio_id, codigo_vinculo, loja, caixa, unidade, visita_numero, cliente_nome, cliente_nascimento, cliente_whatsapp
  ) VALUES (
    p_visitor_id, v_final_cliente_id, v_premio.id, p_codigo_vinculo, p_loja, p_caixa, p_loja, v_visita_numero, p_cliente_nome, p_cliente_nascimento, v_zap_clean
  ) RETURNING id INTO v_giro_id;

  -- 6. Gera código de cupom único (Ex: MB-A8K2)
  v_codigo_cupom := 'MB-' || upper(substring(md5(random()::text) from 1 for 4));

  INSERT INTO public.cupons (
    visitor_id, cliente_id, premio_id, giro_id, codigo_cupom, expira_em, unidade, visita_numero, cliente_nome, cliente_nascimento, cliente_whatsapp
  ) VALUES (
    p_visitor_id, v_final_cliente_id, v_premio.id, v_giro_id, v_codigo_cupom, (now() + INTERVAL '7 days'), p_loja, v_visita_numero, p_cliente_nome, p_cliente_nascimento, v_zap_clean
  ) RETURNING id INTO v_cupom_id;

  -- 7. Retorna o resultado completo em JSON
  RETURN jsonb_build_object(
    'sucesso', true,
    'giro_id', v_giro_id,
    'visita_numero', v_visita_numero,
    'unidade', p_loja,
    'cliente_nome', p_cliente_nome,
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
