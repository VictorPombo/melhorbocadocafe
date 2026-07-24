# Documentação da API Degust (Linx) — Pesquisa e Achados

> Última atualização: 2026-07-15
> Fonte: Swagger JSON em `https://lx-degust-api-integracao-hmg.azurewebsites.net/swagger/v1/swagger.json`

---

## 1. Visão Geral

A **API de Integrações Externa Linx** é uma API REST hospedada na Azure que expõe dados do sistema Degust para parceiros e integradores. Ela **NÃO** é um webhook — a integração é por **polling** (consulta periódica).

- **Base URL Produção:** `https://lx-degust-api-integracao-prd.azurewebsites.net/`
- **Base URL Homologação:** `https://lx-degust-api-integracao-hmg.azurewebsites.net/`
- **Formato:** REST (JSON)
- **Versionamento:** `?api-version=1.0`

---

## 2. Autenticação

| Campo             | Detalhe                                                              |
|-------------------|----------------------------------------------------------------------|
| **Endpoint**      | `POST /api/usuario/autenticar`                                       |
| **Body (JSON)**   | `{ "usuario": "...", "senha": "...", "codigoFranqueador": 123 }`     |
| **Retorno**       | Token Bearer (string)                                                |
| **Validade**      | **4 horas** (não permitido gerar novo token a cada hora pro mesmo usuário) |
| **Uso**           | Header `Authorization: Bearer {token}` em todas as chamadas         |
| **Credenciais**   | Mesmo login do **Degust One** (https://degustone.com.br/login)       |

### Variáveis de ambiente necessárias

```env
DEGUST_API_BASE_URL=https://lx-degust-api-integracao-prd.azurewebsites.net
DEGUST_USUARIO=<login_degust_one>
DEGUST_SENHA=<senha_degust_one>
DEGUST_CODIGO_FRANQUEADOR=<int>
DEGUST_CODIGO_LOJA=<int>
```

---

## 3. Endpoints Relevantes para o CRM de Fidelidade

### 3.1 Relatório de Vendas (⭐ PRINCIPAL)

**`POST /api/venda/relatorio-vendas`**

Retorna vendas detalhadas com itens, pagamentos, documentos, cancelamentos, descontos e delivery.

**Parâmetros (body):**
```json
{
  "dataInicial": "2026-07-15",
  "dataFinal": "2026-07-15",
  "codFranqueador": 123,
  "codLoja": 1,
  "tipoData": "C",           // "C" = data caixa, "A" = data autorização NF
  "exibirVendasCanceladas": false
}
```

**Resposta — `VendaResult[]`:**
```typescript
interface VendaResult {
  cnpj: string;
  centroDeCusto: string;
  codFranqueador: number;
  codLoja: number;
  datMovimento: string;       // Data do caixa
  dataVenda: string;          // Data/hora da venda
  controle: number;           // Número de controle interno (ID único da venda)
  controlePdv: string;        // Controle do PDV
  tipoVenda: string;          // Ex: "Balcão", "Delivery"
  numPdv: string;             // ⭐ Número do PDV/Caixa (ex: "1", "2")
  numAbertura: string;        // Número da abertura do caixa
  cancelada: string;          // "S" ou "N"
  valTroco: string;
  valDesconto: string;
  valDescontoItem: string;
  valAcrescimo: string;
  valProduto: string;         // Valor bruto dos produtos
  valLiquido: string;         // ⭐ Valor líquido (total da venda)
  docConsumidor: string;      // CPF/CNPJ do consumidor (se informado)
  dataHoraInclusao: string;   // Data/hora que foi sincronizada
  mesa: MesaResult[];
  cartao: CartaoResult[];
  delivery: DeliveryResult[];
  documento: DocumentoResult[];
  desconto: DescontoResult[];
  itens: ItemVendaResult[];       // ⭐ Itens da venda
  formaPagamento: FormaPagamentoResult[];  // ⭐ Formas de pagamento
  cancelamento: CancelamentoResult[];
}
```

**Limitações:**
- Range máximo de **30 dias** por consulta.
- Dados disponíveis somente **após sincronização** do PDV local com a nuvem Degust.

---

### 3.2 Relatório de Vendas por Data de Sincronização

**`POST /api/venda/relatorio-vendas-periodo-sincronizado`**

Mesma coisa do endpoint acima, mas filtrando pela **data em que o movimento foi sincronizado** (útil para polling incremental).

**Parâmetros extras:**
- `tipoData: "S"` → filtra por data de sincronização
- `tipoData: "V"` → filtra por data da venda
- Aceita range de horas: `"2026-07-15 00:00:01"` a `"2026-07-15 23:59:59"`
- Aceita lista de lojas ou intervalo

---

### 3.3 Detalhamento de Caixa

**`POST /api/caixa/detalhamento-caixa`**

Retorna dados de fechamento de caixa: operador, gerente, datas de abertura/fechamento, receitas.

**Resposta — `DetalhamentoCaixaResult`:**
```typescript
interface DetalhamentoCaixaResult {
  codigoFranqueador: number;
  codigoLoja: number;
  data: string;                // Data do caixa
  dataFechamento: string;
  numPdv: number;              // ⭐ Número do PDV/terminal
  numAbertura: number;
  dataHoraAbertura: string;
  dataHoraReducao: string;
  dataHoraFechamento: string;
  nomeOperador: string;        // ⭐ Nome do operador
  codigoOperador: string;      // ⭐ Código do operador
  nomeGerente: string;
  codigoGerente: string;
  DCReceitas: DcReceitasResult[];
}
```

---

### 3.4 Consulta de Produtos

**`GET /api/financeiro/exportar-produtos`**
- Retorna todos os produtos da franquia (código, descrição, unidade, grupo, classificação, etc.)

---

### 3.5 Flash de Vendas (resumo hora a hora)

**`GET /api/financeiro/flash-vendas`**
- Retorna total de vendas, total de cupons, ticket médio e se o caixa está aberto.
- Útil para monitoramento em tempo real.

---

### 3.6 Movimentação de Produtos

**`GET /api/financeiro/movimentacao-produtos`**
- Retorna produtos vendidos por loja/data com quantidade, valor unitário, valor total, canal e status.

---

### 3.7 Outros Endpoints Relevantes

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/financeiro/ticket-medio` | Ticket médio por loja e período |
| `GET /api/financeiro/tipos-venda` | Tipos de venda (balcão, delivery, etc.) |
| `GET /api/financeiro/exportar-formas-pagamento` | Formas de pagamento cadastradas |
| `GET /api/loja/listarLojasFranquia` | Lista todas as lojas da franquia |
| `POST /api/venda/consultar-vendas-canceladas` | Vendas canceladas |
| `POST /api/venda/consultar-vendas-deletadas` | Vendas deletadas |
| `POST /api/venda/consultar-totais-vendas` | Totais de vendas por loja |

---

## 4. Campos-Chave para o Vínculo Venda ↔ Cliente

| Necessidade do CRM | Campo no Degust | Comentário |
|---------------------|-----------------|------------|
| **Número da venda** | `controle` (int, único por loja) | Identificador principal |
| **PDV/Caixa** | `numPdv` (string) | Identifica o terminal físico |
| **Abertura** | `numAbertura` (string) | Sessão do caixa |
| **Data/hora da venda** | `dataVenda` | Para janela de tempo |
| **Valor total** | `valLiquido` | Valor final da venda |
| **Produtos** | `itens[]` | Array com produtos vendidos |
| **Pagamento** | `formaPagamento[]` | Array com formas usadas |
| **Operador** | Via `detalhamento-caixa` → `nomeOperador` | Não vem direto na venda |
| **Loja** | `codLoja` | Código da loja |

---

## 5. Modelo de Integração (Polling)

A API **NÃO possui webhook**. A estratégia é:

1. **Polling periódico** via `relatorio-vendas-periodo-sincronizado` (TipoData = "S") filtrando pelo timestamp da última sincronização.
2. Intervalo sugerido: **a cada 2-5 minutos** durante horário comercial.
3. O token dura 4h — renovar proativamente antes de expirar.
4. Ao receber vendas novas, salvar na tabela `venda` local e tentar casar com `codigo_vinculo` pendentes.

### Fluxo de Sincronização

```
[Degust PDV local] → (sincroniza com nuvem) → [API Degust Cloud]
                                                      ↑
                                              [Nosso CRM faz polling]
```

**Latência esperada:** o Degust PDV sincroniza com a nuvem periodicamente (tipicamente a cada poucos minutos). Há um delay entre o fechamento da venda no caixa e a disponibilidade na API cloud.

---

## 6. O Que Falta Para Plugar em Produção

- [ ] **Credenciais Degust One** (usuário, senha, código do franqueador, código da loja) → variáveis de ambiente
- [ ] **Validar se o plano/licença** do cliente permite acesso à API de integração
- [ ] **Teste real** com o endpoint de autenticação
- [ ] **Mapear o `numPdv`** de cada terminal físico da loja
- [ ] **Definir intervalo de polling** ideal (balancear custo de API vs. latência)
- [ ] **Verificar porta 4444** se houver necessidade de API local do Degust (serviço `DegustApiTrayIcon`)

---

## 7. API Local do Degust (DegustApiTrayIcon)

Existe um serviço local que roda na máquina do caixa (porta 4444) que pode expor dados em tempo real. Porém:
- Documentação limitada e não foi possível acessar detalhes nesta pesquisa
- Dependeria de acesso à rede local da loja
- Para a Fase 1, vamos usar a API Cloud (polling) que é suficiente para o vínculo por janela de tempo

---

## 8. Conclusão para a Implementação

| Aspecto | Decisão |
|---------|---------|
| **Modo de integração** | Polling via API Cloud (REST) |
| **Endpoint principal** | `POST /api/venda/relatorio-vendas` |
| **Identificação da venda** | `controle` (número único por loja) |
| **Identificação do caixa** | `numPdv` |
| **Webhook** | ❌ Não existe |
| **Latência** | Depende do sync PDV→Cloud (poucos minutos) |
| **Vínculo venda↔cliente** | Por `numPdv` + janela de tempo (modo "caixa") |
| **Início** | MockAdapter (100% funcional sem credenciais) |
