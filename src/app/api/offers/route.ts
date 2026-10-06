import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { calcScore, discountPercent } from "@/lib/score";
import { applyCoupon, normalizeUrl } from "@/lib/coupon";
import { generateMessage } from "@/lib/message";

const num = (v: unknown) => (v === "" || v == null ? null : Number(v));
const txt = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

export async function GET() {
  const { data, error } = await db().from("offers").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const b = await req.json();
  const price = num(b.promotional_price);
  if (!b.product_name || !price || !["Mercado Livre", "Shopee"].includes(b.marketplace))
    return NextResponse.json({ error: "Informe nome, preço promocional e marketplace." }, { status: 400 });

  const hasCoupon = b.has_coupon === "on" || b.has_coupon === true;
  const cValue = num(b.coupon_value);
  if (hasCoupon && !cValue) return NextResponse.json({ error: "Informe o valor do cupom." }, { status: 400 });

  const productUrl = txt(b.product_url) ? normalizeUrl(b.product_url) : null;
  if (productUrl) {
    const { data: ex } = await db().from("offers").select("id").eq("product_url", productUrl).limit(1);
    if (ex?.length) return NextResponse.json({ error: "Esta oferta já foi cadastrada.", existing_id: ex[0].id }, { status: 409 });
  }

  const previous = num(b.previous_price), rating = num(b.rating), reviews = num(b.review_count), commission = num(b.estimated_commission);
  const couponType: "R$" | "%" = b.coupon_type === "%" ? "%" : "R$";
  const couponStatus: "Confirmado manualmente" | "Não confirmado" = b.coupon_status === "Confirmado manualmente" ? "Confirmado manualmente" : "Não confirmado";
  const { final, applied } = applyCoupon(price, hasCoupon ? { type: couponType, value: cValue!, minimum: num(b.coupon_minimum), expiration: txt(b.coupon_expiration) } : null);
  const discount = discountPercent(price, previous);
  const score = calcScore({ discount, rating, reviews, commission, couponConfirmed: applied && couponStatus === "Confirmado manualmente" });

  const row = {
    product_name: String(b.product_name).trim(), product_url: productUrl, promotion_url: txt(b.promotion_url), affiliate_url: txt(b.affiliate_url),
    marketplace: b.marketplace, category: txt(b.category), current_price: price, promotional_price: price, previous_price: previous,
    discount_percent: discount, rating, review_count: reviews, estimated_commission: commission,
    has_coupon: hasCoupon, coupon_code: hasCoupon ? txt(b.coupon_code) : null, coupon_type: hasCoupon ? couponType : null, coupon_value: hasCoupon ? cValue : null,
    coupon_minimum: hasCoupon ? num(b.coupon_minimum) : null, coupon_expiration: hasCoupon ? txt(b.coupon_expiration) : null,
    coupon_status: couponStatus, final_price: final, score,
  };
  const generated_message = await generateMessage(row);
  const { data, error } = await db().from("offers").insert({ ...row, generated_message }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
