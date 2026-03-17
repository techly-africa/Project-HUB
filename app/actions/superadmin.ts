"use server";

import { revalidatePath } from "next/cache";
import {
  createOrg,
  updateOrg,
  deleteOrg,
  removeOrgMember,
  transferMember,
  updateOrgLicense,
} from "@/lib/superadmin-queries";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendEmail, inviteEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hub.avel.africa";

export async function createOrgAction(formData: FormData) {
  const name = formData.get("name") as string;
  const domain = formData.get("domain") as string | null;
  if (!name?.trim()) throw new Error("Name is required");
  await createOrg(name, domain || null);
  revalidatePath("/superadmin/organizations");
}

export async function updateOrgAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const domain = formData.get("domain") as string | null;
  if (!name?.trim()) throw new Error("Name is required");
  await updateOrg(id, { name: name.trim(), domain: domain?.trim() || null });
  revalidatePath("/superadmin/organizations");
  revalidatePath(`/superadmin/organizations/${id}`);
}

export async function deleteOrgAction(id: string) {
  await deleteOrg(id);
  revalidatePath("/superadmin/organizations");
}

export async function removeOrgMemberAction(profileId: string, orgId: string) {
  await removeOrgMember(profileId);
  revalidatePath(`/superadmin/organizations/${orgId}`);
}

export async function transferMemberAction(profileId: string, toOrgId: string, fromOrgId: string) {
  await transferMember(profileId, toOrgId);
  revalidatePath(`/superadmin/organizations/${fromOrgId}`);
  revalidatePath(`/superadmin/organizations/${toOrgId}`);
}

export async function inviteUserToOrgAction(orgId: string, email: string, fullName?: string) {
  const admin = createSupabaseAdminClient();

  // Invite via Supabase Auth
  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email: email.trim(),
    options: { redirectTo: `${APP_URL}/auth/callback` },
  });
  if (error) throw new Error(error.message);

  // Assign user profile to specific org
  const newUserId = data.user?.id;
  if (newUserId) {
    await admin.from("profiles").upsert({
      id: newUserId,
      email: email.trim(),
      full_name: fullName?.trim() || null,
      organization_id: orgId,
    }, { onConflict: "id" });
  }

  // Get org name for the email
  const { data: org } = await admin.from("organizations").select("name").eq("id", orgId).single();

  // Send invite email via SendGrid
  const inviteLink = data.properties?.action_link ?? APP_URL;
  await sendEmail({
    to: email,
    subject: `You've been invited to ${org?.name ?? "Project Hub"}`,
    html: inviteEmail({ orgName: org?.name ?? "Project Hub", inviteLink }),
  });

  revalidatePath(`/superadmin/organizations/${orgId}`);
  revalidatePath("/superadmin/organizations");
}

export async function resendInviteAction(email: string, orgId: string, fullName?: string) {
  // We reuse the same logic as inviting, as generateLink handles existing invitations.
  // This will trigger a new email with a fresh link.
  await inviteUserToOrgAction(orgId, email, fullName);
}

export async function updateOrgLicenseAction(orgId: string, type: 'standard' | 'freemium', days: number) {
  await updateOrgLicense(orgId, type, days);
  revalidatePath(`/superadmin/organizations/${orgId}`);
  revalidatePath("/superadmin/organizations");
}
