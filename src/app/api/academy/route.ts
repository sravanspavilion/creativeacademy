import { AcademyService } from "@/lib/api/services";
import { corsHeaders } from "@/lib/api/http";

const academyService = new AcademyService();

/** Academy branding + the full daily schedule for the live display. */
export function GET() {
  return Response.json(academyService.getAcademy(), { headers: corsHeaders() });
}

/** CORS preflight for cross-origin clients. */
export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}