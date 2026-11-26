-- Affiliate site database schema (PostgreSQL)
-- Run with:  npm run db:setup     (or paste into Neon > SQL Editor)

create table if not exists products (
  id             serial primary key,
  slug           text not null unique,
  title          text not null,
  description    text not null default '',
  image_url      text not null default '',
  price          text not null default '',      -- shown as typed, e.g. "$29.99"
  original_price text not null default '',      -- optional, for the discount badge
  rating         numeric(2,1),                  -- 0.0 - 5.0, optional
  store          text not null default 'Amazon',
  category       text not null default 'General',
  affiliate_url  text not null,
  featured       boolean not null default false,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists products_active_created_idx on products (active, created_at desc);
create index if not exists products_category_idx on products (category);

-- One row per page view on the public site
create table if not exists page_views (
  id           bigserial primary key,
  path         text not null,
  referrer     text,              -- referring site host or utm_source
  country      text,              -- ISO 2-letter code, e.g. LK, US
  city         text,
  device       text,              -- Desktop / Mobile / Tablet
  browser      text,
  os           text,
  visitor_hash text,              -- anonymous daily id (no raw IP stored)
  created_at   timestamptz not null default now()
);

create index if not exists page_views_created_idx on page_views (created_at desc);
create index if not exists page_views_country_idx on page_views (country, created_at desc);

-- One row per click on a "Buy / View deal" button
create table if not exists clicks (
  id           bigserial primary key,
  product_id   integer references products(id) on delete set null,
  country      text,
  device       text,
  referrer     text,
  visitor_hash text,
  created_at   timestamptz not null default now()
);

create index if not exists clicks_created_idx on clicks (created_at desc);
create index if not exists clicks_product_idx on clicks (product_id, created_at desc);
