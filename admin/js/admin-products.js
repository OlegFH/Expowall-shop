import { supabase } from "../../js/supabase-client.js";
import { uploadImage, deleteImageByUrl } from "./admin-storage.js";
import { getCategoriesCache } from "./admin-categories.js";
import { slugify, escapeHtml, formatPrice, showToast, debounce } from "../../js/utils.js";

let editingId = null;
let editingImages = []; // [{id?, url, sort_order}]
let searchTerm = "";
let filterCat = "";
let page = 1;
const PAGE_SIZE = 10;

function rowTemplate(p){
  const img = (p.product_images||[]).sort((a,b)=>a.sort_order-b.sort_order)[0]?.url || "/images/demo/swatch-2.svg";
  return `
  <tr data-id="${p.id}">
    <td><img class="thumb" src="${escapeHtml(img)}" alt=""></td>
    <td>${escapeHtml(p.title)}<br><code style="font-size:.75rem;color:var(--a-slate)">${escapeHtml(p.slug)}</code></td>
    <td>${escapeHtml(p.categories?.title || "—")}</td>
    <td>${formatPrice(p.price)}${p.old_price ? `<br><span style="text-decoration:line-through;color:var(--a-slate);font-size:.8rem">${formatPrice(p.old_price)}</span>` : ""}</td>
    <td>
      ${p.is_active ? `<span class="badge badge-success">Активний</span>` : `<span class="badge badge-muted">Прихований</span>`}
      ${p.is_sale ? `<span class="badge badge-warn">Знижка</span>` : ""}
      ${p.is_new ? `<span class="badge badge-warn">Новинка</span>` : ""}
    </td>
    <td>
      <div class="admin-row-actions">
        <button class="btn btn-ghost btn-xs" data-action="edit">Редагувати</button>
        <button class="btn btn-danger btn-xs" data-action="delete">Видалити</button>
      </div>
    </td>
  </tr>`;
}

export async function renderProductsPanel(){
  const panel = document.getElementById("panel-products");
  const cats = getCategoriesCache();
  panel.innerHTML = `
    <div class="admin-toolbar">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <input type="text" id="prodSearch" placeholder="Пошук за назвою…" style="padding:8px 12px;border:1px solid var(--a-line);border-radius:2px;min-width:200px">
        <select id="prodFilterCat" style="padding:8px 12px;border:1px solid var(--a-line);border-radius:2px">
          <option value="">Усі категорії</option>
          ${cats.map(c => `<option value="${c.id}">${escapeHtml(c.title)}</option>`).join("")}
        </select>
      </div>
      <button class="btn btn-primary btn-xs" id="prodAddBtn">+ Додати товар</button>
    </div>
    <table class="admin-table">
      <thead><tr><th>Фото</th><th>Товар</th><th>Категорія</th><th>Ціна</th><th>Статус</th><th></th></tr></thead>
      <tbody id="prodTableBody"></tbody>
    </table>
    <div class="admin-toolbar" id="prodPagerWrap" style="justify-content:center"></div>
    ${productModalMarkup(cats)}`;

  document.getElementById("prodAddBtn").addEventListener("click", () => openProductModal());
  document.getElementById("prodSearch").addEventListener("input", debounce((e) => {
    searchTerm = e.target.value.trim(); page = 1; loadProducts();
  }, 350));
  document.getElementById("prodFilterCat").addEventListener("change", (e) => {
    filterCat = e.target.value; page = 1; loadProducts();
  });
  bindModalEvents(cats);
  await loadProducts();
}

