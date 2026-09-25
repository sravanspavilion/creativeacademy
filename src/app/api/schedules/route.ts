import { ScheduleService } from "@/lib/api/services";
import { corsHeaders } from "@/lib/api/http";

const scheduleService = new ScheduleService();

/** Full schedule for the current local day. */
export function GET() {
  return Response.json(scheduleService.getSchedule(), { headers: corsHeaders() });
}

/** CORS preflight for cross-origin clients. */
export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}