/**
 * CORS helper for the built-in read-only API.
 *
 * Same-origin requests (the dashboard fetching `/api/*` on its own origin)
 * never need CORS. When `NEXT_PUBLIC_API_URL` points the dashboard at this
 * API from another origin, the `CORS_ORIGINS` env var (comma-separated,
 * default `*`) controls which origins are allowed.
 */
const readOrigins = (): string | string[] => {
  const value = process.env.CORS_ORIGINS?.trim();
  if (!value) return "*";
  const origins = value.split(",").map((origin) => origin.trim()).filter(Boolean);
  return origins.length === 1 && origins[0] === "*" ? "*" : origins;
};

export function corsHeaders(): Record<string, string> {
  const origin = readOrigins();
  return {
    "Access-Control-Allow-Origin": Array.isArray(origin) ? origin.join(", ") : origin,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
  };
}

/** 400 response shaped like the NestJS ValidationPipe error the API used before. */
export function validationError(message: string): Response {
  return Response.json(
    {
      message: [message],
      error: "Bad Request",
      statusCode: 400,
    },
    { status: 400, headers: corsHeaders() },
  );
}