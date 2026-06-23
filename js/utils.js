export function escapeHtml(str){
  if(str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

export function formatPrice(value){
  if(value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " грн";
}

export function slugify(str){
  const map = {а:"a",б:"b",в:"v",г:"h",ґ:"g",д:"d",е:"e",ё:"e",є:"ie",ж:"zh",з:"z",и:"y",і:"i",ї:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya"};
  return String(str).toLowerCase().trim()
    .split("").map(ch => map[ch] !== undefined ? map[ch] : ch).join("")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80) || "item-" + Date.now();
}

export function debounce(fn, wait=300){
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

export function qs(name){
  return new URLSearchParams(window.location.search).get(name);
}

export function setQs(params){
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([k,v]) => {
    if(v === null || v === undefined || v === "") url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  });
  window.history.pushState({}, "", url);
}

let toastTimer;
export function showToast(message){
  let el = document.querySelector(".toast");
  if(!el){
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("is-open");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-open"), 3200);
}

export function renderPagination(container, { page, pageCount, onChange }){
  if(!container) return;
  if(pageCount <= 1){ container.innerHTML = ""; return; }
  const items = [];
  const add = (label, target, opts={}) => items.push({label, target, ...opts});

  add("‹", page - 1, { disabled: page <= 1 });
  const windowSize = 1;
  let lastShown = 0;
  for(let p = 1; p <= pageCount; p++){
    if(p === 1 || p === pageCount || Math.abs(p - page) <= windowSize){
      if(lastShown && p - lastShown > 1) add("…", null, { dots:true });
      add(String(p), p, { active: p === page });
      lastShown = p;
    }
  }
  add("›", page + 1, { disabled: page >= pageCount });

  container.innerHTML = "";
  items.forEach(it => {
    const btn = document.createElement("button");
    btn.textContent = it.label;
    if(it.dots){ btn.className = "dots"; btn.disabled = true; }
    if(it.active) btn.classList.add("is-active");
    if(it.disabled) btn.disabled = true;
    if(!it.dots && !it.disabled){
      btn.addEventListener("click", () => onChange(it.target));
    }
    container.appendChild(btn);
  });
}
