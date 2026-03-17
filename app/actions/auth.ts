"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendEmail, passwordResetEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hub.avel.africa";

/**
 * Handles the "Forgot Password" request.
 * Generates a recovery link and sends it via SendGrid.
 */
export async function forgotPasswordAction(email: string) {
  const admin = createSupabaseAdminClient();

  // We use generateLink with type 'recovery' to get the action link
  // and send it manually via SendGrid as requested.
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: email.trim(),
    options: { 
      redirectTo: `${APP_URL}/auth/callback?next=/reset-password` 
    },
  });

  if (error) {
    // We don't throw for "user not found" to prevent email enumeration,
    // but we log it for debugging.
    console.error("[auth] reset error:", error.message);
    return { success: true }; // Return success anyway to the UI
  }

  const resetLink = data.properties?.action_link ?? APP_URL;
  
  // Try to find the user's name for a personalized email
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", data.user?.id)
    .single();

  await sendEmail({
    to: email,
    subject: "Reset your Project Hub password",
    html: passwordResetEmail({ 
      recipientName: profile?.full_name || email, 
      resetLink 
    }),
  });

  return { success: true };
}
