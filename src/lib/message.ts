import { classify } from "./score";
import type { Offer } from "./types";

// Contrato do serviço: troque o provedor sem mexer no resto do sistema.
export type MessageInput = Pick<Offer, "product_name" | "affiliate_url" | "current_price" | "previous_price" | "discount_percent" | "rating" | "review_count" | "score" | "marketplace" | "has_coupon" | "coupon_code" | "coupon_type" | "coupon_value" | "coupon_status" | "final_price">;
export interface MessageProvider { generate(o: MessageInput): Promise<string>; }

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const templateProvider: MessageProvider = {
  async generate(o) {
    const hasC = o.has_coupon && o.final_price != null && o.final_price < o.current_price;
    const ok = o.coupon_status === "Confirmado manualmente";
    const L = [hasC ? "🔥 OFERTA + CUPOM!" : `${classify(o.score)}!`, "", `🛍️ ${o.product_name}`, ""];
    if (o.previous_price) L.push(`💰 De ${brl(o.previous_price)}`);
    L.push(`🔥 Por ${brl(o.current_price)}`);
    if (hasC) {
      const off = o.coupon_type === "%" ? `${o.coupon_value}% OFF` : `R$ ${(o.coupon_value ?? 0).toLocaleString("pt-BR")} OFF`;
      L.push("", `🏷️ CUPOM: ${o.coupon_code ? o.coupon_code + " - " : ""}${off}`);
      L.push(`💥 PREÇO FINAL${ok ? "" : " ESTIMADO"} COM CUPOM: ${brl(o.final_price!)}`);
      if (!ok) L.push("🟡 CUPOM INFORMADO — CONFIRA A VALIDADE NO CHECKOUT");
    }
    L.push("");
    if (o.discount_percent > 0) L.push(`📉 ${Math.round(o.discount_percent)}% OFF`);
    if (o.rating) L.push(`⭐ ${String(o.rating).replace(".", ",")}/5`);
    if (o.review_count) L.push(`👥 ${o.review_count.toLocaleString("pt-BR")}+ avaliações`);
    L.push("", "🛒 Confira:", o.affiliate_url || "[MEU LINK DE AFILIADO]", "",
      hasC ? "⚠️ Preço, estoque e validade do cupom podem mudar." : "⚠️ O preço pode mudar a qualquer momento.");
    return L.join("\n");
  },
};

// Provedor de IA (Anthropic). Só é usado se ANTHROPIC_API_KEY existir.
const anthropicProvider: MessageProvider = {
  async generate(o) {
    const base = await templateProvider.generate(o);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", max_tokens: 400,
        messages: [{ role: "user", content: `Escreva uma versão ORIGINAL desta mensagem de promoção para WhatsApp em português do Brasil: curta, chamativa, com emojis. Não copie slogans nem textos de terceiros. Mantenha exatamente os preços, o link, as linhas de cupom e os avisos; nunca afirme que um cupom funciona além do que o texto já diz. Responda só com a mensagem.\n\n${base}` }],
      }),
    });
    if (!res.ok) throw new Error(`IA ${res.status}`);
    const data = await res.json();
    return data.content?.[0]?.text?.trim() || base;
  },
};

export async function generateMessage(o: MessageInput) {
  if (process.env.ANTHROPIC_API_KEY) {
    try { return await anthropicProvider.generate(o); } catch { /* fallback */ }
  }
  return templateProvider.generate(o);
}
