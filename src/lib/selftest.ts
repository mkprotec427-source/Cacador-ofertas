import assert from "node:assert/strict";
import { discountPercent, calcScore, classify } from "./score";
import { applyCoupon, normalizeUrl } from "./coupon";
import { templateProvider } from "./message";

assert.equal(discountPercent(199.9, 299.9), 33.34);
assert.equal(applyCoupon(199.9, { type: "R$", value: 30 }).final, 169.9);
assert.equal(applyCoupon(199.9, { type: "%", value: 10 }).final, 179.91);
assert.equal(applyCoupon(199.9, { type: "R$", value: 30, minimum: 250 }).applied, false);
assert.equal(applyCoupon(199.9, { type: "R$", value: 30, expiration: "2020-01-01" }).applied, false);
const base = { discount: 33, rating: 4.8, reviews: 5000, commission: 10 };
const s0 = calcScore(base), s1 = calcScore({ ...base, couponConfirmed: true });
assert.equal(s1 - s0, 5); assert.ok(calcScore({ discount: 100, rating: 5, reviews: 1e6, commission: 99, couponConfirmed: true }) <= 100);
assert.equal(normalizeUrl(" https://x.com/p/1/#a "), "https://x.com/p/1");
const m = { product_name: "Fone", affiliate_url: null, current_price: 199.9, previous_price: 299.9, discount_percent: 33.34, rating: 4.8, review_count: 5000, score: s1, marketplace: "Shopee" as const, has_coupon: true, coupon_code: "OFF30", coupon_type: "R$" as const, coupon_value: 30, final_price: 169.9 };
async function main() {
const unconf = await templateProvider.generate({ ...m, coupon_status: "Não confirmado" });
const conf = await templateProvider.generate({ ...m, coupon_status: "Confirmado manualmente" });
assert.ok(unconf.includes("ESTIMADO") && unconf.includes("CONFIRA A VALIDADE NO CHECKOUT") && unconf.includes("[MEU LINK DE AFILIADO]"));
assert.ok(conf.includes("PREÇO FINAL COM CUPOM") && !conf.includes("ESTIMADO") && !conf.includes("CONFIRA A VALIDADE"));
console.log(classify(s1), "\n" + unconf + "\nTESTES OK");
}
main();
