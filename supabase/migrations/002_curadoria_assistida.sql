-- Seguro para bancos existentes: só adiciona colunas, não apaga nada.
alter table offers
  add column if not exists promotion_url text,
  add column if not exists promotional_price numeric(12,2),
  add column if not exists has_coupon boolean not null default false,
  add column if not exists coupon_code text,
  add column if not exists coupon_type text check (coupon_type in ('R$','%')),
  add column if not exists coupon_value numeric(12,2),
  add column if not exists coupon_minimum numeric(12,2),
  add column if not exists coupon_expiration date,
  add column if not exists coupon_status text not null default 'Não confirmado' check (coupon_status in ('Confirmado manualmente','Não confirmado')),
  add column if not exists final_price numeric(12,2),
  add column if not exists published_at timestamptz,
  add column if not exists published_manually boolean not null default false;
update offers set promotional_price = current_price, final_price = current_price where promotional_price is null;
create index if not exists offers_product_url_idx on offers (product_url);
