export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));
}

export function pickupTimeLabel(pt: string): string {
  switch (pt) {
    case "ISTIRAHAT_1":
      return "Istirahat 1";
    case "ISTIRAHAT_2":
      return "Istirahat 2";
    default:
      return pt;
  }
}

export function orderStatusLabel(status: string): string {
  switch (status) {
    case "DIPROSES":
      return "Sedang Disiapkan";
    case "SIAP_DIAMBIL":
      return "Siap Diambil";
    case "SELESAI":
      return "Selesai";
    default:
      return status;
  }
}

export function orderStatusColor(status: string): string {
  switch (status) {
    case "DIPROSES":
      return "bg-yellow-100 text-yellow-800";
    case "SIAP_DIAMBIL":
      return "bg-blue-100 text-blue-800";
    case "SELESAI":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
