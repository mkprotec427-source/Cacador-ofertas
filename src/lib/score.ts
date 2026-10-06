// Fórmula simples: soma de 4 componentes. Ajuste os pesos/limites aqui.
export const WEIGHTS = { discount: 40, rating: 25, reviews: 20, commission: 15 };
export const COUPON_BONUS = 5; // só cupom confirmado e aplicado; total limitado a 100
export const CAPS = { discountPct: 50, reviewsFull: 10000, commissionBRL: 30 }; // valor que dá nota máxima

export const discountPercent = (current: number, previous?: number | null) =>
  previous && previous > current ? Math.round(((previous - current) / previous) * 10000) / 100 : 0;

export function calcScore(o: { discount: number; rating?: number | null; reviews?: number | null; commission?: number | null; couponConfirmed?: boolean }) {
  const c = (n: number) => Math.max(0, Math.min(1, n));
  const s =
    WEIGHTS.discount * c(o.discount / CAPS.discountPct) +
    WEIGHTS.rating * c((o.rating ?? 0) / 5) +
    WEIGHTS.reviews * c(Math.log10((o.reviews ?? 0) + 1) / Math.log10(CAPS.reviewsFull + 1)) +
    WEIGHTS.commission * c((o.commission ?? 0) / CAPS.commissionBRL);
  return Math.min(100, Math.round(s + (o.couponConfirmed ? COUPON_BONUS : 0)));
}

export function classify(score: number) {
  if (score >= 90) return "🔥 OFERTA EXCELENTE";
  if (score >= 75) return "🟢 BOA OFERTA";
  if (score >= 60) return "🟡 OFERTA REGULAR";
  return "🔴 NÃO RECOMENDADA";
}
