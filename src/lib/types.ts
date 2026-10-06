export type Offer = {
  id: string; created_at: string; product_name: string; product_url: string | null;
  affiliate_url: string | null; marketplace: "Mercado Livre" | "Shopee"; category: string | null;
  current_price: number; previous_price: number | null; discount_percent: number;
  rating: number | null; review_count: number | null; estimated_commission: number | null;
  promotion_url: string | null; promotional_price: number | null; has_coupon: boolean; coupon_code: string | null;
  coupon_type: "R$" | "%" | null; coupon_value: number | null; coupon_minimum: number | null; coupon_expiration: string | null;
  coupon_status: "Confirmado manualmente" | "Não confirmado"; final_price: number | null;
  published_at: string | null; published_manually: boolean; score: number; status: "Pendente" | "Aprovada" | "Rejeitada"; generated_message: string | null;
};
