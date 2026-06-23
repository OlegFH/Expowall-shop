import { supabase } from "./supabase-client.js";
import { escapeHtml, formatPrice } from "./utils.js";

async function loadHero(){
  const { data } = await supabase.from("site_content").select("value").eq("key","hero").single();
  const v = data?.value || {};
  document.getElementById("heroEyebrow").textContent = v.eyebrow || "EXPOWALL.SHOP · КИЇВ";
  document.getElementById("heroTitle").textContent = v.title || "Кухонні стінові панелі під замовлення";
  document.getElementById("heroSubtitle").textContent = v.subtitle || "";
  const cta = document.getElementById("heroCta");
  cta.textContent = v.cta_text || "Переглянути каталог";
  cta.href = v.cta_link || "/catalog.html";
  const priceEl = document.getElementById("heroPrice");
  if(priceEl){
    if(v.price_from){ priceEl.textContent = v.price_from; priceEl.style.display = "inline-block"; }
    else priceEl.style.display = "none";
  }
}

async function loadQuickContact(){
  const wrap = document.getElementById("heroQuickContact");
  if(!wrap) return;
  const { data } = await supabase.from("site_content").select("value").eq("key","contacts").single();
  const c = data?.value || {};
  const digits = (c.phone || "").replace(/[^+\d]/g,"");
  if(!digits){ wrap.innerHTML = ""; return; }
  const telDigits = digits.replace("+","");
  wrap.innerHTML = `
    <a class="quickcontact-btn quickcontact-btn--phone" href="tel:${digits}">📞 ${escapeHtml(c.phone)}</a>
    <a class="quickcontact-btn" href="https://t.me/+${telDigits}" target="_blank" rel="noopener">Telegram</a>
    <a class="quickcontact-btn" href="viber://chat?number=%2B${telDigits}">Viber</a>
  `;
}

async function loadTrustStats(){
  const wrap = document.getElementById("heroStats");
  if(!wrap) return;
  const { data } = await supabase.from("site_content").select("value").eq("key","trust_stats").single();
  const list = data?.value || [];
  wrap.innerHTML = list.map(s => `
    <div class="hero__stat">
      <span class="hero__stat-value">${escapeHtml(s.value)}</span>
      <span class="hero__stat-label">${escapeHtml(s.label)}</span>
    </div>`).join("");
}

async function loadHowToOrder(){
  const wrap = document.getElementById("stepsGrid");
  if(!wrap) return;
  const { data } = await supabase.from("site_content").select("value").eq("key","how_to_order").single();
  const list = data?.value || [];
  if(!list.length){ wrap.closest(".section").style.display = "none"; return; }
  wrap.innerHTML = list.map((s,i) => `
    <div class="step-card">
      <span class="step-card__num">${String(i+1).padStart(2,"0")}</span>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.text)}</p>
    </div>`).join("");
}

async function loadGallery(){
  const wrap = document.getElementById("galleryGrid");
  if(!wrap) return;
  const { data } = await supabase.from("site_content").select("value").eq("key","gallery").single();
  const list = data?.value || [];
  if(!list.length){ wrap.closest(".section").style.display = "none"; return; }
  wrap.innerHTML = list.map((g,i) => `
    <button class="gallery-grid__item" type="button" data-lightbox-index="${i}" aria-label="Відкрити фото великим планом">
      <img src="${escapeHtml(g.url)}" alt="${escapeHtml(g.caption || 'Готова кухня Expowall.shop')}" loading="lazy">
    </button>
  `).join("");
  const { initLightbox } = await import("./lightbox.js");
  initLightbox(list, "#galleryGrid");
}

async function loadTestimonials(){
  const wrap = document.getElementById("testimonialsGrid");
  if(!wrap) return;
  const { data } = await supabase.from("site_content").select("value").eq("key","testimonials").single();
  const list = data?.value || [];
  if(!list.length){ wrap.closest(".section").style.display = "none"; return; }
  wrap.innerHTML = list.map(t => `
    <div class="testimonial-card">
      <span class="testimonial-card__stars">${"★".repeat(t.rating || 5)}</span>
      <p class="testimonial-card__text">${escapeHtml(t.text)}</p>
      <span class="testimonial-card__name">${escapeHtml(t.name)}</span>
    </div>`).join("");
}

async function loadAdvantages(){
  const { data } = await supabase.from("site_content").select("value").eq("key","advantages").single();
  const list = data?.value || [];
  const wrap = document.getElementById("advantagesGrid");
  if(!wrap) return;
  wrap.innerHTML = list.map((a,i) => `
    <div class="advantage">
      <span class="advantage__num">0${i+1}</span>
      <h3>${escapeHtml(a.title)}</h3>
      <p>${escapeHtml(a.text)}</p>
    </div>`).join("");
}

async function loadCategories(){
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  const rail = document.getElementById("swatchRail");
  const grid = document.getElementById("catGrid");
  if(error || !data){ return; }

  if(rail){
    rail.innerHTML = data.map(c => `
      <a class="swatch-rail__item" href="/catalog.html?cat=${encodeURIComponent(c.slug)}">
        <div class="swatch-rail__chip" style="background-image:url('${escapeHtml(c.image_url || '')}')"></div>
        <span class="swatch-rail__name">${escapeHtml(c.title)}</span>
        <span class="swatch-rail__tag">КАТЕГОРІЯ</span>
      </a>`).join("");
  }
  if(grid){
    grid.innerHTML = data.slice(0,6).map(c => `
      <a class="cat-card" href="/catalog.html?cat=${encodeURIComponent(c.slug)}">
        <img class="cat-card__img" src="${escapeHtml(c.image_url || '')}" alt="${escapeHtml(c.title)}" loading="lazy">
        <div class="cat-card__overlay"><span class="cat-card__title">${escapeHtml(c.title)}</span></div>
      </a>`).join("");
  }
}

async function loadFeatured(){
  const grid = document.getElementById("featuredGrid");
  if(!grid) return;
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(url, sort_order), categories(title, slug)")
    .eq("is_active", true)
    .order("sort_order")
    .limit(8);
  if(error || !data || !data.length){
    grid.closest(".section").style.display = "none";
    return;
  }
  grid.innerHTML = data.map(p => {
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
  }).join("");
}

loadHero();
loadQuickContact();
loadTrustStats();
loadAdvantages();
loadCategories();
loadFeatured();
loadHowToOrder();
loadGallery();
loadTestimonials();
