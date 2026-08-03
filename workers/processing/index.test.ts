import { afterEach, describe, expect, it, vi } from "vitest";
import { getWorkerConfig } from "./index.js";

const configureRequiredEnvironment = () => {
  vi.stubEnv("SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "server-only-test-value");
  vi.stubEnv("PROCESSING_WORKER_ID", "worker-test-1");
};

afterEach(() => vi.unstubAllEnvs());

describe("processing worker configuration", () => {
  it("uses bounded production defaults", () => {
    configureRequiredEnvironment();

    expect(getWorkerConfig()).toEqual({
      supabaseUrl: "https://project.supabase.co",
      serviceRoleKey: "server-only-test-value",
      workerId: "worker-test-1",
      concurrency: 1,
      pollIntervalMs: 2000,
      runOnce: false,
      idlePollsBeforeExit: 0,
    });
  });

  it("allows an explicit local Supabase HTTP endpoint", () => {
    configureRequiredEnvironment();
    vi.stubEnv("SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("PROCESSING_CONCURRENCY", "4");
    vi.stubEnv("PROCESSING_RUN_ONCE", "1");
    vi.stubEnv("PROCESSING_IDLE_POLLS_BEFORE_EXIT", "3");

    expect(getWorkerConfig()).toMatchObject({ concurrency: 4, runOnce: true, idlePollsBeforeExit: 3 });
  });

  it("rejects insecure remote endpoints and unbounded concurrency", () => {
    configureRequiredEnvironment();
    vi.stubEnv("SUPABASE_URL", "http://project.example.com");
    expect(() => getWorkerConfig()).toThrow(/HTTPS/);

    vi.stubEnv("SUPABASE_URL", "https://project.example.com");
    vi.stubEnv("PROCESSING_CONCURRENCY", "20");
    expect(() => getWorkerConfig()).toThrow(/PROCESSING_CONCURRENCY/);

    vi.stubEnv("PROCESSING_CONCURRENCY", "1");
    vi.stubEnv("PROCESSING_IDLE_POLLS_BEFORE_EXIT", "61");
    expect(() => getWorkerConfig()).toThrow(/PROCESSING_IDLE_POLLS_BEFORE_EXIT/);
  });
});
