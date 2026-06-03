import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qdhainwlrqfjaxuduhak.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkaGFpbndscnFmamF4dWR1aGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDI4MTksImV4cCI6MjA3ODY3ODgxOX0.Q-LbIx4xPARWo_EWZiSPNeFDnKSDwDZXhm8Rsx2b3e8';

// Validar configuración
if (!supabaseUrl || supabaseUrl === '' || supabaseUrl.includes('your-project') || supabaseUrl.includes('tu-proyecto')) {
  console.error('⚠️ VITE_SUPABASE_URL no está configurado correctamente. Por favor actualiza el archivo .env.local con tus credenciales reales de Supabase.');
  console.error('📝 Ve a https://supabase.com/dashboard y obtén tus credenciales en Settings > API');
}

if (!supabaseAnonKey || supabaseAnonKey === '' || supabaseAnonKey.includes('your-anon-key') || supabaseAnonKey.includes('tu-anon-key')) {
  console.error('⚠️ VITE_SUPABASE_ANON_KEY no está configurado correctamente. Por favor actualiza el archivo .env.local con tus credenciales reales de Supabase.');
  console.error('📝 Ve a https://supabase.com/dashboard y obtén tus credenciales en Settings > API');
}

// Crear cliente de Supabase con opciones de reintento
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Función para verificar conexión
export const verificarConexionSupabase = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('usuarios').select('count').limit(1);
    if (error && error.message.includes('Failed to fetch')) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error al verificar conexión con Supabase:', error);
    return false;
  }
};

export default supabase;
