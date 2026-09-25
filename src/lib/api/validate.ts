/**
 * Strict ISO-8601 check equivalent to `class-validator`'s
 * `IsISO8601({ strict: true })` (the behaviour the NestJS API used): either a
 * date-only "YYYY-MM-DD" or a full timestamp with a "Z" / offset timezone.
 */
const ISO_8601_STRICT =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/;

export function isStrictIso8601(value: string): boolean {
  if (!ISO_8601_STRICT.test(value)) return false;
  const timestamp = Number.isNaN(Date.parse(value)) ? null : new Date(value);
  return timestamp !== null && !Number.isNaN(timestamp.getTime());
}