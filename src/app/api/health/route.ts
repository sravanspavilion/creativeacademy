import { corsHeaders } from "@/lib/api/http";

/** Liveness probe: status, timestamp, uptime. */
export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "creative-academy-api",
      timestamp: new Date().toISOString(),
      uptimeSec: Math.round(process.uptime()),
    },
    { headers: corsHeaders() },
  );
}

/** CORS preflight for cross-origin clients. */
export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}