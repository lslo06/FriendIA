const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};

function createRequestClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    clientOptions
  );
}

const supabase = createRequestClient();

// Los inicios de sesión cambian el estado de Auth del cliente. Cada petición
// debe usar uno nuevo para no reemplazar accidentalmente la sesión de servicio.
supabase.createRequestClient = createRequestClient;

module.exports = supabase;
