// Требует подключённого <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// и js/config.js, подключённых ДО этого файла.
const cfg = window.EXPOWALL_CONFIG;
export const supabase = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
export const BUCKET = cfg.STORAGE_BUCKET;
export const PAGE_SIZE = cfg.PAGE_SIZE || 12;

export function publicUrlFor(path){
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
