import { supabase } from "../../js/supabase-client.js";
import { escapeHtml, showToast } from "../../js/utils.js";

const STATUS_LABELS = { new: "Нова", in_progress: "В роботі", done: "Виконана" };

function rowTemplate(o){
  const date = new Date(o.created_at).toLocaleString("uk-UA");
  return `
  <tr data-id="${o.id}">
    <td>${date}</td>
    <td>${escapeHtml(o.customer_name || "—")}</td>
    <td><a href="tel:${escapeHtml((o.customer_phone||"").replace(/[^+\d]/g,""))}">${escapeHtml(o.customer_phone || "—")}</a></td>
    <td>${escapeHtml(o.product_title || "—")}</td>
    <td>${escapeHtml(o.comment || "—")}</td>
    <td>
      <select data-action="status">
        ${Object.entries(STATUS_LABELS).map(([v,l]) => `<option value="${v}" ${o.status===v?"selected":""}>${l}</option>`).join("")}
      </select>
    </td>
    <td><button class="btn btn-danger btn-xs" data-action="delete">Видалити</button></td>
  </tr>`;
}

export async function renderOrdersPanel(){
  const panel = document.getElementById("panel-orders");
  panel.innerHTML = `
    <div class="admin-toolbar"><strong>Заявки з сайту</strong></div>
    <table class="admin-table">
      <thead><tr><th>Дата</th><th>Ім'я</th><th>Телефон</th><th>Товар</th><th>Коментар</th><th>Статус</th><th></th></tr></thead>
      <tbody id="ordersTableBody"></tbody>
    </table>`;
  await loadOrders();
}

async function loadOrders(){
  const body = document.getElementById("ordersTableBody");
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if(error){ body.innerHTML = `<tr class="empty-row"><td colspan="7">Помилка: ${escapeHtml(error.message)}</td></tr>`; return; }
  if(!data || !data.length){ body.innerHTML = `<tr class="empty-row"><td colspan="7">Заявок поки немає</td></tr>`; return; }

  body.innerHTML = data.map(rowTemplate).join("");
  body.querySelectorAll("tr[data-id]").forEach(tr => {
    const id = tr.dataset.id;
    tr.querySelector('[data-action="status"]').addEventListener("change", async (e) => {
      const { error } = await supabase.from("orders").update({ status: e.target.value }).eq("id", id);
      if(error) showToast("Не вдалося оновити статус");
      else showToast("Статус оновлено");
    });
    tr.querySelector('[data-action="delete"]').addEventListener("click", async () => {
      if(!confirm("Видалити заявку?")) return;
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if(error){ showToast("Помилка видалення"); return; }
      await loadOrders();
    });
  });
}
