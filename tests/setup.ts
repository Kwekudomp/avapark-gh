import { vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
vi.stubEnv("WHATSAPP_VERIFY_TOKEN", "test-verify-token");
vi.stubEnv("WHATSAPP_APP_SECRET", "test-app-secret");
vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "test-access-token");
vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "test-phone-id");
vi.stubEnv("ANTHROPIC_API_KEY", "test-anthropic-key");
