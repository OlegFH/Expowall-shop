import { supabase } from "./supabase-client.js";
import { escapeHtml, formatPrice } from "./utils.js";

let priceTypes = [];

function recalc(){
  const length = parseFloat(document.getElementById("calcLength").value) || 0;
  const typeIdx = Number(document.getElementById("calcType").value);
  const type = priceTypes[typeIdx];
  const valueEl = document.getElementById("calcResultValue");
  const hintEl = document.getElementById("calcResultHint");

  if(!type || length <= 0){
    valueEl.textContent = "—";
    hintEl.textContent = "Вкажіть довжину кухні, щоб побачити орієнтовну вартість";
    return;
  }
  const total = Math.round(length * type.price);
  valueEl.textContent = formatPrice(total);
  hintEl.textContent = `${length} пог.м × ${formatPrice(type.price)}/пог.м, тип «${type.type}». Точна вартість — після заміру менеджером.`;
}

export async function initCalculator(){
  const wrap = document.getElementById("calculatorRoot");
  if(!wrap) return;

  const { data } = await supabase.from("site_content").select("value").eq("key","calculator_prices").single();
  priceTypes = data?.value || [
    { type: "Композит", price: 1800 },
    { type: "HPL у колір стільниці", price: 2200 },
    { type: "Мармур / преміум дизайн", price: 2600 },
  ];

  const typeSelect = document.getElementById("calcType");
  typeSelect.innerHTML = priceTypes.map((t,i) => `<option value="${i}">${escapeHtml(t.type)} — від ${formatPrice(t.price)}/пог.м</option>`).join("");

  document.getElementById("calcLength").addEventListener("input", recalc);
  typeSelect.addEventListener("change", recalc);
  recalc();

  document.getElementById("calcOrderBtn").addEventListener("click", () => {
    const length = document.getElementById("calcLength").value || "—";
    const type = priceTypes[Number(typeSelect.value)]?.type || "";
    document.dispatchEvent(new CustomEvent("expowall:openOrderModal", {
      detail: { productTitle: `Розрахунок: ${length} пог.м, ${type}` }
    }));
  });
}
