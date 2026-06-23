import { supabase } from "./supabase-client.js";
import { showToast } from "./utils.js";

export function initHeroLeadForm(){
  const form = document.getElementById("heroLeadForm");
  if(!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("leadSubmitBtn");
    btn.disabled = true; btn.textContent = "Надсилаємо…";
    try{
      const { error } = await supabase.from("orders").insert({
        product_title: "Заявка з форми \"Отримати прорахунок\" (головна)",
        customer_name: document.getElementById("leadName").value.trim(),
        customer_phone: document.getElementById("leadPhone").value.trim(),
      });
      if(error) throw error;
      form.innerHTML = `<div class="hero__leadform-title">Дякуємо! Менеджер зателефонує найближчим часом 🙌</div>`;
    }catch(err){
      showToast("Не вдалося надіслати заявку. Спробуйте ще раз.");
      btn.disabled = false; btn.textContent = "Отримати прорахунок";
      console.error(err);
    }
  });
}
