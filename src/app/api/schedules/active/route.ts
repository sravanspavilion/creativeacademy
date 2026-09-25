import { ScheduleService } from "@/lib/api/services";
import { corsHeaders, validationError } from "@/lib/api/http";
import { isStrictIso8601 } from "@/lib/api/validate";

const scheduleService = new ScheduleService();

/**
 * Live evaluation of the shift at the given instant (server local time).
 * Omit `at` to evaluate "now". `at` must be an ISO-8601 timestamp.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const at = url.searchParams.get("at");

  if (at !== null && !isStrictIso8601(at)) {
    return validationError("at must be an ISO-8601 timestamp");
  }

  return Response.json(
    scheduleService.getActive(at ?? undefined),
    { headers: corsHeaders() },
  );
}

/** CORS preflight for cross-origin clients. */
export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}