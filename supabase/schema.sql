-- ============================================================
-- EXPOWALL.SHOP — схема базы данных Supabase
-- Выполнить целиком в Supabase → SQL Editor → New query → Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- КАТЕГОРИИ ----------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- ---------- ТОВАРЫ ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category_id uuid references categories(id) on delete set null,
  price numeric(10,2),
  old_price numeric(10,2),
  is_sale boolean default false,
  is_new boolean default false,
  short_description text,
  description text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------- ИЗОБРАЖЕНИЯ ТОВАРОВ (для карусели) ----------
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- РЕДАКТИРУЕМЫЙ КОНТЕНТ СТРАНИЦ (хедер/футер/о компании/доставка/оплата/контакты) ----------
create table if not exists site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ---------- ЗАЯВКИ С САЙТА (форма "Заказать") ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_title text,
  customer_name text,
  customer_phone text,
  comment text,
  status text default 'new',
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Публичные посетители: только чтение каталога/контента + создание заявок.
-- Админ (авторизованный пользователь Supabase Auth): полный доступ.
-- ============================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table site_content enable row level security;
alter table orders enable row level security;

-- Публичное чтение
create policy "public_read_categories" on categories for select using (true);
create policy "public_read_products" on products for select using (true);
create policy "public_read_product_images" on product_images for select using (true);
create policy "public_read_site_content" on site_content for select using (true);

