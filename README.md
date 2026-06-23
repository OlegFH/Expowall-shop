# Expowall.shop

Сайт-каталог глянцевих стінових панелей. Статичний HTML/CSS/JS (без збірки), база даних і адмінка — на Supabase.

## Що вже налаштовано

`js/config.js` вже містить дані вашого проєкту Supabase:
- URL: `https://ifdcufrgkgbbhdesoldj.supabase.co`
- Publishable (anon) key: вставлено

## Що потрібно зробити вручну (це не може зробити Claude — немає доступу до вашого Supabase)

### 1. Виконати SQL-схему
Supabase → SQL Editor → New query → вставте вміст файлу `supabase/schema.sql` → Run.

Це створить таблиці `categories`, `products`, `product_images`, `site_content`, `orders`, налаштує політики безпеки (RLS) і додасть базовий контент (тексти сторінок, контакти, категорії).

### 2. (Необов'язково) Додати демо-товари
Після schema.sql виконайте `supabase/seed_demo.sql`, щоб побачити приклад товарів з описом скінали з МДФ.

### 3. Створити Storage bucket для зображень
Supabase → Storage → New bucket:
- Назва: `site-images`
- Public bucket: **увімкнено**

Після створення бакета виконайте ще раз останній блок із `schema.sql` (секцію `STORAGE`), якщо він не застосувався автоматично — політики для бакета прописані в кінці файлу.

### 4. Створити користувача-адміна
Supabase → Authentication → Users → Add user → вкажіть email і пароль.
Це і є логін/пароль для входу в `/admin/`.

**Важливо:** вимкніть публічну реєстрацію — Authentication → Settings → Allow new users to sign up → вимкнути. Інакше будь-хто зможе сам собі зареєструвати акаунт із правами на редагування сайту.

## Структура сайту

- `/` — головна
- `/catalog.html` — каталог з фільтром за категоріями та пагінацією
- `/product.html?slug=...` — картка товару з каруселлю зображень
- `/about.html`, `/delivery.html`, `/payment.html`, `/contacts.html` — статичні сторінки (текст редагується в адмінці)
- `/admin/` — адмін-панель (категорії, товари, заявки, тексти сайту)

## Локальна перевірка

Файли статичні, build-команда не потрібна. Будь-яким локальним сервером, наприклад:

```
npx serve .
```

## Деплой

Папка деплоїться на Netlify як є, без build-команди (`netlify.toml` вже налаштований, publish = ".").

## SEO

Створено 6 окремих посадкових сторінок під пошукові запити (`panel-pid-mramur.html`, `panel-pid-derevo.html`, `bili-paneli.html`, `skinali-dlya-kuhni.html`, `fartuh-hpl.html`, `fartuh-mdf.html`), а також `sitemap.xml` і `robots.txt`.

**Якщо підключите власний домен** (наприклад, expowall.shop) — замініть `https://expowall-shop.netlify.app` на ваш домен у файлах `sitemap.xml` і `robots.txt`, і додайте `sitemap.xml` у Google Search Console.

