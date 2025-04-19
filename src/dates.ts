import { TimezoneValue } from "./timezones";

export function formatDateShort(date: Date, timezone: TimezoneValue) {
  return date.toLocaleString("en-US", {
    timeZone: timezone,
    dateStyle: "short",
  });
}
