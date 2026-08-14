// =============================================================================
// Identificador Único do Visitante Sem Login (visitor_id)
// Gerencia a persistência do usuário no navegador (localStorage + fallback cookie)
// =============================================================================

const VISITOR_ID_KEY = "mb_visitor_id";

/**
 * Retorna o visitor_id do dispositivo atual.
 * Se não existir, gera um novo UUID v4 e salva no localStorage/Cookie.
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") {
    return "ssr_visitor";
  }

  try {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);

    if (!visitorId) {
      // Procura em cookies como fallback
      const match = document.cookie.match(
        new RegExp("(?:^|; )" + VISITOR_ID_KEY + "=([^;]*)")
      );
      if (match && match[1]) {
        visitorId = decodeURIComponent(match[1]);
      }
    }

    if (!visitorId) {
      visitorId = generateUUID();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
      // Salva no cookie por 365 dias
      document.cookie = `${VISITOR_ID_KEY}=${encodeURIComponent(
        visitorId
      )}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    }

    return visitorId;
  } catch (err) {
    console.error("Erro ao obter visitor_id:", err);
    return "fallback_visitor_" + Date.now();
  }
}

/**
 * Gera um UUID v4 no padrão RFC4122.
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
