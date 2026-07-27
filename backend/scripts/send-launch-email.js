require("dotenv").config();
const supabase = require("../src/db");

const shouldSend = process.argv.includes("--send");
const required = [
  "RESEND_API_KEY",
  "LAUNCH_FROM_EMAIL",
  "APP_RELEASE_URL",
];

function requireConfiguration() {
  const missing = required.filter(name => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Faltan variables: ${missing.join(", ")}`);
  }
}

async function sendEmail(email) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.LAUNCH_FROM_EMAIL.trim(),
      to: [email],
      subject: "FriendIA ya está disponible",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#172033">
          <h1 style="color:#5B88B2">FriendIA ya está disponible</h1>
          <p>Gracias por pedirnos que te avisáramos. Ya puedes conocer la nueva versión de FriendIA.</p>
          <p>
            <a href="${process.env.APP_RELEASE_URL.trim()}"
               style="display:inline-block;background:#5B88B2;color:white;text-decoration:none;padding:12px 20px;border-radius:10px">
              Abrir FriendIA
            </a>
          </p>
          <p style="font-size:12px;color:#64748B">
            Recibiste este único aviso porque registraste este correo en la lista de lanzamiento.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend respondió ${response.status}: ${body}`);
  }
}

async function main() {
  const { data, error } = await supabase
    .from("mobile_waitlist")
    .select("id,email")
    .is("notified_at", null)
    .order("created_at", { ascending: true });

  if (error) throw error;

  console.log(`${data.length} correo(s) pendientes.`);
  if (!shouldSend) {
    console.log("Vista previa solamente. Ejecuta npm run notify:launch -- --send para enviar.");
    return;
  }

  requireConfiguration();

  let sent = 0;
  for (const entry of data) {
    try {
      await sendEmail(entry.email);
      const { error: updateError } = await supabase
        .from("mobile_waitlist")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", entry.id);
      if (updateError) throw updateError;
      sent += 1;
      console.log(`Enviado ${sent}/${data.length}`);
    } catch (error) {
      console.error(`No se pudo enviar a un registro: ${error.message}`);
    }
  }

  console.log(`Proceso terminado: ${sent}/${data.length} enviados.`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
