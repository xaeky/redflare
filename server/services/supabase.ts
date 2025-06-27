import { createClient } from '@supabase/supabase-js';

const runtimeConfig = useRuntimeConfig();

export const $supabase = () => {
  const supabase = createClient(runtimeConfig.supabase.base, runtimeConfig.supabase.serv);
  return supabase;
}