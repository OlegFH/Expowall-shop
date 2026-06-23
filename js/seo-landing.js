import { supabase } from "./supabase-client.js";
import { escapeHtml, formatPrice } from "./utils.js";

export async function loadLandingProducts({ categorySlug, gridId, limit = 8 }){
  const grid = document.getElementById(gridId);
  if(!grid) return;

  let query = supabase.from("products")
    .select("*, product_images(url, sort_order), categories(title, slug)")
    .eq("is_active", true)
    .order("sort_order")
    .limit(limit);

  if(categorySlug){
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).single();
    if(cat) query = query.eq("category_id", cat.id);
  }

  const { data, error } = await query;
  if(error || !data || !data.length){
    grid.innerHTML = `<p style="color:var(--slate)">Товари цієї категорії скоро з'являться. Перегляньте <a href="/catalog.html" style="color:var(--copper);font-weight:700">весь каталог</a>.</p>`;
    return;
  }

  grid.innerHTML = data.map(p => {
    const img = (p.product_images||[]).sort((a,b)=>a.sort_order-b.sort_order)[0]?.url || "/images/demo/swatch-2.svg";
    return `
    <a class="product-card" href="/product.html?slug=${encodeURIComponent(p.slug)}">
      <div class="product-card__media">
        <img src="${escapeHtml(img)}" alt="${escapeHtml(p.title)}" loading="lazy">
        ${p.is_sale ? `<span class="product-card__badge">Знижка</span>` : (p.is_new ? `<span class="product-card__badge">Новинка</span>` : "")}
      </div>
      <div class="product-card__body">
        <span class="product-card__cat">${escapeHtml(p.categories?.title || "")}</span>
        <span class="product-card__title">${escapeHtml(p.title)}</span>
        <div class="product-card__prices"><span class="product-card__price">${formatPrice(p.price)}</span></div>
      </div>
      <span class="product-card__cta">Детальніше</span>
    </a>`;
  }).join("");
}

export function bindLandingCta(){
  document.querySelectorAll("[data-open-order-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("expowall:openOrderModal", { detail: { productTitle: btn.dataset.openOrderModal || "Заявка з посадкової сторінки" } }));
    });
  });
}
