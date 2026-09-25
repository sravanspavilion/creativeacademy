import { CoursesService } from "@/lib/api/services";
import { corsHeaders } from "@/lib/api/http";

const coursesService = new CoursesService();

/** Course catalogue. */
export function GET() {
  return Response.json(coursesService.getCourses(), { headers: corsHeaders() });
}

/** CORS preflight for cross-origin clients. */
export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}