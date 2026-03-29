/**
 * Prisma @db.Time fields are read/written as Date on 1970-01-01 with the
 * time stored in UTC components (see availability POST and sessions book).
 * Always use getUTC* when formatting or comparing so patient, therapist, and
 * APIs show the same clock time regardless of server/user timezone.
 */

export function dbTimeToHHMM(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input
  if (isNaN(d.getTime())) {
    const s = String(input)
    const m = s.match(/T(\d{2}):(\d{2})/)
    return m ? `${m[1]}:${m[2]}` : "00:00"
  }
  const h = d.getUTCHours()
  const m = d.getUTCMinutes()
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

/** 12-hour label, still from UTC wall-clock (matches slot strings "09:00"). */
export function dbTimeTo12Hour(input: Date | string): string {
  const [hs, ms] = dbTimeToHHMM(input).split(":")
  const h = Number(hs)
  const m = Number(ms)
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`
}

/** Calendar date for @db.Date / ISO date-only strings without local TZ shifting the day. */
export function formatScheduledDateOnly(iso: string): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    const y = d.getUTCFullYear()
    const mo = d.getUTCMonth()
    const day = d.getUTCDate()
    return new Date(Date.UTC(y, mo, day)).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  } catch {
    return iso
  }
}

/** Single calendar day in UTC (matches sessions/book `parseDateOnly`). */
export function utcCalendarDateFromParts(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}
