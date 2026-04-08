import { format,differenceInDays,formatDistanceToNow } from "date-fns";

export function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(new Date(dateStr), "MMM d, yyyy HH:mm");
  } catch {
    return dateStr;
  }
}


export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
    });
  } catch {
    return dateStr;
  }
}


export function daysUntil(dateStr: string): number {
  return differenceInDays(new Date(dateStr), new Date());
}