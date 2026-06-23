import { supabase } from "../../js/supabase-client.js";

export async function login(email, password){
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if(error) throw error;
  return data;
}

export async function logout(){
  await supabase.auth.signOut();
}

export async function getSession(){
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(cb){
  supabase.auth.onAuthStateChange((_event, session) => cb(session));
}
