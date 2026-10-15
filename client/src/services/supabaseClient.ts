import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://bytmvqvydxealupmvlme.supabase.co';

const SUPABASE_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_xnG6KZJgB4jiRhMgyxSUFA_NbSPfsjX';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});

/**
 * Verifica a conectividade com o Supabase e se as tabelas já foram criadas.
 */
export async function checkSupabaseHealth(): Promise<{ online: boolean; tablesCreated: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('devices').select('id').limit(1);
    if (!error) {
      return { online: true, tablesCreated: true };
    }
    // Erro PGRST205 significa que a tabela ainda não foi criada no banco
    if (error.code === 'PGRST205') {
      return { online: true, tablesCreated: false, error: 'Tabelas ainda não criadas no schema public' };
    }
    return { online: true, tablesCreated: false, error: error.message };
  } catch (err: any) {
    return { online: false, tablesCreated: false, error: err.message };
  }
}
