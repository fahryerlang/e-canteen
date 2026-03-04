import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function pickupTimeLabel(pickupTime: string): string {
  switch (pickupTime) {
    case "ISTIRAHAT_1":
      return "Istirahat 1"
    case "ISTIRAHAT_2":
      return "Istirahat 2"
    default:
      return pickupTime
  }
}

export function orderStatusLabel(status: string): string {
  switch (status) {
    case "DIPROSES":
      return "Sedang Disiapkan"
    case "SIAP_DIAMBIL":
      return "Siap Diambil"
    case "SELESAI":
      return "Selesai"
    case "DIBATALKAN":
      return "Dibatalkan"
    default:
      return status
  }
}

export function orderStatusColor(status: string): string {
  switch (status) {
    case "DIPROSES":
      return "bg-amber-100 text-amber-700"
    case "SIAP_DIAMBIL":
      return "bg-blue-100 text-blue-700"
    case "SELESAI":
      return "bg-green-100 text-green-700"
    case "DIBATALKAN":
      return "bg-red-100 text-red-700"
    default:
      return "bg-stone-100 text-stone-600"
  }
}
