import "server-only";
import { createClient } from "@supabase/supabase-js";
// Servidor apenas (sem autenticação no MVP). Nunca importe em componentes client.
export const db = () =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
