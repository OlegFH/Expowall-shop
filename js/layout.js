import { supabase } from "./supabase-client.js";
import { escapeHtml } from "./utils.js";

const NAV_LINKS = [
  { href: "/catalog.html", label: "Каталог" },
  { href: "/about.html", label: "Про компанію" },
  { href: "/delivery.html", label: "Доставка" },
  { href: "/payment.html", label: "Оплата" },
  { href: "/contacts.html", label: "Контакти" },
];

function currentPath(){
  return window.location.pathname.replace(/\/index\.html$/, "/");
}

function renderHeader(phone){
  const path = currentPath();
  const links = NAV_LINKS.map(l => {
    const active = path === l.href || (l.href === "/catalog.html" && path.startsWith("/catalog"));
    return `<a href="${l.href}" class="${active ? "is-active" : ""}">${l.label}</a>`;
  }).join("");

  return `
  <div class="site-header__bar">
    <a href="/" class="site-header__logo" aria-label="Expowall.shop — на головну">
      <img src="/images/logo.png" alt="Expowall.shop — краще ніж скло" width="44" height="44">
    </a>
    <nav class="site-nav" id="siteNav">${links}</nav>
    <div class="site-header__contact">
      <a class="site-header__phone" href="tel:${(phone||"").replace(/[^+\d]/g,"")}">${escapeHtml(phone || "")}</a>
      <button class="btn btn-primary btn-sm" id="openOrderModalHeader">Замовити дзвінок</button>
      <button class="burger" id="burgerBtn" aria-label="Відкрити меню" aria-expanded="false"><span></span></button>
    </div>
  </div>`;
}

function renderFooter(contacts){
  const social = (contacts.social || []).map(s =>
    `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>`
  ).join("");

  return `
  <div class="container footer-grid">
    <div>
      <div class="footer-logo"><img src="/images/logo.png" alt="Expowall.shop"></div>
      <p>Глянцеві стінові панелі та кухонні фартухи. Виготовлення та доставка по Києву і Україні.</p>
    </div>
    <div>
      <h4>Каталог</h4>
      <ul>
        <li><a href="/catalog.html">Усі категорії</a></li>
        <li><a href="/catalog.html?cat=sale">Розпродаж</a></li>
        <li><a href="/panel-pid-mramur.html">Панелі під мармур</a></li>
        <li><a href="/panel-pid-derevo.html">Панелі під дерево</a></li>
        <li><a href="/bili-paneli.html">Білі панелі</a></li>
        <li><a href="/skinali-dlya-kuhni.html">Скінали для кухні</a></li>
        <li><a href="/fartuh-hpl.html">Фартух з HPL</a></li>
        <li><a href="/fartuh-mdf.html">Фартух МДФ</a></li>
      </ul>
    </div>
    <div>
      <h4>Компанія</h4>
      <ul>
        <li><a href="/about.html">Про компанію</a></li>
        <li><a href="/delivery.html">Доставка</a></li>
        <li><a href="/payment.html">Оплата</a></li>
        <li><a href="/contacts.html">Контакти</a></li>
      </ul>
    </div>
    <div>
      <h4>Контакти</h4>
      <ul>
        <li><a href="tel:${escapeHtml((contacts.phone||"").replace(/[^+\d]/g,""))}">${escapeHtml(contacts.phone||"")}</a></li>
        <li><a href="mailto:${escapeHtml(contacts.email||"")}">${escapeHtml(contacts.email||"")}</a></li>
        <li>${escapeHtml(contacts.address||"")}</li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <span>© ${new Date().getFullYear()} Expowall.shop</span>
    <div class="footer-social">${social}</div>
    <a href="/admin/">Вхід в адмінку</a>
  </div>`;
}

export async function initLayout(){
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");

  let contacts = { phone: "", email: "", address: "", social: [] };
  try{
    const { data } = await supabase.from("site_content").select("value").eq("key","contacts").single();
    if(data && data.value) contacts = data.value;
  }catch(e){ /* налаштуйте Supabase в js/config.js */ }

  if(headerEl) headerEl.innerHTML = renderHeader(contacts.phone);
  if(footerEl) footerEl.innerHTML = renderFooter(contacts);

  const burger = document.getElementById("burgerBtn");
  const nav = document.getElementById("siteNav");
  if(burger && nav){
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }

  const openHeaderOrder = document.getElementById("openOrderModalHeader");
  if(openHeaderOrder){
    openHeaderOrder.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("expowall:openOrderModal", { detail: { productTitle: "Дзвінок менеджера" } }));
    });
  }
}

initLayout();
