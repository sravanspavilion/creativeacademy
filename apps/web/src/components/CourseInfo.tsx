import { GraduationCap, MapPin, UsersRound } from "lucide-react";
import type { Shift } from "@academy/shared";

/** Instructor / room / batch detail chips for a shift. */
export function CourseInfo({ shift }: { shift: Shift }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
      {shift.instructor && (
        <span className="flex items-center gap-1.5 text-sm font-medium text-white/75">
          <UsersRound className="h-4 w-4 opacity-70" aria-hidden /> {shift.instructor}
        </span>
      )}
      {shift.room && (
        <span className="flex items-center gap-1.5 text-sm font-medium text-white/75">
          <MapPin className="h-4 w-4 opacity-70" aria-hidden /> {shift.room}
        </span>
      )}
      {(shift.batchName || shift.batchStatus) && (
        <span className="flex items-center gap-1.5 text-sm font-medium text-white/75">
          <GraduationCap className="h-4 w-4 opacity-70" aria-hidden />
          {shift.batchName ?? "Batch"}
          {shift.batchStatus ? ` · ${shift.batchStatus}` : ""}
        </span>
      )}
    </div>
  );
}