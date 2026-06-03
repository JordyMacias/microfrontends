// Stub básico para Supabase - Se puede configurar con las credenciales reales si es necesario
// Por ahora solo exporta un objeto vacío para evitar errores

export const supabase = {
  auth: {
    signInWithPassword: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
  },
  from: () => ({
    select: () => ({
      order: () => ({ data: [], error: null }),
      eq: () => ({ single: () => ({ data: null, error: null }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
      update: () => ({ eq: () => ({ error: null }) }),
      upsert: () => ({ error: null }),
      delete: () => ({ eq: () => ({ error: null }) }),
    }),
  }),
} as any;
