import { supabase, BUCKET } from "../../js/supabase-client.js";

export async function uploadImage(file, folder = "uploads"){
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if(error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteImageByUrl(url){
  try{
    const marker = `/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if(idx === -1) return;
    const path = url.slice(idx + marker.length);
    await supabase.storage.from(BUCKET).remove([path]);
  }catch(e){ /* не критично, если не удалось удалить файл из storage */ }
}