async function loadProducts(){
  const body = document.getElementById("prodTableBody");
  body.innerHTML = `<tr class="empty-row"><td colspan="6">Завантаження…</td></tr>`;

  let query = supabase.from("products")
    .select("*, product_images(id,url,sort_order), categories(title)", { count: "exact" });
  if(searchTerm) query = query.ilike("title", `%${searchTerm}%`);
  if(filterCat) query = query.eq("category_id", filterCat);

  const from = (page-1)*PAGE_SIZE, to = from + PAGE_SIZE - 1;
  query = query.order("sort_order").range(from, to);

  const { data, error, count } = await query;
  if(error){ body.innerHTML = `<tr class="empty-row"><td colspan="6">Помилка: ${escapeHtml(error.message)}</td></tr>`; return; }
  if(!data || !data.length){ body.innerHTML = `<tr class="empty-row"><td colspan="6">Товарів не знайдено</td></tr>`; document.getElementById("prodPagerWrap").innerHTML=""; return; }

  body.innerHTML = data.map(rowTemplate).join("");
  body.querySelectorAll("tr[data-id]").forEach(tr => {
    const id = tr.dataset.id;
    const item = data.find(p => p.id === id);
    tr.querySelector('[data-action="edit"]').addEventListener("click", () => openProductModal(item));
    tr.querySelector('[data-action="delete"]').addEventListener("click", () => deleteProduct(item));
  });

  const pageCount = Math.max(1, Math.ceil((count||0)/PAGE_SIZE));
  const pagerWrap = document.getElementById("prodPagerWrap");
  pagerWrap.innerHTML = "";
  if(pageCount > 1){
    for(let i=1;i<=pageCount;i++){
      const b = document.createElement("button");
      b.className = "btn btn-xs " + (i===page ? "btn-primary" : "btn-ghost");
      b.textContent = i;
      b.addEventListener("click", () => { page = i; loadProducts(); });
      pagerWrap.appendChild(b);
    }
  }
}

function productModalMarkup(cats){
  return `
  <div class="modal-backdrop" id="prodModalBackdrop">
    <div class="modal" style="max-width:680px">
      <button class="modal__close" id="prodModalClose">&times;</button>
      <h3 id="prodModalTitle">Новий товар</h3>
      <form id="prodForm">
        <div class="field"><label>Назва</label><input type="text" id="prodTitle" required></div>
        <div class="field"><label>Slug (URL)</label><input type="text" id="prodSlug" required></div>
        <div class="field-row">
          <div class="field"><label>Категорія</label>
            <select id="prodCat"><option value="">Без категорії</option>${cats.map(c=>`<option value="${c.id}">${escapeHtml(c.title)}</option>`).join("")}</select>
          </div>
          <div class="field"><label>Порядок сортування</label><input type="number" id="prodSort" value="0"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Ціна, грн</label><input type="number" step="0.01" id="prodPrice"></div>
          <div class="field"><label>Стара ціна, грн (необов'язково)</label><input type="number" step="0.01" id="prodOldPrice"></div>
        </div>
        <div class="field"><label>Короткий опис</label><input type="text" id="prodShortDesc"></div>
        <div class="field"><label>Повний опис</label><textarea id="prodDesc" rows="6"></textarea></div>
        <div class="field-row">
          <div class="field-check"><input type="checkbox" id="prodIsSale"><label for="prodIsSale">Знижка</label></div>
          <div class="field-check"><input type="checkbox" id="prodIsNew"><label for="prodIsNew">Новинка</label></div>
          <div class="field-check"><input type="checkbox" id="prodIsActive" checked><label for="prodIsActive">Активний (видно на сайті)</label></div>
        </div>
        <div class="field">
          <label>Зображення (перетягуванням можна змінити порядок — перше буде головним)</label>
          <div class="image-manager" id="prodImageManager">
            <label class="image-manager__upload">
              +
              <input type="file" id="prodImageInput" accept="image/*" multiple>
            </label>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Зберегти товар</button>
      </form>
    </div>
  </div>`;
}

function renderImageManager(){
  const wrap = document.getElementById("prodImageManager");
  const uploadBtn = wrap.querySelector(".image-manager__upload");
  wrap.querySelectorAll(".image-manager__item").forEach(el => el.remove());
  editingImages
    .sort((a,b)=>a.sort_order-b.sort_order)
    .forEach((img, i) => {
      const el = document.createElement("div");
      el.className = "image-manager__item";
      el.draggable = true;
      el.dataset.index = i;
      el.innerHTML = `<img src="${escapeHtml(img.url)}" alt=""><button type="button" aria-label="Видалити">&times;</button>`;
      el.querySelector("button").addEventListener("click", async () => {
        await deleteImageByUrl(img.url);
        editingImages = editingImages.filter(x => x !== img);
        renderImageManager();
      });
      el.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", i); });
      el.addEventListener("dragover", (e) => e.preventDefault());
      el.addEventListener("drop", (e) => {
        e.preventDefault();
        const from = Number(e.dataTransfer.getData("text/plain"));
        const to = i;
        const [moved] = editingImages.splice(from,1);
        editingImages.splice(to,0,moved);
        editingImages.forEach((im,idx) => im.sort_order = idx);
        renderImageManager();
      });
      wrap.insertBefore(el, uploadBtn);
    });
}

