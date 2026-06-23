import { escapeHtml } from "./utils.js";

let items = [];
let activeIndex = 0;

function markup(){
  return `
  <div class="lightbox" id="lightbox" role="dialog" aria-modal="true">
    <button class="lightbox__close" id="lightboxClose" aria-label="Закрити">&times;</button>
    <button class="lightbox__nav lightbox__nav--prev" id="lightboxPrev" aria-label="Попереднє фото">‹</button>
    <button class="lightbox__nav lightbox__nav--next" id="lightboxNext" aria-label="Наступне фото">›</button>
    <div class="lightbox__figure">
      <img id="lightboxImg" src="" alt="">
      <p class="lightbox__caption" id="lightboxCaption"></p>
    </div>
    <span class="lightbox__counter" id="lightboxCounter"></span>
  </div>`;
}

function render(){
  const item = items[activeIndex];
  if(!item) return;
  document.getElementById("lightboxImg").src = item.url;
  document.getElementById("lightboxImg").alt = item.caption || "";
  document.getElementById("lightboxCaption").textContent = item.caption || "";
  document.getElementById("lightboxCounter").textContent = `${activeIndex + 1} / ${items.length}`;
}

function go(delta){
  if(!items.length) return;
  activeIndex = (activeIndex + delta + items.length) % items.length;
  render();
}

function open(index){
  activeIndex = index;
  render();
  document.getElementById("lightbox").classList.add("is-open");
}

function close(){
  document.getElementById("lightbox")?.classList.remove("is-open");
}

export function initLightbox(galleryItems, containerSelector){
  items = galleryItems;
  if(!document.getElementById("lightbox")){
    const wrap = document.createElement("div");
    wrap.innerHTML = markup();
    document.body.appendChild(wrap.firstElementChild);
    document.getElementById("lightboxClose").addEventListener("click", close);
    document.getElementById("lightboxPrev").addEventListener("click", () => go(-1));
    document.getElementById("lightboxNext").addEventListener("click", () => go(1));
    document.getElementById("lightbox").addEventListener("click", (e) => { if(e.target.id === "lightbox") close(); });
    document.addEventListener("keydown", (e) => {
      if(!document.getElementById("lightbox")?.classList.contains("is-open")) return;
      if(e.key === "Escape") close();
      if(e.key === "ArrowLeft") go(-1);
      if(e.key === "ArrowRight") go(1);
    });
  }

  const container = document.querySelector(containerSelector);
  if(!container) return;
  container.querySelectorAll("[data-lightbox-index]").forEach(btn => {
    btn.addEventListener("click", () => open(Number(btn.dataset.lightboxIndex)));
  });
}
