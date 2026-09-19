import QRCode from "qrcode";
import { toRupees } from "./calc";

export const UPI = {
  id: "7000051042@ybl",
  payeeName: "Mihir Sound and Light",
} as const;

/** UPI deep link for the outstanding balance; opens any UPI app on a phone. */
export function upiPayload(balancePaise: number, reference: string) {
  const params = new URLSearchParams({
    pa: UPI.id,
    pn: UPI.payeeName,
    am: toRupees(balancePaise).toFixed(2),
    cu: "INR",
    tn: reference.slice(0, 50),
  });
  return `upi://pay?${params.toString()}`;
}

/** PNG data URL of the UPI QR. Generated server-side; safe to embed in HTML and PDF. */
export async function upiQrDataUrl(balancePaise: number, reference: string): Promise<string> {
  return QRCode.toDataURL(upiPayload(balancePaise, reference), {
    width: 320,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0b0c10", light: "#ffffff" },
  });
}
