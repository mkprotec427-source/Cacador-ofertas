"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const T = (n: string, l: string, t = "text", req = false, hint = ""): [string, string, string, boolean, string] => [n, l, t, req, hint];
const FIELDS = [
  T("product_name", "Nome do produto", "text", true), T("promotion_url", "Link da promoção (o que você encontrou)", "url", false, "Fica só como registro. Nunca é publicado."),
  T("product_url", "URL do produto", "url", false, "Usada para avisar se a oferta já foi cadastrada."), T("promotional_price", "Preço promocional", "number", true),
  T("previous_price", "Preço anterior", "number"), T("category", "Categoria"), T("rating", "Nota do produto (0 a 5)", "number"),
  T("review_count", "Quantidade de avaliações", "number"), T("estimated_commission", "Comissão estimada (R$)", "number"),
  T("affiliate_url", "Meu link de afiliado", "url", false, "Informe o seu próprio link. O sistema não converte links de terceiros."),
];

export default function NovaOferta() {
  const router = useRouter();
  const [err, setErr] = useState(""); const [dupId, setDupId] = useState(""); const [busy, setBusy] = useState(false); const [coupon, setCoupon] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr(""); setDupId("");
    const res = await fetch("/api/offers", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) });
    if (res.ok) { router.push("/"); router.refresh(); return; }
    const j = await res.json(); setErr(j.error); setDupId(j.existing_id ?? ""); setBusy(false);
  }
  const input = "mt-1 w-full rounded border border-stone-300 bg-white px-3 py-2";
  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-3">
      <h1 className="text-2xl font-bold">Adicionar oferta</h1>
      {FIELDS.map(([n, l, t, r, h]) => (
        <label key={n} className="block text-sm">{l}
          <input name={n} type={t} step={t === "number" ? "0.01" : undefined} required={r} className={input} />
          {h && <span className="text-xs text-stone-500">{h}</span>}
        </label>
      ))}
      <label className="block text-sm">Marketplace
        <select name="marketplace" className={input}><option>Mercado Livre</option><option>Shopee</option></select>
      </label>
      <fieldset className="rounded border border-stone-300 p-3 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="has_coupon" checked={coupon} onChange={(e) => setCoupon(e.target.checked)} /> Cupom disponível</label>
        {coupon && (<>
          <label className="block text-sm">Código do cupom<input name="coupon_code" className={input} /></label>
          <div className="flex gap-4 text-sm">Tipo:
            <label><input type="radio" name="coupon_type" value="R$" defaultChecked /> R$</label>
            <label><input type="radio" name="coupon_type" value="%" /> %</label>
          </div>
          <label className="block text-sm">Valor<input name="coupon_value" type="number" step="0.01" required className={input} /></label>
          <label className="block text-sm">Compra mínima<input name="coupon_minimum" type="number" step="0.01" className={input} /></label>
          <label className="block text-sm">Validade<input name="coupon_expiration" type="date" className={input} /></label>
          <div className="flex flex-wrap gap-4 text-sm">Status:
            <label><input type="radio" name="coupon_status" value="Confirmado manualmente" /> Confirmado manualmente</label>
            <label><input type="radio" name="coupon_status" value="Não confirmado" defaultChecked /> Não confirmado</label>
          </div>
        </>)}
      </fieldset>
      {err && <p className="rounded bg-red-100 p-2 text-red-800 text-sm">{err} {dupId && <Link href={`/?id=${dupId}`} className="underline font-semibold">Ver oferta existente</Link>}</p>}
      <button disabled={busy} className="w-full rounded bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50">{busy ? "Salvando..." : "Salvar oferta"}</button>
    </form>
  );
}
