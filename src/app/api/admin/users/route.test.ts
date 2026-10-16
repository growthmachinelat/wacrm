import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetRateLimitForTests } from "@/lib/rate-limit";

let signedIn = true;
let isPublisher = true;

const createUserCalls: Record<string, unknown>[] = [];
let createUserResult: {
  data: { user: { id: string; email: string; created_at: string } | null };
  error: { message: string; status?: number; code?: string } | null;
} = {
  data: {
    user: {
      id: "new-user-id",
      email: "client@example.com",
      created_at: "2026-10-16T00:00:00Z",
    },
  },
  error: null,
};

const mockProfilesList = [
  {
    id: "prof-1",
    user_id: "user-1",
    full_name: "Publisher User",
    email: "hola@growthmachine.lat",
    account_role: "owner",
    publisher: true,
    created_at: "2026-10-16T00:00:00Z",
  },
];

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () =>
        signedIn
          ? { data: { user: { id: "user-1" } }, error: null }
          : { data: { user: null }, error: { message: "No session" } },
      ),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({
            data: { id: "prof-1", publisher: isPublisher },
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(async () => ({
            data: mockProfilesList,
            error: null,
          })),
        })),
      })),
    })),
    auth: {
      admin: {
        createUser: vi.fn(async (args: Record<string, unknown>) => {
          createUserCalls.push(args);
          return createUserResult;
        }),
      },
    },
  })),
}));

const { GET, POST } = await import("./route");

beforeEach(() => {
  __resetRateLimitForTests();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-secret";
  signedIn = true;
  isPublisher = true;
  createUserCalls.length = 0;
  createUserResult = {
    data: {
      user: {
        id: "new-user-id",
        email: "client@example.com",
        created_at: "2026-10-16T00:00:00Z",
      },
    },
    error: null,
  };
});

describe("/api/admin/users authorization & validation", () => {
  it("returns 401 when caller is not authenticated", async () => {
    signedIn = false;
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 when caller is not a publisher", async () => {
    isPublisher = false;
    const getRes = await GET();
    expect(getRes.status).toBe(403);

    const postRes = await POST(
      new Request("https://app.test/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Test User",
          email: "test@example.com",
          password: "password123",
        }),
      }),
    );
    expect(postRes.status).toBe(403);
    expect(createUserCalls).toHaveLength(0);
  });

  it("lists profiles when caller has publisher === true", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users).toEqual(mockProfilesList);
  });

  it("validates email, password, and fullName on POST", async () => {
    const badPasswordRes = await POST(
      new Request("https://app.test/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Client Name",
          email: "client@example.com",
          password: "short",
        }),
      }),
    );
    expect(badPasswordRes.status).toBe(400);

    const badEmailRes = await POST(
      new Request("https://app.test/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Client Name",
          email: "not-an-email",
          password: "password123",
        }),
      }),
    );
    expect(badEmailRes.status).toBe(400);

    const emptyNameRes = await POST(
      new Request("https://app.test/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "   ",
          email: "client@example.com",
          password: "password123",
        }),
      }),
    );
    expect(emptyNameRes.status).toBe(400);
    expect(createUserCalls).toHaveLength(0);
  });

  it("creates a confirmed user via service-role admin API when publisher is authorized", async () => {
    const res = await POST(
      new Request("https://app.test/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "  Client Name  ",
          email: "  Client@Example.COM ",
          password: "StrongPassword123!",
        }),
      }),
    );

    expect(res.status).toBe(201);
    expect(createUserCalls).toEqual([
      {
        email: "client@example.com",
        password: "StrongPassword123!",
        email_confirm: true,
        user_metadata: { full_name: "Client Name" },
      },
    ]);
    const body = await res.json();
    expect(body.user.email).toBe("client@example.com");
    expect(body.user.full_name).toBe("Client Name");
  });
});
