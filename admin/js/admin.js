import { login, logout, getSession, onAuthChange } from "./admin-auth.js";
import { renderCategoriesPanel } from "./admin-categories.js";
import { renderProductsPanel } from "./admin-products.js";
import { renderOrdersPanel } from "./admin-orders.js";
import { renderContentPanel } from "./admin-content.js";
import { showToast } from "../../js/utils.js";

const PANELS = {
  categories: { title: "Категорії", render: renderCategoriesPanel },
  products: { title: "Товари", render: renderProductsPanel },
  orders: { title: "Заявки", render: renderOrdersPanel },
  content: { title: "Тексти сайту", render: renderContentPanel },
};

function showApp(){
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminShell").classList.add("is-active");
}
function showLogin(){
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("adminShell").classList.remove("is-active");
}

async function openPanel(key){
  document.querySelectorAll(".admin-sidebar nav button").forEach(b => b.classList.toggle("is-active", b.dataset.panel === key));
  document.querySelectorAll(".admin-panel").forEach(p => p.classList.toggle("is-active", p.id === `panel-${key}`));
  document.getElementById("topbarTitle").textContent = PANELS[key].title;
  // категории должны загружаться до товаров, чтобы был доступен список категорий в фильтре
  if(key === "products"){
    await renderCategoriesDataOnly();
  }
  await PANELS[key].render();
}

let categoriesLoadedOnce = false;
async function renderCategoriesDataOnly(){
  if(categoriesLoadedOnce) return;
  // подгружаем категории один раз в скрытую панель, чтобы заполнить кэш для фильтра товаров
  const hidden = document.getElementById("panel-categories");
  const wasActive = hidden.classList.contains("is-active");
  await renderCategoriesPanel();
  if(!wasActive) hidden.classList.remove("is-active");
  categoriesLoadedOnce = true;
}

function initNav(){
  document.querySelectorAll(".admin-sidebar nav button").forEach(btn => {
    btn.addEventListener("click", () => openPanel(btn.dataset.panel));
  });
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await logout();
  });
}

function initLoginForm(){
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("loginSubmitBtn");
    const errorEl = document.getElementById("loginError");
    errorEl.textContent = "";
    btn.disabled = true; btn.textContent = "Входимо…";
    try{
      await login(document.getElementById("loginEmail").value.trim(), document.getElementById("loginPassword").value);
    }catch(err){
      errorEl.textContent = "Невірний email або пароль.";
    }finally{
      btn.disabled = false; btn.textContent = "Увійти";
    }
  });
}

async function bootstrap(){
  initLoginForm();
  initNav();

  const session = await getSession();
  if(session){ showApp(); openPanel("categories"); }
  else showLogin();

  onAuthChange((session) => {
    if(session){ showApp(); openPanel("categories"); showToast("Вхід виконано"); }
    else showLogin();
  });
}

bootstrap();
