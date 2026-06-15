import { NextResponse } from "next/server";

/**
 * GET /api/health — server health check. No auth.
 * Spec: docs/README.md. The first proof the server runs (ROADMAP.md W14).
 */
export function GET() {
  return NextResponse.json({ status: "ok" });
}
