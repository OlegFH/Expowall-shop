import { supabase } from "./supabase-client.js";

export async function loadStaticContent(key, { titleId, bodyId }){
  const { data } = await supabase.from("site_content").select("value").eq("key", key).single();
  const v = data?.value || {};
  const titleEl = document.getElementById(titleId);
  const bodyEl = document.getElementById(bodyId);
  if(titleEl) titleEl.textContent = v.title || "";
  if(bodyEl) bodyEl.textContent = v.body || "";
  if(v.title) document.title = `${v.title} — Expowall.shop`;
}
