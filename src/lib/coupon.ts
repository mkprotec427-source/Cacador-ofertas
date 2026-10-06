export type Coupon = { type: "R$" | "%"; value: number; minimum?: number | null; expiration?: string | null };

// Só aplica o cupom se houver valor, a compra mínima for atingida e ele não estiver vencido.
export function applyCoupon(price: number, c?: Coupon | null, today = new Date()) {
  const none = { final: price, applied: false };
  if (!c || !(c.value > 0)) return none;
  if (c.minimum && price < c.minimum) return none;
  if (c.expiration && new Date(`${c.expiration}T23:59:59`) < today) return none;
  const off = c.type === "%" ? (price * c.value) / 100 : c.value;
  return { final: Math.max(0, Math.round((price - off) * 100) / 100), applied: true };
}

// Só para comparar duplicidade: remove espaços, #fragmento e "/" final. Não mexe nos parâmetros.
export const normalizeUrl = (u: string) => u.trim().split("#")[0].replace(/\/+$/, "");
