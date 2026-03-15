"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendEmail, inviteEmail, passwordResetEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rukisha.co.rw";

// ─── Invite a new user ────────────────────────────────────────────────────────

export async function inviteUserAction(email: string, fullName?: string) {
  const sb    = createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  // Get current user's org
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Auth required");

  const { data: profile } = await sb.from("profiles").select("organization_id").eq("id", user.id).single();
  if (!profile?.organization_id) throw new Error("No organization found");

  // Invite via Supabase Auth
  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo: `${APP_URL}/auth/callback` },
  });
  if (error) throw new Error(error.message);

  // Assign user profile to same org and set name if provided
  const newUserId = data.user?.id;
  if (newUserId) {
    await admin.from("profiles").upsert({
      id: newUserId,
      email,
      full_name: fullName?.trim() || null,
      organization_id: profile.organization_id,
    }, { onConflict: "id" });
  }

  // Get org name for the email
  const { data: org } = await sb.from("organizations").select("name").single();

  // Send invite email via SendGrid
  const inviteLink = data.properties?.action_link ?? APP_URL;
  await sendEmail({
    to: email,
    subject: `You've been invited to ${org?.name ?? "Rukisha"}`,
    html: inviteEmail({ orgName: org?.name ?? "Rukisha", inviteLink }),
  });
  revalidatePath("/settings");
}

// ─── Update a member's name ───────────────────────────────────────────────────

export async function updateMemberNameAction(memberId: string, fullName: string) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("profiles")
    .update({ full_name: fullName.trim() || null })
    .eq("id", memberId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

// ─── Send password reset ──────────────────────────────────────────────────────

export async function resetUserPasswordAction(userId: string, userEmail: string, userName: string) {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: userEmail,
    options: { redirectTo: `${APP_URL}/auth/callback` },
  });
  if (error) throw new Error(error.message);

  const resetLink = data.properties?.action_link ?? APP_URL;
  await sendEmail({
    to: userEmail,
    subject: "Reset your Rukisha password",
    html: passwordResetEmail({ recipientName: userName || userEmail, resetLink }),
  });
}

// ─── Delete a user ────────────────────────────────────────────────────────────

export async function deleteUserAction(userId: string) {
  // Prevent self-deletion
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Auth required");
  if (user.id === userId) throw new Error("You cannot delete your own account");

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}
