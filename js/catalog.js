import { supabase, PAGE_SIZE } from "./supabase-client.js";
import { escapeHtml, formatPrice, qs, setQs, renderPagination } from "./utils.js";

let categories = [];
let activeCat = qs("cat") || "";
let page = Math.max(1, parseInt(qs("page") || "1", 10));

async function loadCategories(){
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  categories = data || [];
  const wrap = document.getElementById("filters");
  if(!wrap) return;
  const chips = [{slug:"", title:"Усі категорії"}, ...categories];
  wrap.innerHTML = chips.map(c => `
    <button class="filter-chip ${activeCat === c.slug ? "is-active" : ""}" data-slug="${escapeHtml(c.slug)}">
      ${escapeHtml(c.title)}
    </button>`).join("");
  wrap.querySelectorAll(".filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCat = btn.dataset.slug;
      page = 1;
      setQs({ cat: activeCat || null, page: null });
      loadProducts();
      wrap.querySelectorAll(".filter-chip").forEach(b => b.classList.toggle("is-active", b === btn));
    });
  });
}

function cardTemplate(p){
  const img = (p.product_images || []).sort((a,b)=>a.sort_order-b.sort_order)[0]?.url || "/images/demo/swatch-2.svg";
  return `
  <a class="product-card" href="/product.html?slug=${encodeURIComponent(p.slug)}">
    <div class="product-card__media">
      <img src="${escapeHtml(img)}" alt="${escapeHtml(p.title)}" loading="lazy">
      ${p.is_sale ? `<span class="product-card__badge">Знижка</span>` : (p.is_new ? `<span class="product-card__badge">Новинка</span>` : "")}
    </div>
    <div class="product-card__body">
      <span class="product-card__cat">${escapeHtml(p.categories?.title || "")}</span>
      <span class="product-card__title">${escapeHtml(p.title)}</span>
      <div class="product-card__prices">
        <span class="product-card__price">${formatPrice(p.price)}</span>
        ${p.old_price ? `<span class="product-card__old">${formatPrice(p.old_price)}</span>` : ""}
      </div>
    </div>
    <span class="product-card__cta">Детальніше</span>
  </a>`;
}

async function loadProducts(){
  const grid = document.getElementById("productGrid");
  const skeleton = document.getElementById("skeletonGrid");
  const empty = document.getElementById("emptyState");
  const countEl = document.getElementById("catalogCount");
  const pager = document.getElementById("pagination");

  grid.style.display = "none";
  empty.style.display = "none";
  skeleton.style.display = "grid";

  let query = supabase.from("products")
    .select("*, product_images(url, sort_order), categories(title, slug)", { count: "exact" })
    .eq("is_active", true);

  if(activeCat){
    const cat = categories.find(c => c.slug === activeCat);
    if(cat) query = query.eq("category_id", cat.id);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.order("sort_order").range(from, to);

  const { data, error, count } = await query;
  skeleton.style.display = "none";

  const title = activeCat ? (categories.find(c=>c.slug===activeCat)?.title || "Каталог") : "Весь каталог";
  document.getElementById("catalogTitle").textContent = title;

  if(error || !data || !data.length){
    empty.style.display = "block";
    countEl.textContent = "";
    pager.innerHTML = "";
    return;
  }

  grid.style.display = "grid";
  grid.innerHTML = data.map(cardTemplate).join("");
  countEl.textContent = `Знайдено товарів: ${count}`;

  const pageCount = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));
  renderPagination(pager, { page, pageCount, onChange: (p) => {
    page = p;
    setQs({ page: p === 1 ? null : p });
    loadProducts();
    window.scrollTo({ top: document.getElementById("productGrid").offsetTop - 100, behavior: "smooth" });
  }});
}

await loadCategories();
loadProducts();
