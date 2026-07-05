import { vi } from "vitest";

vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
vi.stubEnv("SESSION_SECRET", "test-secret-at-least-32-chars-long!!");
vi.stubEnv("WHATSAPP_VERIFY_TOKEN", "test-verify-token");
vi.stubEnv("WHATSAPP_APP_SECRET", "test-app-secret");
vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "test-access-token");
vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "test-phone-id");
vi.stubEnv("ANTHROPIC_API_KEY", "test-anthropic-key");
