import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'high':
    case 'urgent':
      return 'border-danger bg-danger/10 text-danger'
    case 'medium':
    case 'soon':
      return 'border-warning bg-warning/10 text-warning'
    default:
      return 'border-success bg-success/10 text-success'
  }
}

export function getUrgencyBadgeColor(urgency: string): string {
  switch (urgency) {
    case 'high':
    case 'urgent':
      return 'bg-danger text-white'
    case 'medium':
    case 'soon':
      return 'bg-warning text-white'
    default:
      return 'bg-success text-white'
  }
}

export function getUrgencyLabel(urgency: string): string {
  switch (urgency) {
    case 'high':
    case 'urgent':
      return 'Urgent'
    case 'medium':
    case 'soon':
      return 'Soon'
    default:
      return 'Routine'
  }
}
