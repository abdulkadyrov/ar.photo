import { z } from "zod";

const publicRuntimeConfigSchema = z
  .object({
    VITE_SUPABASE_URL: z.string().url().optional(),
    VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(20).optional(),
    VITE_PUBLIC_APP_URL: z.string().url().optional(),
  })
  .superRefine((value, context) => {
    const hasUrl = Boolean(value.VITE_SUPABASE_URL);
    const hasKey = Boolean(value.VITE_SUPABASE_PUBLISHABLE_KEY);

    if (hasUrl !== hasKey) {
      context.addIssue({
        code: "custom",
        message: "VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be configured together",
      });
    }

    if (value.VITE_SUPABASE_PUBLISHABLE_KEY?.startsWith("sb_secret_")) {
      context.addIssue({
        code: "custom",
        path: ["VITE_SUPABASE_PUBLISHABLE_KEY"],
        message: "A Supabase secret key must never be exposed to the browser",
      });
    }
  });

export type PublicRuntimeConfig = {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
  publicAppUrl?: string;
  authMode: "supabase" | "demo";
};

export function parsePublicRuntimeConfig(input: Record<string, unknown>): PublicRuntimeConfig {
  const parsed = publicRuntimeConfigSchema.parse({
    VITE_SUPABASE_URL: emptyToUndefined(input.VITE_SUPABASE_URL),
    VITE_SUPABASE_PUBLISHABLE_KEY: emptyToUndefined(input.VITE_SUPABASE_PUBLISHABLE_KEY),
    VITE_PUBLIC_APP_URL: emptyToUndefined(input.VITE_PUBLIC_APP_URL),
  });

  return {
    supabaseUrl: parsed.VITE_SUPABASE_URL,
    supabasePublishableKey: parsed.VITE_SUPABASE_PUBLISHABLE_KEY,
    publicAppUrl: parsed.VITE_PUBLIC_APP_URL,
    authMode: parsed.VITE_SUPABASE_URL ? "supabase" : "demo",
  };
}

let runtimeConfig: PublicRuntimeConfig | undefined;

export function getPublicRuntimeConfig() {
  runtimeConfig ??= parsePublicRuntimeConfig(import.meta.env);
  return runtimeConfig;
}

function emptyToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