function openProductModal(p){
  editingId = p?.id || null;
  editingImages = (p?.product_images || []).map(im => ({ id: im.id, url: im.url, sort_order: im.sort_order }));
  document.getElementById("prodModalTitle").textContent = p ? "Редагувати товар" : "Новий товар";
  document.getElementById("prodTitle").value = p?.title || "";
  document.getElementById("prodSlug").value = p?.slug || "";
  document.getElementById("prodCat").value = p?.category_id || "";
  document.getElementById("prodSort").value = p?.sort_order ?? 0;
  document.getElementById("prodPrice").value = p?.price ?? "";
  document.getElementById("prodOldPrice").value = p?.old_price ?? "";
  document.getElementById("prodShortDesc").value = p?.short_description || "";
  document.getElementById("prodDesc").value = p?.description || "";
  document.getElementById("prodIsSale").checked = !!p?.is_sale;
  document.getElementById("prodIsNew").checked = !!p?.is_new;
  document.getElementById("prodIsActive").checked = p ? !!p.is_active : true;
  renderImageManager();
  document.getElementById("prodModalBackdrop").classList.add("is-open");
}

function closeProductModal(){
  document.getElementById("prodModalBackdrop").classList.remove("is-open");
}

function bindModalEvents(){
  document.getElementById("prodModalClose").addEventListener("click", closeProductModal);
  document.getElementById("prodModalBackdrop").addEventListener("click", (e) => { if(e.target.id === "prodModalBackdrop") closeProductModal(); });
  document.getElementById("prodTitle").addEventListener("input", (e) => {
    if(!editingId) document.getElementById("prodSlug").value = slugify(e.target.value);
  });

  document.getElementById("prodImageInput").addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    for(const file of files){
      try{
        const url = await uploadImage(file, "products");
        editingImages.push({ url, sort_order: editingImages.length });
      }catch(err){ showToast("Помилка завантаження зображення"); console.error(err); }
    }
    renderImageManager();
    e.target.value = "";
  });

  document.getElementById("prodForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById("prodTitle").value.trim(),
      slug: slugify(document.getElementById("prodSlug").value || document.getElementById("prodTitle").value),
      category_id: document.getElementById("prodCat").value || null,
      sort_order: Number(document.getElementById("prodSort").value) || 0,
      price: document.getElementById("prodPrice").value || null,
      old_price: document.getElementById("prodOldPrice").value || null,
      short_description: document.getElementById("prodShortDesc").value.trim() || null,
      description: document.getElementById("prodDesc").value.trim() || null,
      is_sale: document.getElementById("prodIsSale").checked,
      is_new: document.getElementById("prodIsNew").checked,
      is_active: document.getElementById("prodIsActive").checked,
    };
    try{
      let productId = editingId;
      if(editingId){
        const { error } = await supabase.from("products").update(payload).eq("id", editingId);
        if(error) throw error;
      }else{
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if(error) throw error;
        productId = data.id;
      }

      // синхронизируем изображения: удаляем старые записи, вставляем заново в нужном порядке
      await supabase.from("product_images").delete().eq("product_id", productId);
      if(editingImages.length){
        const rows = editingImages.map((img, i) => ({ product_id: productId, url: img.url, sort_order: i }));
        const { error: imgErr } = await supabase.from("product_images").insert(rows);
        if(imgErr) throw imgErr;
      }

      showToast("Товар збережено");
      closeProductModal();
      await loadProducts();
    }catch(err){
      showToast("Помилка збереження: " + err.message);
    }
  });
}

async function deleteProduct(p){
  if(!confirm(`Видалити товар «${p.title}»?`)) return;
  for(const img of (p.product_images||[])) await deleteImageByUrl(img.url);
  const { error } = await supabase.from("products").delete().eq("id", p.id);
  if(error){ showToast("Помилка видалення: " + error.message); return; }
  showToast("Товар видалено");
  await loadProducts();
}
