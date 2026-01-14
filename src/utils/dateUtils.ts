import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface UTCRange {
  startUTC: string;
  endUTC: string;
}

export function getDayUTCRange(
  dateString: string,
  userTimezone: string
): UTCRange {
  const startLocal = dayjs.tz(dateString, userTimezone).startOf("day");
  const endLocal = startLocal.add(1, "day");

  const startUTC = startLocal.toISOString();
  const endUTC = endLocal.toISOString();

  return { startUTC, endUTC };
}
