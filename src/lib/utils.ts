import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Canonical currency formatter for the entire app.
 *  >= RM 1,000 → comma-separated whole number (no cents).
 *  <  RM 1,000 → 2 decimal places.
 *  Always prefixed with "RM ". */
export function formatCurrency(amount: number): string {
  if (amount >= 1_000) {
    return `RM ${Math.round(amount).toLocaleString('en-MY')}`
  }
  return `RM ${amount.toFixed(2)}`
}
