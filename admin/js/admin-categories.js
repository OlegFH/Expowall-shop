import { supabase } from "../../js/supabase-client.js";
import { uploadImage } from "./admin-storage.js";
import { slugify, escapeHtml, showToast } from "../../js/utils.js";

let categories = [];
let editingId = null;
let pendingImageUrl = null;

function rowTemplate(c){
  return `
  <tr data-id="${c.id}">
    <td><img class="thumb" src="${escapeHtml(c.image_url || '/images/demo/swatch-2.svg')}" alt=""></td>
    <td>${escapeHtml(c.title)}</td>
    <td><code>${escapeHtml(c.slug)}</code></td>
    <td>${c.sort_order}</td>
    <td>
      <div class="admin-row-actions">
        <button class="btn btn-ghost btn-xs" data-action="edit">Редагувати</button>
        <button class="btn btn-danger btn-xs" data-action="delete">Видалити</button>
      </div>
    </td>
  </tr>`;
}

export async function renderCategoriesPanel(){
  const panel = document.getElementById("panel-categories");
  panel.innerHTML = `
    <div class="admin-toolbar">
      <strong>Категорії</strong>
      <button class="btn btn-primary btn-xs" id="catAddBtn">+ Додати категорію</button>
    </div>
    <table class="admin-table">
      <thead><tr><th>Фото</th><th>Назва</th><th>Slug</th><th>Сорт.</th><th></th></tr></thead>
      <tbody id="catTableBody"></tbody>
    </table>
    ${categoryModalMarkup()}`;

  document.getElementById("catAddBtn").addEventListener("click", () => openCategoryModal());
  bindModalEvents();
  await loadCategories();
}

async function loadCategories(){
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  const body = document.getElementById("catTableBody");
  if(error){ body.innerHTML = `<tr class="empty-row"><td colspan="5">Помилка завантаження: ${escapeHtml(error.message)}</td></tr>`; return; }
  categories = data || [];
  if(!categories.length){ body.innerHTML = `<tr class="empty-row"><td colspan="5">Категорій ще немає</td></tr>`; return; }
  body.innerHTML = categories.map(rowTemplate).join("");
  body.querySelectorAll("tr[data-id]").forEach(tr => {
    const id = tr.dataset.id;
    tr.querySelector('[data-action="edit"]').addEventListener("click", () => openCategoryModal(categories.find(c=>c.id===id)));
    tr.querySelector('[data-action="delete"]').addEventListener("click", () => deleteCategory(id));
  });
}

function categoryModalMarkup(){
  return `
  <div class="modal-backdrop" id="catModalBackdrop">
    <div class="modal">
      <button class="modal__close" id="catModalClose">&times;</button>
      <h3 id="catModalTitle">Нова категорія</h3>
      <form id="catForm">
        <div class="field">
          <label>Назва</label>
          <input type="text" id="catTitle" required>
        </div>
        <div class="field">
          <label>Slug (URL)</label>
          <input type="text" id="catSlug" required>
          <p class="field-hint">Латиницею, без пробілів. Згенерується автоматично з назви.</p>
        </div>
        <div class="field">
          <label>Порядок сортування</label>
          <input type="number" id="catSort" value="0">
        </div>
        <div class="field">
          <label>Зображення категорії</label>
          <div class="image-manager">
            <div class="image-manager__item" id="catImagePreviewWrap" style="display:none">
              <img id="catImagePreview" src="" alt="">
            </div>
            <label class="image-manager__upload">
              +
              <input type="file" id="catImageInput" accept="image/*">
            </label>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Зберегти</button>
      </form>
    </div>
  </div>`;
}

function openCategoryModal(cat){
  editingId = cat?.id || null;
  pendingImageUrl = cat?.image_url || null;
  document.getElementById("catModalTitle").textContent = cat ? "Редагувати категорію" : "Нова категорія";
  document.getElementById("catTitle").value = cat?.title || "";
  document.getElementById("catSlug").value = cat?.slug || "";
  document.getElementById("catSort").value = cat?.sort_order ?? 0;
  const wrap = document.getElementById("catImagePreviewWrap");
  if(pendingImageUrl){ document.getElementById("catImagePreview").src = pendingImageUrl; wrap.style.display = "block"; }
  else wrap.style.display = "none";
  document.getElementById("catModalBackdrop").classList.add("is-open");
}

function closeCategoryModal(){
  document.getElementById("catModalBackdrop").classList.remove("is-open");
}

function bindModalEvents(){
  document.getElementById("catModalClose").addEventListener("click", closeCategoryModal);
  document.getElementById("catModalBackdrop").addEventListener("click", (e) => { if(e.target.id === "catModalBackdrop") closeCategoryModal(); });

  document.getElementById("catTitle").addEventListener("input", (e) => {
    if(!editingId) document.getElementById("catSlug").value = slugify(e.target.value);
  });

  document.getElementById("catImageInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    try{
      const url = await uploadImage(file, "categories");
      pendingImageUrl = url;
      document.getElementById("catImagePreview").src = url;
      document.getElementById("catImagePreviewWrap").style.display = "block";
    }catch(err){ showToast("Не вдалося завантажити зображення"); console.error(err); }
  });

  document.getElementById("catForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById("catTitle").value.trim(),
      slug: slugify(document.getElementById("catSlug").value || document.getElementById("catTitle").value),
      sort_order: Number(document.getElementById("catSort").value) || 0,
      image_url: pendingImageUrl,
    };
    try{
      if(editingId){
        const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
        if(error) throw error;
      }else{
        const { error } = await supabase.from("categories").insert(payload);
        if(error) throw error;
      }
      showToast("Категорію збережено");
      closeCategoryModal();
      await loadCategories();
    }catch(err){
      showToast("Помилка збереження: " + err.message);
    }
  });
}

async function deleteCategory(id){
  if(!confirm("Видалити цю категорію? Товари в ній залишаться без категорії.")) return;
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if(error){ showToast("Помилка видалення: " + error.message); return; }
  showToast("Категорію видалено");
  await loadCategories();
}

export function getCategoriesCache(){ return categories; }
