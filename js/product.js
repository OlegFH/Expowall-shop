import { supabase } from "./supabase-client.js";
import { escapeHtml, formatPrice, qs } from "./utils.js";

let images = [];
let activeIndex = 0;

function renderCarousel(){
  const track = document.getElementById("carouselTrack");
  const dots = document.getElementById("carouselDots");
  const thumbs = document.getElementById("carouselThumbs");

  track.innerHTML = images.map(img => `
    <div class="carousel__slide"><img src="${escapeHtml(img.url)}" alt="" loading="lazy"></div>
  `).join("");
  track.style.transform = `translateX(-${activeIndex * 100}%)`;

  dots.innerHTML = images.length > 1 ? images.map((_,i) =>
    `<button aria-label="Зображення ${i+1}" class="${i===activeIndex?"is-active":""}" data-i="${i}"></button>`
  ).join("") : "";
  dots.querySelectorAll("button").forEach(b => b.addEventListener("click", () => goTo(Number(b.dataset.i))));

  thumbs.innerHTML = images.length > 1 ? images.map((img,i) =>
    `<button class="carousel__thumb ${i===activeIndex?"is-active":""}" data-i="${i}"><img src="${escapeHtml(img.url)}" alt=""></button>`
  ).join("") : "";
  thumbs.querySelectorAll("button").forEach(b => b.addEventListener("click", () => goTo(Number(b.dataset.i))));
}

function goTo(i){
  if(!images.length) return;
  activeIndex = (i + images.length) % images.length;
  renderCarousel();
}

function initCarouselControls(){
  document.getElementById("carouselPrev").addEventListener("click", () => goTo(activeIndex - 1));
  document.getElementById("carouselNext").addEventListener("click", () => goTo(activeIndex + 1));

  // свайп
  let startX = null;
  const main = document.getElementById("carouselMain");
  main.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  main.addEventListener("touchend", (e) => {
    if(startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if(dx > 40) goTo(activeIndex - 1);
    if(dx < -40) goTo(activeIndex + 1);
    startX = null;
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "ArrowLeft") goTo(activeIndex - 1);
    if(e.key === "ArrowRight") goTo(activeIndex + 1);
  });
}

async function loadProduct(){
  const slug = qs("slug");
  const root = document.getElementById("productRoot");
  if(!slug){ window.location.href = "/catalog.html"; return; }

  const { data: p, error } = await supabase
    .from("products")
    .select("*, product_images(url, sort_order), categories(title, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if(error || !p){
    root.innerHTML = `<div class="empty-state"><h3>Товар не знайдено</h3><p>Можливо, його прибрали з каталогу.</p><a class="btn btn-ghost" href="/catalog.html">До каталогу</a></div>`;
    return;
  }

  document.title = `${p.title} — Expowall.shop`;
  images = (p.product_images || []).sort((a,b)=>a.sort_order-b.sort_order);
  if(!images.length) images = [{ url: "/images/demo/swatch-2.svg" }];

  document.getElementById("crumbCategory").textContent = p.categories?.title || "Каталог";
  document.getElementById("crumbCategory").href = p.categories?.slug ? `/catalog.html?cat=${encodeURIComponent(p.categories.slug)}` : "/catalog.html";
  document.getElementById("crumbTitle").textContent = p.title;

  document.getElementById("productCat").textContent = p.categories?.title || "";
  document.getElementById("productTitle").textContent = p.title;
  document.getElementById("productPrice").textContent = formatPrice(p.price);
  const oldEl = document.getElementById("productOldPrice");
  if(p.old_price){ oldEl.textContent = formatPrice(p.old_price); oldEl.style.display = "inline"; }
  else { oldEl.style.display = "none"; }
  document.getElementById("productDesc").textContent = p.description || p.short_description || "";

  renderCarousel();
  initCarouselControls();

  document.getElementById("orderProductBtn").addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("expowall:openOrderModal", { detail: { productId: p.id, productTitle: p.title } }));
  });

  loadRelated(p);
}

async function loadRelated(p){
  const wrap = document.getElementById("relatedGrid");
  const section = document.getElementById("relatedSection");
  if(!p.categories?.slug){ section.style.display = "none"; return; }
  const { data } = await supabase
    .from("products")
    .select("*, product_images(url, sort_order), categories(title)")
    .eq("category_id", p.category_id)
    .neq("id", p.id)
    .eq("is_active", true)
    .order("sort_order")
    .limit(4);
  if(!data || !data.length){ section.style.display = "none"; return; }
  wrap.innerHTML = data.map(item => {
    const img = (item.product_images||[]).sort((a,b)=>a.sort_order-b.sort_order)[0]?.url || "/images/demo/swatch-2.svg";
    return `
    <a class="product-card" href="/product.html?slug=${encodeURIComponent(item.slug)}">
      <div class="product-card__media"><img src="${escapeHtml(img)}" alt="${escapeHtml(item.title)}" loading="lazy"></div>
      <div class="product-card__body">
        <span class="product-card__cat">${escapeHtml(item.categories?.title || "")}</span>
        <span class="product-card__title">${escapeHtml(item.title)}</span>
        <div class="product-card__prices"><span class="product-card__price">${formatPrice(item.price)}</span></div>
      </div>
      <span class="product-card__cta">Детальніше</span>
    </a>`;
  }).join("");
}

loadProduct();
