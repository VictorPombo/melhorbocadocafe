"use client";

import { useState, useMemo, useEffect } from "react";
import { MOCK_CLIENTES, MOCK_VENDAS, CANAL_LABELS, formatCurrency, type Cliente, type CanalOrigem } from "@/lib/mock-data";
import { MOCK_PRODUTOS, CATEGORIAS_PDV, type CategoriaPDV } from "@/lib/mock-produtos";
import { Donut, CircleDashed, Gem, CircleDot, Cake, CupSoda, Croissant, Candy, Coffee, LogOut } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  donuts: <Donut className="w-5 h-5" />,
  rings: <CircleDashed className="w-5 h-5" />,
  bombom: <Gem className="w-5 h-5" />,
  mini: <CircleDot className="w-5 h-5 text-yellow-400" />,
  cakes: <Cake className="w-5 h-5" />,
  muffins: <CupSoda className="w-5 h-5" />,
  paes: <Croissant className="w-5 h-5" />,
  sobremesas: <Candy className="w-5 h-5" />,
  bebidas: <Coffee className="w-5 h-5" />,
};

type FormaPgto = "pix" | "credito" | "debito" | "dinheiro";

interface CarrinhoItem {
  produtoId: string;
  nome: string;
  preco: number;
  qtd: number;
}

// Utilitário para formatar telefone enquanto digita
function formatPhone(val: string) {
  let v = val.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  }
  return v;
}

// Utilitário para formatar data (DD/MM/YYYY)
function formatDate(val: string) {
  let v = val.replace(/\D/g, "").slice(0, 8);
  if (v.length >= 5) {
    return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  } else if (v.length >= 3) {
    return `${v.slice(0, 2)}/${v.slice(2)}`;
  }
  return v;
}

