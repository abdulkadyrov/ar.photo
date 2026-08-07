import { z } from "zod";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { assertDemoRuntimeEnabled } from "../../shared/config/env";

const profileSchema = z
  .object({
    id: z.string().min(1),
    full_name: z.string().nullable(),
    email_display: z.string().nullable(),
    avatar_path: z.string().nullable(),
    role: z.enum(["superadmin", "account_user"]),
    is_active: z.boolean(),
  })
  .strict();

export type UserProfile = z.infer<typeof profileSchema>;

export interface ProfileRepository {
  getProfile(userId: string): Promise<UserProfile>;
  updateName(userId: string, fullName: string): Promise<UserProfile>;
}

type SupabaseBrowserClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly client: SupabaseBrowserClient) {}

  async getProfile(userId: string) {
    const { data, error } = await this.client
      .from("profiles")
      .select("id,full_name,email_display,avatar_path,role,is_active")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Профиль не найден");
    return profileSchema.parse(data);
  }

  async updateName(userId: string, rawFullName: string) {
    const fullName = rawFullName.trim();
    if (fullName.length < 1 || fullName.length > 120) throw new Error("Введите имя длиной до 120 символов");
    const { data, error } = await this.client
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId)
      .select("id,full_name,email_display,avatar_path,role,is_active")
      .single();
    if (error) throw new Error(error.message);
    return profileSchema.parse(data);
  }
}

const demoProfileKey = "ar-photo-demo-profile-v1";

class DemoProfileRepository implements ProfileRepository {
  async getProfile(userId: string) {
    const stored = readDemoProfile();
    if (stored?.id === userId) return stored;
    return {
      id: userId,
      full_name: null,
      email_display: null,
      avatar_path: null,
      role: "account_user" as const,
      is_active: true,
    };
  }

  async updateName(userId: string, rawFullName: string) {
    const fullName = rawFullName.trim();
    if (fullName.length < 1 || fullName.length > 120) throw new Error("Введите имя длиной до 120 символов");
    const updated = { ...(await this.getProfile(userId)), full_name: fullName };
    window.localStorage.setItem(demoProfileKey, JSON.stringify(updated));
    return updated;
  }
}

function readDemoProfile() {
  const raw = window.localStorage.getItem(demoProfileKey);
  if (!raw) return null;
  try {
    const parsed = profileSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
  } catch {
    // A stale or manually edited demo record must not break the profile page.
  }
  window.localStorage.removeItem(demoProfileKey);
  return null;
}

let repository: ProfileRepository | undefined;

export function getProfileRepository() {
  if (repository) return repository;
  const client = getSupabaseBrowserClient();
  if (client) repository = new SupabaseProfileRepository(client);
  else {
    assertDemoRuntimeEnabled();
    repository = new DemoProfileRepository();
  }
  return repository;
}

export function setProfileRepositoryForTests(nextRepository?: ProfileRepository) {
  repository = nextRepository;
}
