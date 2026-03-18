

import { createSupabaseAdminClient } from "./supabase-admin";
import { createSupabaseServerClient } from "./supabase-server";
import crypto from "crypto";

// ─── Auth guard ───────────────────────────────────────────────────────────────

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("is_superadmin")
    .eq("id", userId)
    .single();
  return data?.is_superadmin === true;
}

/** Throws if caller is not a superadmin. Call at top of every server action. */
export async function requireSuperAdmin(): Promise<string> {
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Unauthenticated");
  const ok = await isSuperAdmin(user.id);
  if (!ok) throw new Error("Forbidden: superadmin only");
  return user.id;
}

// ─── Organization management ─────────────────────────────────────────────────

export interface OrgWithStats {
  id: string;
  name: string;
  domain: string | null;
  created_at: string;
  member_count: number;
  project_count: number;
  license_key: string | null;
  license_type: 'standard' | 'freemium';
  license_expires_at: string | null;
}

export async function listAllOrgs(): Promise<OrgWithStats[]> {
  await requireSuperAdmin();
  const admin = createSupabaseAdminClient();

  const { data: orgs, error } = await admin
    .from("organizations")
    .select("id, name, domain, created_at, license_key, license_type, license_expires_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  // Batch member and project counts
  const orgIds = (orgs ?? []).map((o: { id: string }) => o.id);
  if (!orgIds.length) return [];

  const [{ data: members }, { data: projects }] = await Promise.all([
    admin.from("profiles").select("organization_id").in("organization_id", orgIds),
    admin.from("projects").select("organization_id").in("organization_id", orgIds),
  ]);

  const memberCountMap = (members ?? []).reduce((acc: Record<string, number>, p: { organization_id: string | null }) => {
    if (p.organization_id) {
      acc[p.organization_id] = (acc[p.organization_id] || 0) + 1;
    }
    return acc;
  }, {});

  const projectCountMap = (projects ?? []).reduce((acc: Record<string, number>, p: { organization_id: string }) => {
    acc[p.organization_id] = (acc[p.organization_id] || 0) + 1;
    return acc;
  }, {});

  return (orgs ?? []).map((o: {
    id: string;
    name: string;
    domain: string | null;
    created_at: string;
    license_key: string | null;
    license_type: 'standard' | 'freemium';
    license_expires_at: string | null;
  }) => ({
    ...o,
    member_count: memberCountMap[o.id] || 0,
    project_count: projectCountMap[o.id] || 0,
  }));
}

export async function createOrg(name: string, domain: string | null): Promise<void> {
  await requireSuperAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("organizations").insert({
    name: name.trim(),
    domain: domain?.trim() || null,
  });
  if (error) throw new Error(error.message);
}

export async function updateOrg(
  id: string,
  fields: { name?: string; domain?: string | null }
): Promise<void> {
  await requireSuperAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("organizations").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteOrg(id: string): Promise<void> {
  await requireSuperAdmin();
  const admin = createSupabaseAdminClient();
  // Nullify members' org assignment before deleting so FK doesn't error.
  // (profiles.organization_id has no CASCADE — intentional to avoid mass-logout)
  await admin
    .from("profiles")
    .update({ organization_id: null })
    .eq("organization_id", id);
  const { error } = await admin.from("organizations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateOrgLicense(
  orgId: string, 
  type: 'standard' | 'freemium', 
  days: number
): Promise<void> {
  await requireSuperAdmin();
  const admin = createSupabaseAdminClient();
  
  // Calculate expiry: starting from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const { error } = await admin
    .from("organizations")
    .update({
      license_type: type,
      license_expires_at: expiresAt.toISOString(),
      license_key: crypto.randomUUID(), // Issue fresh key on renewal/change
    })
    .eq("id", orgId);
    
  if (error) throw new Error(error.message);
}

// ─── Member management ────────────────────────────────────────────────────────

export interface OrgMember {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_superadmin: boolean;
}

export async function listOrgMembers(orgId: string): Promise<OrgMember[]> {
  await requireSuperAdmin();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, email, full_name, avatar_url, is_superadmin")
    .eq("organization_id", orgId)
    .order("email");
  if (error) throw new Error(error.message);
  return (data ?? []) as OrgMember[];
}

export async function removeOrgMember(profileId: string): Promise<void> {
  await requireSuperAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ organization_id: null })
    .eq("id", profileId);
  if (error) throw new Error(error.message);
}

export async function transferMember(profileId: string, toOrgId: string): Promise<void> {
  await requireSuperAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ organization_id: toOrgId })
    .eq("id", profileId);
  if (error) throw new Error(error.message);
}

// ─── Global stats for dashboard ───────────────────────────────────────────────

export interface GlobalStats {
  total_orgs: number;
  total_users: number;
  total_projects: number;
}

export async function getGlobalStats(): Promise<GlobalStats> {
  await requireSuperAdmin();
  const admin = createSupabaseAdminClient();
  const [
    { count: total_orgs },
    { count: total_users },
    { count: total_projects },
  ] = await Promise.all([
    admin.from("organizations").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("projects").select("id", { count: "exact", head: true }),
  ]);
  return {
    total_orgs: total_orgs ?? 0,
    total_users: total_users ?? 0,
    total_projects: total_projects ?? 0,
  };
}