-- Запись только админу (любой авторизованный пользователь Supabase Auth)
create policy "admin_write_categories" on categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_write_products" on products for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_write_product_images" on product_images for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_write_site_content" on site_content for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Заявки: создавать может кто угодно (посетитель сайта), читать/менять — только админ
create policy "public_insert_orders" on orders for insert with check (true);
create policy "admin_manage_orders" on orders for select using (auth.role() = 'authenticated');
create policy "admin_update_orders" on orders for update using (auth.role() = 'authenticated');
create policy "admin_delete_orders" on orders for delete using (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE: создайте бакет вручную перед запуском этого блока
-- Storage → New bucket → имя: site-images → Public bucket: ВКЛ
-- ============================================================

create policy "public_read_site_images" on storage.objects
  for select using (bucket_id = 'site-images');
create policy "admin_upload_site_images" on storage.objects
  for insert with check (bucket_id = 'site-images' and auth.role() = 'authenticated');
create policy "admin_update_site_images" on storage.objects
  for update using (bucket_id = 'site-images' and auth.role() = 'authenticated');
create policy "admin_delete_site_images" on storage.objects
  for delete using (bucket_id = 'site-images' and auth.role() = 'authenticated');

-- ============================================================
-- НАЧАЛЬНЫЙ КОНТЕНТ (можно потом менять через админку)
-- ============================================================

insert into site_content (key, value) values
('hero', '{
  "eyebrow": "EXPOWALL.SHOP · КИЇВ",
  "title": "Кухонні стінові панелі під замовлення",
  "subtitle": "Виготовлення від 3 днів • Доставка по Україні. Скінали з композиту та HPL у колір стільниць, гарантія 12 місяців.",
  "price_from": "Від 2800 грн/шт",
  "cta_text": "Переглянути каталог",
  "cta_link": "/catalog.html"
}'),
('trust_stats', '[
  {"value":"500+","label":"Виготовили кухонь"},
  {"value":"12 міс.","label":"Гарантія"},
  {"value":"Київ","label":"Власне виробництво"}
]'),
('how_to_order', '[
  {"title":"Залишаєте заявку","text":"Телефоном, у Telegram/Viber або через форму на сайті"},
  {"title":"Заміри та підбір декору","text":"Менеджер уточнює розміри та допомагає обрати малюнок"},
  {"title":"Виготовлення","text":"Виробляємо панель під ваш розмір на власному виробництві в Києві"},
  {"title":"Доставка та монтаж","text":"Привозимо готову панель і за потреби допомагаємо з установкою"}
]'),
('calculator_prices', '[
  {"type":"Композит","price":1800},
  {"type":"HPL у колір стільниці","price":2200},
  {"type":"Мармур / преміум дизайн","price":2600}
]'),
('gallery', '[
  {"url":"/images/gallery/gallery-1.jpg","caption":"Глянцеві скінали з хвилястим малюнком"},
  {"url":"/images/gallery/gallery-2.jpg","caption":"Скінали під мармур, темна гама"},
  {"url":"/images/gallery/gallery-3.jpg","caption":"Геометричний малюнок на фартуху"},
  {"url":"/images/gallery/gallery-4.jpg","caption":"Скінали з фотодруком \"Нічне місто\""},
  {"url":"/images/gallery/gallery-5.jpg","caption":"Скінали з фотодруком \"Нічне місто\", інший ракурс"},
  {"url":"/images/gallery/gallery-6.jpg","caption":"Скінали з квітковим малюнком"},
  {"url":"/images/gallery/gallery-7.jpg","caption":"Абстрактний малюнок, теплі відтінки"},
  {"url":"/images/gallery/gallery-8.jpg","caption":"Абстрактні хвилі, бежева гама"}
]'),
('testimonials', '[
  {"name":"Олена, Київ","text":"Замовляли скінали на кухню в новобудові — все зробили швидко, малюнок підібрали ідеально в колір стільниці. Дуже задоволені результатом."},
  {"name":"Андрій, Бровари","text":"Панель глянцева, без розводів, виглядає дорого. Привезли точно у строк, який обіцяли менеджери."},
  {"name":"Марина, Київ","text":"Довго обирали між плиткою та скінали — не пожалкували, що обрали скінали. Мити набагато простіше, кухня виглядає сучасно."}
]'),
('advantages', '[
  {"title":"500+ дизайнів","text":"Великий вибір малюнків і декорів у каталозі"},
  {"title":"Від 3 днів виготовлення","text":"Власне виробництво в Києві, без посередників"},
  {"title":"Гарантія 12 місяців","text":"На всі стінові панелі та фартухи"},
  {"title":"Доставка по Україні","text":"По Києву кур''єром, в інші міста — поштовими службами"}
]'),
('contacts', '{
  "phone": "+380 (68) 949 22 42",
  "email": "expografica25@gmail.com",
  "address": "м. Київ, вул. Новомостицька, 25-В",
  "work_hours": "Пн–Пт: 8:30–17:00",
  "social": [
    {"name":"Instagram","url":"https://instagram.com"},
    {"name":"Facebook","url":"https://facebook.com"}
  ]
}'),
('about', '{
  "title": "Про компанію Expowall.shop",
  "body": "Expowall.shop — виробництво та продаж глянцевих стінових панелей для кухні. Ми виготовляємо скінали з композитних матеріалів та HPL-пластику будь-яких розмірів на замовлення.\n\nПрацюємо напряму з виробництвом, тому тримаємо чесні ціни та короткі терміни виготовлення."
}'),
('delivery', '{
  "title": "Доставка",
  "body": "Кур''єрська доставка здійснюється у будні дні. За годину до приїзду водій зателефонує та узгодить час.\n\nДоставка по Києву безкоштовна, по Україні — поштою за рахунок клієнта.\n\nСамовивіз можливий зі складу за попередньою домовленістю з менеджером."
}'),
('payment', '{
  "title": "Оплата",
  "body": "Оплатити замовлення можна банківською карткою онлайн, готівкою кур''єру при отриманні або безготівковим переказом для юридичних осіб."
}')
on conflict (key) do nothing;

insert into categories (slug, title, image_url, sort_order) values
('kompozit', 'Скінали з композиту', '/images/gallery/gallery-3.jpg', 1),
('hpl-cvet-stoleshnic', 'У колір стільниць', '/images/gallery/gallery-2.jpg', 2),
('mramor-plitka', 'Мармур і плитка', '/images/gallery/gallery-8.jpg', 3),
('pid-derevo', 'Під дерево', '/images/gallery/gallery-8.jpg', 4),
('bili-paneli', 'Білі панелі', '/images/gallery/gallery-1.jpg', 5),
('cvety', 'Квіти', '/images/gallery/gallery-6.jpg', 6),
('abstrakciya', 'Абстракція', '/images/gallery/gallery-7.jpg', 7),
('sale', 'Розпродаж', '/images/gallery/gallery-4.jpg', 8)
on conflict (slug) do nothing;
