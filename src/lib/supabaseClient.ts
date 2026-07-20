import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Esto es lo que usaremos para autenticación básica
export const supabase = createClient(supabaseUrl, supabaseAnonKey);