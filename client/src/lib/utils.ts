import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  if (seconds < intervals.minute) {
    return "just now";
  }
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }
  
  return "just now";
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  const start = address.substring(0, chars + 2); // +2 for "0x"
  const end = address.substring(address.length - chars);
  return `${start}...${end}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getColorForLanguage(language: string): string {
  const colors = {
    javascript: "#f7df1e",
    typescript: "#3178c6",
    python: "#3776ab",
    go: "#00add8",
    rust: "#dea584",
    java: "#b07219",
    kotlin: "#a97bff",
    swift: "#ffac45",
    react: "#61dafb",
    vue: "#42b883",
    angular: "#dd0031",
    html: "#e34c26",
    css: "#563d7c",
    solidity: "#aa6746",
  };
  
  return (colors as Record<string, string>)[language.toLowerCase()] || "#6e7681";
}
