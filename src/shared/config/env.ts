import { z } from "zod";

const publicRuntimeConfigSchema = z
  .object({
    VITE_SUPABASE_URL: z.string().url().optional(),
    VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(20).optional(),
    VITE_PUBLIC_APP_URL: z.string().url().optional(),
    VITE_ENABLE_DEMO_MODE: z.enum(["true", "false"]).default("false"),
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

    if (hasUrl && value.VITE_ENABLE_DEMO_MODE === "true") {
      context.addIssue({
        code: "custom",
        path: ["VITE_ENABLE_DEMO_MODE"],
        message: "Demo mode and Supabase configuration are mutually exclusive",
      });
    }
  });

export type PublicRuntimeConfig = {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
  publicAppUrl?: string;
  authMode: "supabase" | "demo" | "unconfigured";
};

export function parsePublicRuntimeConfig(input: Record<string, unknown>): PublicRuntimeConfig {
  const parsed = publicRuntimeConfigSchema.parse({
    VITE_SUPABASE_URL: emptyToUndefined(input.VITE_SUPABASE_URL),
    VITE_SUPABASE_PUBLISHABLE_KEY: emptyToUndefined(input.VITE_SUPABASE_PUBLISHABLE_KEY),
    VITE_PUBLIC_APP_URL: emptyToUndefined(input.VITE_PUBLIC_APP_URL),
    VITE_ENABLE_DEMO_MODE: emptyToUndefined(input.VITE_ENABLE_DEMO_MODE),
  });

  return {
    supabaseUrl: parsed.VITE_SUPABASE_URL,
    supabasePublishableKey: parsed.VITE_SUPABASE_PUBLISHABLE_KEY,
    publicAppUrl: parsed.VITE_PUBLIC_APP_URL,
    authMode: parsed.VITE_SUPABASE_URL ? "supabase" : parsed.VITE_ENABLE_DEMO_MODE === "true" ? "demo" : "unconfigured",
  };
}

let runtimeConfig: PublicRuntimeConfig | undefined;

export function getPublicRuntimeConfig() {
  runtimeConfig ??= parsePublicRuntimeConfig(import.meta.env);
  return runtimeConfig;
}

export function assertDemoRuntimeEnabled(config = getPublicRuntimeConfig()) {
  if (config.authMode !== "demo") {
    throw new Error("AR Photo backend is not configured and demo mode is disabled");
  }
}

function emptyToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
