// ============================================================
// GET & POST /api/admin/users — Publisher-only user/account management
//
// Security model:
//   - Authenticates caller via server-side Supabase session cookies.
//   - Authorizes strictly against `public.profiles.publisher === true`.
//   - Rate-limited via `RATE_LIMITS.adminAction`.
//   - Validates `email`, `password`, and `fullName` against strict
//     type, length, and format rules; never logs plaintext passwords.
//   - Uses the service-role Supabase admin API (`auth.admin.createUser`)
//     with `email_confirm: true` so the `on_auth_user_created` database
//     trigger (`047_publisher_role.sql`) atomically provisions the new
//     user's personal account and profile row.
// ============================================================

import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MAX_FULL_NAME_LENGTH = 120;

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service-role configuration");
  }
  return createServiceClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function authorizePublisher() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, publisher")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || profile?.publisher !== true) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true as const, userId: user.id };
}

export async function GET() {
  const auth = await authorizePublisher();
  if (!auth.ok) return auth.response;

  const limit = checkRateLimit(
    `adminUsers:get:${auth.userId}`,
    RATE_LIMITS.adminAction,
  );
  if (!limit.success) return rateLimitResponse(limit);

  try {
    const supabaseAdmin = getServiceRoleClient();
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, user_id, full_name, email, account_role, publisher, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[GET /api/admin/users] Failed to fetch profiles:", {
        code: error.code,
        message: error.message,
      });
      return NextResponse.json(
        { error: "Failed to load users" },
        { status: 500 },
      );
    }

    return NextResponse.json({ users: data ?? [] });
  } catch (err) {
    console.error(
      "[GET /api/admin/users] Unexpected error:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await authorizePublisher();
  if (!auth.ok) return auth.response;

  const limit = checkRateLimit(
    `adminUsers:post:${auth.userId}`,
    RATE_LIMITS.adminAction,
  );
  if (!limit.success) return rateLimitResponse(limit);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const raw = body as Record<string, unknown>;
  const rawEmail = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const rawPassword = typeof raw.password === "string" ? raw.password : "";
  const rawFullName = typeof raw.fullName === "string" ? raw.fullName.trim() : "";

  if (!rawFullName || rawFullName.length > MAX_FULL_NAME_LENGTH) {
    return NextResponse.json(
      {
        error: `Full name is required and must be at most ${MAX_FULL_NAME_LENGTH} characters`,
      },
      { status: 400 },
    );
  }

  if (
    !rawEmail ||
    rawEmail.length > MAX_EMAIL_LENGTH ||
    !EMAIL_REGEX.test(rawEmail)
  ) {
    return NextResponse.json(
      { error: "A valid email address is required" },
      { status: 400 },
    );
  }

  // TODO(security): Consider adding leaked-password detection (e.g., HIBP k-anonymity check) and MFA enforcement for created accounts.
  if (
    rawPassword.length < MIN_PASSWORD_LENGTH ||
    rawPassword.length > MAX_PASSWORD_LENGTH
  ) {
    return NextResponse.json(
      {
        error: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
      },
      { status: 400 },
    );
  }

  try {
    const supabaseAdmin = getServiceRoleClient();
    const { data: created, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: rawEmail,
        password: rawPassword,
        email_confirm: true,
        user_metadata: { full_name: rawFullName },
      });

    if (createError || !created?.user) {
      console.error("[POST /api/admin/users] createUser failed:", {
        status: createError?.status,
        code: createError?.code,
      });
      return NextResponse.json(
        { error: createError?.message || "Failed to create user" },
        { status: createError?.status && createError.status >= 400 && createError.status < 500 ? createError.status : 400 },
      );
    }

    return NextResponse.json(
      {
        user: {
          id: created.user.id,
          email: created.user.email ?? rawEmail,
          full_name: rawFullName,
          created_at: created.user.created_at,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(
      "[POST /api/admin/users] Unexpected error:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
