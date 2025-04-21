import { Timezone } from "./timezones";

export function formatDateShort(date: Date, timezone: Timezone) {
  return date.toLocaleString("en-US", {
    timeZone: timezone,
    dateStyle: "short",
  });
}
