import { supabase } from "./supabase-client.js";
import { showToast } from "./utils.js";

function modalMarkup(){
  return `
  <div class="modal-backdrop" id="orderModalBackdrop">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="orderModalTitle">
      <button class="modal__close" id="orderModalClose" aria-label="Закрити">&times;</button>
      <h3 id="orderModalTitle">Залишити заявку</h3>
      <p id="orderModalSubtitle">Заповніть форму, і ми зв'яжемося з вами найближчим часом.</p>
      <form id="orderForm">
        <div class="field">
          <label for="orderName">Ім'я</label>
          <input type="text" id="orderName" name="name" required autocomplete="name">
        </div>
        <div class="field">
          <label for="orderPhone">Телефон</label>
          <input type="tel" id="orderPhone" name="phone" required autocomplete="tel" placeholder="+380 (00) 000-00-00">
        </div>
        <div class="field">
          <label for="orderComment">Коментар (необов'язково)</label>
          <textarea id="orderComment" name="comment" rows="3"></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block" id="orderSubmitBtn">Надіслати заявку</button>
        <p class="field-hint">Натискаючи кнопку, ви погоджуєтесь на обробку персональних даних.</p>
      </form>
    </div>
  </div>`;
}

let currentContext = {};

export function mountOrderModal(){
  if(document.getElementById("orderModalBackdrop")) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = modalMarkup();
  document.body.appendChild(wrap.firstElementChild);

  const backdrop = document.getElementById("orderModalBackdrop");
  const closeBtn = document.getElementById("orderModalClose");
  const form = document.getElementById("orderForm");

  const close = () => backdrop.classList.remove("is-open");
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => { if(e.target === backdrop) close(); });
  document.addEventListener("keydown", (e) => { if(e.key === "Escape") close(); });

  document.addEventListener("expowall:openOrderModal", (e) => {
    currentContext = e.detail || {};
    document.getElementById("orderModalSubtitle").textContent = currentContext.productTitle
      ? `Заявка щодо товару: ${currentContext.productTitle}` : "Заповніть форму, і ми зв'яжемося з вами найближчим часом.";
    backdrop.classList.add("is-open");
    document.getElementById("orderName").focus();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("orderSubmitBtn");
    btn.disabled = true; btn.textContent = "Надсилаємо…";
    const payload = {
      product_id: currentContext.productId || null,
      product_title: currentContext.productTitle || null,
      customer_name: document.getElementById("orderName").value.trim(),
      customer_phone: document.getElementById("orderPhone").value.trim(),
      comment: document.getElementById("orderComment").value.trim() || null,
    };
    try{
      const { error } = await supabase.from("orders").insert(payload);
      if(error) throw error;
      showToast("Заявку надіслано, ми скоро з'яжемося з вами!");
      form.reset();
      close();
    }catch(err){
      showToast("Не вдалося надіслати заявку. Перевірте підключення до Supabase.");
      console.error(err);
    }finally{
      btn.disabled = false; btn.textContent = "Надіслати заявку";
    }
  });
}

mountOrderModal();
