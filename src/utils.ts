import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate initials from a name
 * @param name - The name to generate initials from
 * @param fallback - The fallback character if no name is provided
 * @param maxLength - Maximum number of characters to return
 * @returns The initials in uppercase
 */
export function getInitials(
  name?: string | null,
  fallback = "U",
  maxLength = 2
): string {
  if (!name) return fallback;

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, maxLength);
}
