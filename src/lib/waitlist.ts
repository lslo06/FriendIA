import { supabase } from "./supabase";

export async function joinMobileWaitlist(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  const { error } = await supabase
    .from("mobile_waitlist")
    .insert({ email: normalizedEmail, source: "landing" });

  // Si el correo ya estaba registrado, el resultado para la persona es el mismo.
  if (error && error.code !== "23505") {
    throw new Error("No pudimos registrar tu correo. Intenta de nuevo.");
  }
}
