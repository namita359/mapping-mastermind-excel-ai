
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUniqueId(): string {
  // Generate a random ID with timestamp to ensure uniqueness
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`
}
