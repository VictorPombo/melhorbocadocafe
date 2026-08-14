# Dossiê Executivo & Guia Operacional do Sistema de Fidelidade
**Melhor Bocado Café & Confeitaria**  
*Release 2.4.0 (Enterprise) — Homologação e Manual de Uso*

---

## 1. Sumário Executivo & Proposta de Valor

O **Sistema de Fidelidade Melhor Bocado** foi desenvolvido para transformar clientes casuais em clientes recorrentes e leais de alto LTV (Lifetime Value). 

### Pilares Fundamentais:
1. **Gamificação com Feedback Imediato**: Roleta interativa com 10 fatias, animação CSS/SVG fluida, sintetizador de som mecânico (tiques de catraca e fanfarra de vitória via Web Audio API sem dependência de arquivos de áudio externos) e vibração tátil (haptic feedback).
2. **Arquitetura Antifraude e Uso Único**: Trava atômica no banco de dados e na memória que consome o QR Code da compra imediatamente no primeiro giro. Tentativas de recarregar a página ou reutilizar o mesmo código exibem aviso bloqueando novos giros.
3. **Isolamento Total Multi-Unidades**: Cada filial (Tatuapé, Mooca, Campo Belo, Santana, Santo Amaro) gera seus próprios códigos de balcão com identificador único (`TAT-XXXX`, `MOO-XXXX`, etc.), eliminando qualquer colisão ou interferência entre unidades.
4. **Deduplicação Inteligente de Clientes**: A chave primária de identificação é o número de **Celular/WhatsApp** com DDD. Clientes que giram a roleta em visitas subsequentes têm seu histórico unificado, registrando a 1ª, 2ª, 3ª ou 4ª+ visita sem criar clientes duplicados.
5. **Inteligência de CRM & Análise de Público-Alvo**: Métricas demográficas derivadas da Data de Nascimento (faixas etárias: 18-24, 25-34, 35-44, 45-54, 55+ anos), ticket médio por idade, produtos favoritos de cada perfil e gerador de campanhas prontas para disparo via WhatsApp e Instagram Ads.

---

## 2. Links Diretos para Teste & Homologação

Para testar todos os fluxos do sistema no seu navegador (desktop ou mobile), utilize as rotas abaixo:

| # | Módulo / Experiência | Rota / URL de Teste | Descrição |
|---|----------------------|---------------------|-----------|
| 1 | **Roleta do Cliente (Mobile)** | `/fidelidade/girar?codigo=TAT-8821&unidade=tatuape` | Simulação da leitura de QR code pelo cliente na Unidade Tatuapé. |
| 2 | **Carteira Digital de Cupons** | `/fidelidade/meus-cupons` | Visualização dos cupons conquistados pelo cliente com código e validade. |
| 3 | **Painel de Gestão & Balcões** | `/gestao/fidelidade` | Painel com gerador de QR Codes, métricas ao vivo e editor dos 10 prêmios. |
| 4 | **Validador de Caixa** | `/gestao/fidelidade/caixa` | Tela do caixa para digitação e validação de cupons no momento do pagamento. |
| 5 | **Guia Executivo & PDF** | `/gestao/guia-apresentacao` | Visualização executiva com botão para exportar/imprimir PDF de alta qualidade. |

---

## 3. Manual de Operação Passo a Passo (Parte por Parte)

### Parte 1: Operação no Balcão & Geração de QR Code
1. O operador do caixa acessa `/gestao/fidelidade` e clica na aba **"Gerador de QR Code"**.
2. Seleciona a sua filial correspondente (ex: Tatuapé) e o terminal (ex: Caixa 01).
3. Clica em **"Gerar Novo QR Code de 1 Giro"**.
4. O QR Code é exibido em tamanho grande no display do balcão (ou impresso na comanda).
5. O cliente aponta a câmera do celular para o código para iniciar sua experiência.

### Parte 2: Experiência Gamificada do Cliente
1. A roleta abre instantaneamente no navegador do celular do cliente (sem necessidade de instalar nenhum aplicativo da App Store/Play Store).
2. O formulário solicita apenas 4 dados essenciais:
   - **Nome Completo**
   - **Celular / WhatsApp (com DDD)**
   - **Data de Nascimento (DD/MM/AAAA)**
   - **Unidade da Loja**
3. O cliente clica em **"Girar a Roleta! 🎰"**. A roleta gira com sons de catraca desacelerando e aciona a fanfarra ao parar no prêmio sorteado.
4. É exibido na tela o **Código Alfanumérico de Resgate** (ex: `MB-88A2`) com instruções para apresentar ao atendente.

### Parte 3: Gestão & Configuração dos 10 Prêmios
1. No painel administrativo, o gestor acessa a aba **"Editar 10 Prêmios"**.
2. Pode alterar livremente:
   - Nome do Prêmio (ex: *Donut Pistache Nobre*, *Café Expresso*, *10% OFF*)
   - Tipo (*Produto* ou *Desconto %*)
   - Valor
   - Cor da fatia na roleta
   - Probabilidade percentual de sorteio (%)
3. O sistema valida automaticamente se a soma das probabilidades é igual a **100%**.
4. Ao salvar, a roleta de todas as lojas é sincronizada em tempo real.

### Parte 4: Dados Demográficos Coletados na Roleta
1. O gestor acessa a aba **"Público-Alvo & Demografia"**.
2. Analisa a **Distribuição por Faixa Etária** (18-24, 25-34, 35-44, 45-54, 55+ anos) calculada a partir da data de nascimento informada na roleta.
3. Acompanha a **Idade Média** dos clientes e a **Taxa de Retorno** da base.
4. Consulta a **Tabela de Clientes Coletados** (Nome, WhatsApp, Nascimento, Idade, Loja e Total de Visitas) com busca e filtros por filial.

### Parte 5: Validação e Resgate do Prêmio no Caixa
1. O cliente apresenta o código do cupom gerado na roleta (ex: `MB-S0F9`) ao operador de caixa.
2. O atendente abre o **Terminal do Caixa** (`/gestao/fidelidade/caixa`), digita o código e clica em **"Validar e Resgatar"**.
3. O sistema confirma o prêmio, aplica na comanda/PDV e queima o cupom com segurança.
4. O resgate é sincronizado no **Feed em Tempo Real** do painel de gestão.

---

## 4. Arquitetura de Segurança & Regras de Negócio

- **Consumo Único do QR Code**: Cada compra gera um código com expiração e uso único. Ao ser consumido pelo endpoint `/api/fidelidade/girar`, o código transiciona para o status `utilizado` e rejeita qualquer nova requisição com o erro `MB_CODE_ALREADY_USED`.
- **Deduplicação pelo WhatsApp**: O número de telefone normalizado (apenas números) impede cadastros duplicados e preserva o LTV e histórico do cliente em qualquer filial da rede Melhor Bocado.
- **Auditoria de Cupons**: Cada cupom emitido possui código de 6 a 8 caracteres alfanuméricos, data limite de resgate (7 a 30 dias) e status de controle no caixa.
