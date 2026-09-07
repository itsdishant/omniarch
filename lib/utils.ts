import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function toDate(value: Date | string | number) {
  return value instanceof Date ? value : new Date(value);
}

export function formatClock(value: Date | string | number) {
  return toDate(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(value: Date | string | number) {
  const date = toDate(value);
  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${dateLabel}, ${formatClock(date)}`;
}

export function formatChatDayLabel(value: Date | string | number) {
  const date = toDate(value);
  const today = startOfLocalDay(new Date());
  const day = startOfLocalDay(date);

  if (day === today) {
    return "Today";
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (day === startOfLocalDay(yesterday)) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function isSameLocalDay(
  left: Date | string | number,
  right: Date | string | number,
) {
  return startOfLocalDay(toDate(left)) === startOfLocalDay(toDate(right));
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
