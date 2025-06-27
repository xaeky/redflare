import { createClient } from '@supabase/supabase-js';
import { Database } from '~~/types/database.types';

const runtimeConfig = useRuntimeConfig();

export const $supabase = () => {
  const supabase = createClient<Database>(runtimeConfig.supabase.base, runtimeConfig.supabase.serv);
  return supabase;
}