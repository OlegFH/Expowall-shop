import { supabase } from "./supabase-client.js";
import { escapeHtml } from "./utils.js";

async function load(){
  const { data } = await supabase.from("site_content").select("value").eq("key","contacts").single();
  const c = data?.value || {};
  document.getElementById("contactPhone").textContent = c.phone || "";
  document.getElementById("contactPhone").href = `tel:${(c.phone||"").replace(/[^+\d]/g,"")}`;
  document.getElementById("contactEmail").textContent = c.email || "";
  document.getElementById("contactEmail").href = `mailto:${c.email || ""}`;
  document.getElementById("contactAddress").textContent = c.address || "";
  document.getElementById("contactHours").textContent = c.work_hours || "";

  const social = document.getElementById("contactSocial");
  social.innerHTML = (c.social || []).map(s =>
    `<a class="btn btn-ghost btn-sm" href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>`
  ).join("");
}
load();