export default function PDVPage() {
  // Estado do Carrinho & Produtos
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [catAtiva, setCatAtiva] = useState<CategoriaPDV>("donuts");
  const [buscaProduto, setBuscaProduto] = useState("");
  
  // Estado do Cliente
  const [buscaCliente, setBuscaCliente] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: "", telefone: "", aniversario: "", canalOrigem: "instagram" as CanalOrigem });

  const [isCaixa, setIsCaixa] = useState(false);
  useEffect(() => {
    setIsCaixa(localStorage.getItem("mb_role") === "caixa");
  }, []);

  // Estado do Pagamento & UI
  const [formaPgto, setFormaPgto] = useState<FormaPgto>("pix");
  const [toast, setToast] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);

  // Filtros de Produtos
  const produtosFiltrados = buscaProduto.length >= 2
    ? MOCK_PRODUTOS.filter((p) => p.ativo && p.nome.toLowerCase().includes(buscaProduto.toLowerCase())).slice(0, 16)
    : MOCK_PRODUTOS.filter((p) => p.ativo && p.categoria === catAtiva).sort((a, b) => a.ordem - b.ordem);

  const maisVendidosHoje = useMemo(() => {
    const hoje = new Date().toISOString().split("T")[0];
    const vendasHoje = MOCK_VENDAS.filter((v) => v.criadoEm === hoje);
    const counts: Record<string, number> = {};
    vendasHoje.forEach((v) => v.itens.forEach((i) => { counts[i.produtoNome] = (counts[i.produtoNome] || 0) + i.quantidade; }));
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([nome]) => MOCK_PRODUTOS.find((p) => p.nome === nome))
      .filter(Boolean) as typeof MOCK_PRODUTOS;
  }, []);

  // Busca de Clientes (inline)
  const clientesEncontrados = buscaCliente.length >= 2 && !cliente && !showNovoCliente
    ? MOCK_CLIENTES.filter((c) => c.telefone.replace(/\D/g, "").includes(buscaCliente.replace(/\D/g, "")) || c.nome.toLowerCase().includes(buscaCliente.toLowerCase())).slice(0, 3)
    : [];

  const handleSelectCliente = (c: Cliente) => {
    setCliente(c);
    setBuscaCliente("");
  };

  const handleCadastrarCliente = () => {
    if (!novoCliente.nome) return;
    const c: Cliente = {
      id: "c_new_" + Date.now(),
      nome: novoCliente.nome,
      telefone: novoCliente.telefone || buscaCliente,
      canalOrigem: novoCliente.canalOrigem,
      criadoEm: new Date().toISOString().split("T")[0],
      aniversario: novoCliente.aniversario || "01-01",
    };
    setCliente(c);
    setBuscaCliente("");
    setShowNovoCliente(false);
    setNovoCliente({ nome: "", telefone: "", aniversario: "", canalOrigem: "instagram" });
  };

  // Funções do Carrinho
  function addProduto(p: typeof MOCK_PRODUTOS[0]) {
    setCarrinho((prev) => {
      const existing = prev.find((i) => i.produtoId === p.id);
      if (existing) return prev.map((i) => i.produtoId === p.id ? { ...i, qtd: i.qtd + 1 } : i);
      return [...prev, { produtoId: p.id, nome: p.nome, preco: p.preco, qtd: 1 }];
    });
  }

  function updateQtd(produtoId: string, delta: number) {
    setCarrinho((prev) =>
      prev.map((i) => i.produtoId === produtoId ? { ...i, qtd: Math.max(0, i.qtd + delta) } : i).filter((i) => i.qtd > 0),
    );
  }

  function registrarVenda() {
    if (carrinho.length === 0) return;
    setToast(true);
    setTimeout(() => setToast(false), 3000);
    // Limpar tudo
    setCarrinho([]);
    setCliente(null);
    setBuscaCliente("");
    setFormaPgto("pix");
    setMobileCartOpen(false);
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] lg:h-screen bg-gray-50 overflow-hidden relative">
      
      {/* Toast */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          Venda registrada com sucesso!
        </div>
      )}

      {/* ─── LADO ESQUERDO: PRODUTOS ─── */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
        <div className="p-4 lg:p-6 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Ponto de Venda</h1>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64 shrink-0">
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" value={buscaProduto} onChange={(e) => setBuscaProduto(e.target.value)} placeholder="Buscar produto..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#e6398f] bg-white outline-none transition-all text-sm font-medium" />
              </div>
              
              {isCaixa && (
                <button
                  onClick={() => {
                    localStorage.removeItem("mb_auth");
                    localStorage.removeItem("mb_role");
                    window.location.href = "/gestao/login";
                  }}
                  className="shrink-0 flex items-center justify-center w-11 h-11 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl transition-all"
                  title="Sair do Sistema"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Categorias (Esconde se estiver buscando) */}
          {!buscaProduto && (
            <div className="flex flex-wrap gap-2 pb-2">
              {CATEGORIAS_PDV.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCatAtiva(cat.slug)}
                  className={`flex-1 flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    catAtiva === cat.slug ? "bg-gray-800 text-white shadow-md" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span className={`${catAtiva === cat.slug ? "text-[#e6398f]" : "text-gray-400"}`}>
                    {CATEGORY_ICONS[cat.slug]}
                  </span>
                  {cat.nome}
                </button>
              ))}
            </div>
          )}

          {/* Mais vendidos hoje */}
          {!buscaProduto && maisVendidosHoje.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 pb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1"> Top Hoje:</span>
              {maisVendidosHoje.map((p) => (
                <button key={p.id} onClick={() => addProduto(p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e6398f]/10 text-[#e6398f] text-xs font-bold whitespace-nowrap hover:bg-[#e6398f]/20 transition-colors shrink-0">
                  {p.nome}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid de Produtos */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 pb-24 lg:pb-0">
            {produtosFiltrados.map((p) => {
              const inCart = carrinho.find((i) => i.produtoId === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => addProduto(p)}
                  className={`relative p-4 lg:p-5 rounded-2xl text-left transition-all active:scale-95 flex flex-col h-full ${
                    inCart ? "bg-[#fdf4f9] border-2 border-[#e6398f] shadow-sm" : "bg-white border-2 border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  {inCart && (
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#e6398f] text-white text-xs font-bold flex items-center justify-center shadow-md animate-in zoom-in">
                      {inCart.qtd}
                    </span>
                  )}
                  <div className="text-3xl mb-3">{p.categoriaIcone}</div>
                  <p className="text-sm font-bold text-gray-800 leading-tight mb-auto">{p.nome}</p>
                  <p className="text-sm font-black text-[#e6398f] mt-2">{formatCurrency(p.preco)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── LADO DIREITO: CHECKOUT (Sidebar) ─── */}
      <div className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${mobileCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setMobileCartOpen(false)} />
      
      <div className={`fixed lg:static top-0 right-0 h-full w-[85vw] sm:w-[400px] bg-white shadow-2xl flex flex-col z-50 transition-transform duration-300 ${mobileCartOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        
        {/* Header do Carrinho (Mobile close) */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Finalizar Venda</h2>
          <button onClick={() => setMobileCartOpen(false)} className="p-2 -mr-2 text-gray-400"></button>
        </div>

        {/* 1. Cliente (Ultra-fast inline search) */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          {cliente ? (
            <div className="flex items-center justify-between bg-white border-2 border-green-500/20 p-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold">
                  {cliente.nome.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm leading-tight">{cliente.nome}</p>
                  <p className="text-xs text-gray-500 font-medium">{cliente.telefone}</p>
                </div>
              </div>
              <button onClick={() => setCliente(null)} className="text-xs text-gray-400 hover:text-red-500 font-bold px-2 py-1">Trocar</button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={buscaCliente}
                  onChange={(e) => {
                    setBuscaCliente(formatPhone(e.target.value));
                    setShowNovoCliente(false);
                  }}
                  placeholder="Telefone do cliente (opcional)..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#e6398f] bg-white outline-none transition-all font-medium text-sm text-gray-800 placeholder-gray-400"
                />
                {!showNovoCliente && (
                  <button onClick={() => {
                    setShowNovoCliente(true);
                    setNovoCliente((prev) => ({ ...prev, telefone: buscaCliente }));
                  }} className="p-3 bg-[#e6398f]/10 text-[#e6398f] rounded-xl hover:bg-[#e6398f]/20 transition-colors shrink-0 flex items-center justify-center" title="Cadastrar Cliente">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  </button>
                )}
              </div>
              
              {/* Dropdown de resultados */}
              {buscaCliente.length > 0 && !showNovoCliente && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col">
                  {clientesEncontrados.map(c => (
                    <button key={c.id} onClick={() => handleSelectCliente(c)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{c.nome}</p>
                        <p className="text-xs text-gray-500">{c.telefone}</p>
                      </div>
                      <span className="text-[#e6398f] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                  ))}
                  
                  <div className="p-3 bg-[#fdf4f9] border-t border-gray-100">
                    {clientesEncontrados.length === 0 && (
                      <p className="text-xs text-gray-500 mb-2">Nenhum cliente encontrado.</p>
                    )}
                    <button onClick={() => {
                      setShowNovoCliente(true);
                      setNovoCliente((prev) => ({ ...prev, telefone: buscaCliente }));
                    }} className="w-full py-2 bg-[#e6398f] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#b51e6c] transition-colors">
                      + Cadastrar Novo Cliente
                    </button>
                  </div>
                </div>
              )}

              {/* Inline Novo Cliente */}
              {showNovoCliente && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
                  <p className="text-xs font-bold text-gray-800 mb-3">Cadastro Rápido</p>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Nome completo..."
                    value={novoCliente.nome}
                    onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 mb-2 text-sm font-medium outline-none focus:border-[#e6398f]"
                  />
                  <input
                    type="tel"
                    placeholder="Telefone..."
                    value={novoCliente.telefone}
                    onChange={(e) => setNovoCliente({ ...novoCliente, telefone: formatPhone(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 mb-2 text-sm font-medium outline-none focus:border-[#e6398f]"
                  />
                  <input
                    type="text"
                    placeholder="Nascimento (DD/MM/AAAA)..."
                    value={novoCliente.aniversario}
                    onChange={(e) => setNovoCliente({ ...novoCliente, aniversario: formatDate(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 mb-2 text-sm font-medium outline-none focus:border-[#e6398f]"
                  />
                  
                  <div className="mb-3">
                    <p className="text-[10px] text-gray-500 mb-1">Como conheceu?</p>
                    <div className="flex flex-wrap gap-1">
                      {(Object.entries(CANAL_LABELS) as [CanalOrigem, string][]).map(([k, v]) => (
                        <button 
                          key={k} 
                          onClick={() => setNovoCliente({ ...novoCliente, canalOrigem: k as CanalOrigem })}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${novoCliente.canalOrigem === k ? "bg-[#e6398f]/10 text-[#e6398f] border-[#e6398f]/20" : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100 hover:border-gray-200"}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setShowNovoCliente(false)} className="flex-1 py-2 text-gray-500 text-xs font-bold bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100">Cancelar</button>
                    <button onClick={handleCadastrarCliente} disabled={!novoCliente.nome} className="flex-1 py-2 bg-[#e6398f] text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-[#b51e6c] transition-colors">Salvar</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Carrinho (Items) */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50/30">
          {carrinho.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <span className="text-4xl mb-3 opacity-20"></span>
              <p className="text-gray-400 font-medium">Selecione produtos ao lado para iniciar a venda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {carrinho.map((item) => (
                <div key={item.produtoId} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="font-bold text-gray-800 text-sm leading-tight truncate">{item.nome}</p>
                    <p className="text-[#e6398f] font-black text-sm mt-0.5">{formatCurrency(item.preco * item.qtd)}</p>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 shrink-0">
                    <button onClick={() => updateQtd(item.produtoId, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold hover:bg-white rounded-md shadow-sm transition-all">−</button>
                    <span className="w-8 text-center font-bold text-gray-800 text-sm">{item.qtd}</span>
                    <button onClick={() => updateQtd(item.produtoId, 1)} className="w-8 h-8 flex items-center justify-center text-[#e6398f] font-bold hover:bg-white rounded-md shadow-sm transition-all">+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Pagamento e Finalização */}
        <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pagamento</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "pix" as FormaPgto, label: "PIX", icon: "" },
                { id: "credito" as FormaPgto, label: "Crédito", icon: "" },
                { id: "debito" as FormaPgto, label: "Débito", icon: "" },
                { id: "dinheiro" as FormaPgto, label: "Nota", icon: "" },
              ].map((fp) => (
                <button
                  key={fp.id}
                  onClick={() => setFormaPgto(fp.id)}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
                    formaPgto === fp.id ? "border-[#e6398f] bg-[#e6398f]/5 text-[#e6398f]" : "border-gray-100 text-gray-400 hover:border-gray-200"
                  }`}
                >
                  <span className="text-xl mb-1">{fp.icon}</span>
                  <span className="text-[10px] font-bold">{fp.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-gray-500">Total a pagar</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{carrinho.reduce((s, i) => s + i.qtd, 0)} itens</p>
            </div>
            <p className="text-3xl font-black text-[#e6398f]">{formatCurrency(total)}</p>
          </div>

          <button
            onClick={registrarVenda}
            disabled={carrinho.length === 0}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] text-white text-lg font-black shadow-lg shadow-[#e6398f]/30 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            Registrar Venda
          </button>
        </div>
      </div>

      {/* Floating Action Button (Mobile only) */}
      <div className="lg:hidden fixed bottom-20 right-4 z-30">
        <button
          onClick={() => setMobileCartOpen(true)}
          className="bg-gray-900 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-transform border border-gray-700"
        >
          <div className="relative">
            <span className="text-xl"></span>
            {carrinho.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#e6398f] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {carrinho.reduce((s, i) => s + i.qtd, 0)}
              </span>
            )}
          </div>
          <span className="font-bold pr-2">{formatCurrency(total)}</span>
        </button>
      </div>
    </div>
  );
}

