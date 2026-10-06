"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Offer } from "@/lib/types";
import { classify } from "@/lib/score";

const FILTERS: Record<string, (o: Offer) => boolean> = {
  Todas: () => true,
  Pendentes: (o) => o.status === "Pendente",
  Aprovadas: (o) => o.status === "Aprovada",
  Rejeitadas: (o) => o.status === "Rejeitada",
  "Mercado Livre": (o) => o.marketplace === "Mercado Livre",
  Shopee: (o) => o.marketplace === "Shopee",
  "Score 90+": (o) => o.score >= 90,
  "Score 75+": (o) => o.score >= 75,
};
const brl = (n: number | null) => (n == null ? "—" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));

export default function OfferList({ offers }: { offers: Offer[] }) {
  const [f, setF] = useState("Todas");
  const [copied, setCopied] = useState("");
  const router = useRouter();
  const setStatus = async (id: string, status: string) => {
    await fetch(`/api/offers/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    router.refresh();
  };
  const copy = async (o: Offer) => {
    await navigator.clipboard.writeText(o.generated_message ?? "");
    setCopied(o.id); setTimeout(() => setCopied(""), 1500);
  };
  const list = offers.filter(FILTERS[f]);
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(FILTERS).map((k) => (
          <button key={k} onClick={() => setF(k)} className={`rounded-full px-3 py-1 text-sm ${f === k ? "bg-stone-900 text-white" : "bg-white hover:bg-stone-200"}`}>{k}</button>
        ))}
      </div>
      {list.length === 0 && <p className="text-stone-500">Nenhuma oferta aqui. Use “Adicionar oferta” para cadastrar a primeira.</p>}
      <div className="space-y-4">
        {list.map((o) => (
          <article key={o.id} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-lg">{o.product_name}</h2>
                <p className="text-sm text-stone-500">{o.marketplace}{o.category ? `, ${o.category}` : ""}, {o.status}</p>
              </div>
              <div className="text-right"><div className="text-3xl font-bold">{o.score}</div><div className="text-sm">{classify(o.score)}</div></div>
            </div>
            <dl className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
              <div><dt className="text-stone-500">Preço atual</dt><dd className="font-medium">{brl(o.current_price)}</dd></div>
              <div><dt className="text-stone-500">Preço anterior</dt><dd className="font-medium">{brl(o.previous_price)}</dd></div>
              <div><dt className="text-stone-500">Desconto</dt><dd className="font-medium">{Math.round(o.discount_percent)}%</dd></div>
              <div><dt className="text-stone-500">Nota</dt><dd className="font-medium">{o.rating ?? "—"} ({o.review_count ?? 0})</dd></div>
              <div><dt className="text-stone-500">Comissão</dt><dd className="font-medium">{brl(o.estimated_commission)}</dd></div>
            </dl>
            {o.has_coupon && o.final_price != null && o.final_price < o.current_price && (
              <p className="mt-2 text-sm">🏷️ Cupom{o.coupon_code ? ` ${o.coupon_code}` : ""}: <strong>{o.coupon_status === "Confirmado manualmente" ? "Preço final confirmado" : "Preço final estimado"} {brl(o.final_price)}</strong>
                {o.coupon_status !== "Confirmado manualmente" && <span className="text-amber-700"> (cupom não confirmado, confira antes de publicar)</span>}</p>
            )}
            <pre className="mt-3 whitespace-pre-wrap rounded bg-stone-50 p-3 text-sm font-sans">{o.generated_message}</pre>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => copy(o)} className="rounded bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600">{copied === o.id ? "COPIADO!" : "COPIAR MENSAGEM"}</button>
              <button onClick={() => setStatus(o.id, "Aprovada")} className="rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700">APROVAR OFERTA</button>
              <button onClick={() => setStatus(o.id, "Rejeitada")} className="rounded bg-stone-200 px-3 py-2 text-sm hover:bg-stone-300">Rejeitar</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
