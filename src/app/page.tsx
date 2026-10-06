import { db } from "@/lib/supabase";
import Link from "next/link";
import type { Offer } from "@/lib/types";
import OfferList from "@/components/OfferList";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { id?: string } }) {
  let offers: Offer[] = [], error = "";
  try {
    const { data, error: e } = await db().from("offers").select("*").order("created_at", { ascending: false });
    if (e) error = e.message; else offers = data as Offer[];
  } catch { error = "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local."; }

  const stats = [
    ["Total de ofertas", offers.length],
    ["Aprovadas", offers.filter((o) => o.status === "Aprovada").length],
    ["Score 90+", offers.filter((o) => o.score >= 90).length],
    ["Comissão estimada", offers.reduce((s, o) => s + (o.estimated_commission ?? 0), 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })],
  ];
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map(([l, v]) => (
          <div key={l} className="rounded-lg bg-white p-4 shadow-sm"><div className="text-2xl font-bold">{v}</div><div className="text-sm text-stone-500">{l}</div></div>
        ))}
      </div>
      {error ? <p className="rounded bg-red-100 p-3 text-red-800">{error}</p> : <><OfferList offers={searchParams.id ? offers.filter((o) => o.id === searchParams.id) : offers} />{searchParams.id && <Link href="/" className="mt-4 inline-block underline">Ver todas as ofertas</Link>}</>}
    </>
  );
}
