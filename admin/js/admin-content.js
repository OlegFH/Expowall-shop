import { supabase } from "../../js/supabase-client.js";
import { showToast } from "../../js/utils.js";

async function getValue(key){
  const { data } = await supabase.from("site_content").select("value").eq("key", key).single();
  return data?.value || {};
}
async function saveValue(key, value){
  const { error } = await supabase.from("site_content").upsert({ key, value, updated_at: new Date().toISOString() });
  if(error) throw error;
}

export async function renderContentPanel(){
  const panel = document.getElementById("panel-content");
  panel.innerHTML = `
    <div class="admin-toolbar"><strong>Тексти сайту</strong></div>
    <div class="content-form">

      <h4>Головний банер (hero)</h4>
      <div class="field"><label>Підзаголовок (eyebrow)</label><input id="cHeroEyebrow"></div>
      <div class="field"><label>Заголовок</label><input id="cHeroTitle"></div>
      <div class="field"><label>Опис</label><textarea id="cHeroSubtitle" rows="2"></textarea></div>
      <div class="field"><label>Ціна "від" (показується під заголовком)</label><input id="cHeroPrice" placeholder="Від 2800 грн/шт"></div>
      <div class="field"><label>Текст кнопки</label><input id="cHeroCta"></div>
      <button class="btn btn-primary" id="saveHero">Зберегти банер</button>

      <hr style="border:none;border-top:1px solid var(--a-line);margin:8px 0">
      <h4>Цифри довіри на першому екрані</h4>
      <div class="field-row">
        <div class="field"><label>Значення 1</label><input id="cStat1Value" placeholder="500+"></div>
        <div class="field"><label>Підпис 1</label><input id="cStat1Label" placeholder="Виготовили кухонь"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Значення 2</label><input id="cStat2Value" placeholder="12 міс."></div>
        <div class="field"><label>Підпис 2</label><input id="cStat2Label" placeholder="Гарантія"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Значення 3</label><input id="cStat3Value" placeholder="Київ"></div>
        <div class="field"><label>Підпис 3</label><input id="cStat3Label" placeholder="Власне виробництво"></div>
      </div>
      <button class="btn btn-primary" id="saveStats">Зберегти цифри довіри</button>

      <hr style="border:none;border-top:1px solid var(--a-line);margin:8px 0">
      <h4>Калькулятор вартості (ціна за погонний метр)</h4>
      <div class="field-row">
        <div class="field"><label>Тип 1 — назва</label><input id="cCalc1Type" placeholder="Композит"></div>
        <div class="field"><label>Тип 1 — ціна, грн/пог.м</label><input type="number" id="cCalc1Price"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Тип 2 — назва</label><input id="cCalc2Type" placeholder="HPL у колір стільниці"></div>
        <div class="field"><label>Тип 2 — ціна, грн/пог.м</label><input type="number" id="cCalc2Price"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Тип 3 — назва</label><input id="cCalc3Type" placeholder="Мармур / преміум дизайн"></div>
        <div class="field"><label>Тип 3 — ціна, грн/пог.м</label><input type="number" id="cCalc3Price"></div>
      </div>
      <button class="btn btn-primary" id="saveCalc">Зберегти ціни калькулятора</button>

      <hr style="border:none;border-top:1px solid var(--a-line);margin:8px 0">
      <h4>Про компанію</h4>
      <div class="field"><label>Заголовок</label><input id="cAboutTitle"></div>
      <div class="field"><label>Текст</label><textarea id="cAboutBody" rows="6"></textarea></div>
      <button class="btn btn-primary" id="saveAbout">Зберегти</button>

      <hr style="border:none;border-top:1px solid var(--a-line);margin:8px 0">
      <h4>Доставка</h4>
      <div class="field"><label>Заголовок</label><input id="cDeliveryTitle"></div>
      <div class="field"><label>Текст</label><textarea id="cDeliveryBody" rows="6"></textarea></div>
      <button class="btn btn-primary" id="saveDelivery">Зберегти</button>

      <hr style="border:none;border-top:1px solid var(--a-line);margin:8px 0">
      <h4>Оплата</h4>
      <div class="field"><label>Заголовок</label><input id="cPaymentTitle"></div>
      <div class="field"><label>Текст</label><textarea id="cPaymentBody" rows="6"></textarea></div>
      <button class="btn btn-primary" id="savePayment">Зберегти</button>

      <hr style="border:none;border-top:1px solid var(--a-line);margin:8px 0">
      <h4>Контакти</h4>
      <div class="field-row">
        <div class="field"><label>Телефон</label><input id="cPhone"></div>
        <div class="field"><label>Email</label><input id="cEmail"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Адреса</label><input id="cAddress"></div>
        <div class="field"><label>Графік роботи</label><input id="cHours"></div>
      </div>
      <button class="btn btn-primary" id="saveContacts">Зберегти контакти</button>
    </div>`;

  const hero = await getValue("hero");
  document.getElementById("cHeroEyebrow").value = hero.eyebrow || "";
  document.getElementById("cHeroTitle").value = hero.title || "";
  document.getElementById("cHeroSubtitle").value = hero.subtitle || "";
  document.getElementById("cHeroPrice").value = hero.price_from || "";
  document.getElementById("cHeroCta").value = hero.cta_text || "";
  document.getElementById("saveHero").addEventListener("click", async () => {
    try{
      await saveValue("hero", {
        ...hero,
        eyebrow: document.getElementById("cHeroEyebrow").value,
        title: document.getElementById("cHeroTitle").value,
        subtitle: document.getElementById("cHeroSubtitle").value,
        price_from: document.getElementById("cHeroPrice").value,
        cta_text: document.getElementById("cHeroCta").value,
        cta_link: hero.cta_link || "/catalog.html",
      });
      showToast("Банер збережено");
    }catch(err){ showToast("Помилка: " + err.message); }
  });

  const stats = await getValue("trust_stats");
  const statsArr = Array.isArray(stats) ? stats : [];
  [1,2,3].forEach((n,i) => {
    document.getElementById(`cStat${n}Value`).value = statsArr[i]?.value || "";
    document.getElementById(`cStat${n}Label`).value = statsArr[i]?.label || "";
  });
  document.getElementById("saveStats").addEventListener("click", async () => {
    try{
      const newStats = [1,2,3].map(n => ({
        value: document.getElementById(`cStat${n}Value`).value,
        label: document.getElementById(`cStat${n}Label`).value,
      })).filter(s => s.value || s.label);
      await saveValue("trust_stats", newStats);
      showToast("Цифри довіри збережено");
    }catch(err){ showToast("Помилка: " + err.message); }
  });

  const calcPrices = await getValue("calculator_prices");
  const calcArr = Array.isArray(calcPrices) ? calcPrices : [];
  [1,2,3].forEach((n,i) => {
    document.getElementById(`cCalc${n}Type`).value = calcArr[i]?.type || "";
    document.getElementById(`cCalc${n}Price`).value = calcArr[i]?.price ?? "";
  });
  document.getElementById("saveCalc").addEventListener("click", async () => {
    try{
      const newCalc = [1,2,3].map(n => ({
        type: document.getElementById(`cCalc${n}Type`).value,
        price: Number(document.getElementById(`cCalc${n}Price`).value) || 0,
      })).filter(c => c.type);
      await saveValue("calculator_prices", newCalc);
      showToast("Ціни калькулятора збережено");
    }catch(err){ showToast("Помилка: " + err.message); }
  });

  const about = await getValue("about");
  document.getElementById("cAboutTitle").value = about.title || "";
  document.getElementById("cAboutBody").value = about.body || "";
  document.getElementById("saveAbout").addEventListener("click", async () => {
    try{
      await saveValue("about", { title: document.getElementById("cAboutTitle").value, body: document.getElementById("cAboutBody").value });
      showToast("Збережено");
    }catch(err){ showToast("Помилка: " + err.message); }
  });

  const delivery = await getValue("delivery");
  document.getElementById("cDeliveryTitle").value = delivery.title || "";
  document.getElementById("cDeliveryBody").value = delivery.body || "";
  document.getElementById("saveDelivery").addEventListener("click", async () => {
    try{
      await saveValue("delivery", { title: document.getElementById("cDeliveryTitle").value, body: document.getElementById("cDeliveryBody").value });
      showToast("Збережено");
    }catch(err){ showToast("Помилка: " + err.message); }
  });

  const payment = await getValue("payment");
  document.getElementById("cPaymentTitle").value = payment.title || "";
  document.getElementById("cPaymentBody").value = payment.body || "";
  document.getElementById("savePayment").addEventListener("click", async () => {
    try{
      await saveValue("payment", { title: document.getElementById("cPaymentTitle").value, body: document.getElementById("cPaymentBody").value });
      showToast("Збережено");
    }catch(err){ showToast("Помилка: " + err.message); }
  });

  const contacts = await getValue("contacts");
  document.getElementById("cPhone").value = contacts.phone || "";
  document.getElementById("cEmail").value = contacts.email || "";
  document.getElementById("cAddress").value = contacts.address || "";
  document.getElementById("cHours").value = contacts.work_hours || "";
  document.getElementById("saveContacts").addEventListener("click", async () => {
    try{
      await saveValue("contacts", {
        ...contacts,
        phone: document.getElementById("cPhone").value,
        email: document.getElementById("cEmail").value,
        address: document.getElementById("cAddress").value,
        work_hours: document.getElementById("cHours").value,
      });
      showToast("Контакти збережено");
    }catch(err){ showToast("Помилка: " + err.message); }
  });
}
