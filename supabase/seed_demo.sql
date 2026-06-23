-- ============================================================
-- ДЕМО-ТОВАРИ (необов'язково). Запускати ПІСЛЯ schema.sql.
-- Використовують локальні SVG-заглушки з /images/demo/ —
-- замініть на реальні фото через адмінку.
-- ============================================================

do $$
declare
  cat_kompozit uuid;
  cat_hpl uuid;
  cat_mramor uuid;
  cat_derevo uuid;
  cat_bili uuid;
  prod_id uuid;
  full_desc text := 'Кухонний фартух (скінали) з МДФ створює надійний захист для стін у робочій зоні вашої кухні.

Готові кухонні фартухи з МДФ з фотодруком легко встановлюються та довго служать завдяки 6-ти шарам жаростійкого акрилового УФ-лаку.

Усі скінали з МДФ мають індивідуальне щільне пакування та фінішну захисну плівку, яка знімається після монтажу.

Розмір готових скінали 2800×600×6 мм, вага 1 панелі 9 кг, малюнок на панелях підібраний таким чином, що його легко поєднати при створенні композиції з двох і більше панелей.

Чому скінали необхідні на кухні – 5 причин⬇

✅ На стіну біля плити постійно потрапляють бризки жиру та осідає конденсат. А скінали є надійним декоративним елементом, якому не страшні ні волога, ні високі температури – він не розплавиться і не дозволить утворитися цвілі.

✅ Стійкість і довговічність декоративних панелей гарантується завдяки використанню надійного пластику.

✅ Скінали не бояться механічних пошкоджень. Можна не хвилюватися, що декоративне покриття подряпається чи відколеться.

✅ За допомогою звичайних миючих засобів ви легко видалите жир, наліт та інші забруднення з поверхні. Навіть через 10 років за регулярного догляду скінали виглядатимуть такими ж чистими й охайними, як і в перший день після встановлення.

✅ Декоративні панелі принесуть особливість і блиск в інтер''єр приміщення. Вони можуть зробити кухню не такою, як у всіх.

Висока стійкість до подряпин та стирання.
Висока стійкість до забруднення.
Стійкість до високих температур.
Стійкість до впливу хімічних і чистячих засобів.
Висока стійкість до впливу сонячних променів.
Екологічність (клас емісії формальдегідів Е1).
Стінову панель можна використовувати над газовою плитою. Необхідно дотримуватись відстані 7 см від панелі до краю газової плити.

Замовте кухонний фартух скінали 📞 зараз у нашого менеджера за телефоном:
☎️ +380 (68) 949 22 42';
begin
  select id into cat_kompozit from categories where slug = 'kompozit';
  select id into cat_hpl from categories where slug = 'hpl-cvet-stoleshnic';
  select id into cat_mramor from categories where slug = 'mramor-plitka';
  select id into cat_derevo from categories where slug = 'pid-derevo';
  select id into cat_bili from categories where slug = 'bili-paneli';

  insert into products (id, slug, title, category_id, price, old_price, is_sale, is_new, short_description, description, sort_order)
  values (gen_random_uuid(), 'bilyy-mramur', 'Білий мармур', cat_mramor, 219.00, null, false, true,
    'Глянцева панель з малюнком білого мармуру', full_desc, 1)
  returning id into prod_id;
  insert into product_images (product_id, url, sort_order) values
    (prod_id, '/images/gallery/gallery-2.jpg', 1),
    (prod_id, '/images/gallery/gallery-8.jpg', 2);

  insert into products (id, slug, title, category_id, price, old_price, is_sale, is_new, short_description, description, sort_order)
  values (gen_random_uuid(), 'siryy-beton', 'Сірий бетон', cat_kompozit, 199.00, 249.00, true, false,
    'Лаконічна фактура під бетон', full_desc, 2)
  returning id into prod_id;
  insert into product_images (product_id, url, sort_order) values
    (prod_id, '/images/gallery/gallery-3.jpg', 1);

  insert into products (id, slug, title, category_id, price, old_price, is_sale, is_new, short_description, description, sort_order)
  values (gen_random_uuid(), 'dub-v-kolir-stilnyci', 'Дуб у колір стільниці', cat_hpl, 235.00, null, false, false,
    'HPL-панель у колір стільниць Egger', full_desc, 3)
  returning id into prod_id;
  insert into product_images (product_id, url, sort_order) values
    (prod_id, '/images/gallery/gallery-2.jpg', 1);
  insert into products (id, slug, title, category_id, price, old_price, is_sale, is_new, short_description, description, sort_order)
  values (gen_random_uuid(), 'dub-svitlyy', 'Дуб світлий', cat_derevo, 215.00, null, false, false,
    'Панель з текстурою світлого дерева', full_desc, 4)
  returning id into prod_id;
  insert into product_images (product_id, url, sort_order) values
    (prod_id, '/images/gallery/gallery-8.jpg', 1);

  insert into products (id, slug, title, category_id, price, old_price, is_sale, is_new, short_description, description, sort_order)
  values (gen_random_uuid(), 'biliy-hvylyastyy', 'Білий хвилястий', cat_bili, 229.00, null, false, true,
    'Глянцева біла панель з рельєфним малюнком', full_desc, 5)
  returning id into prod_id;
  insert into product_images (product_id, url, sort_order) values
    (prod_id, '/images/gallery/gallery-1.jpg', 1);
end $$;
