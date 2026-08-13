// Care AI — Urgency Detector
// 3-level: green (aman), yellow (hati2), red (darurat)

export type UrgencyLevel = 'green' | 'yellow' | 'red'

export type UrgencyResult = {
  level: UrgencyLevel
  message: string
  shouldEndChat: boolean
}

const RED_PATTERNS = [
  /bunuh\s*diri/i,
  /suicid/i,
  /mau\s*mati/i,
  /mengakhiri\s*(hidup|semuanya)/i,
  /gak\s*peng[ea]n\s*hidup/i,
  /mati\s*aja/i,
  /selesai[n]?\s*(udah|aja|gitu)/i,
  /nyakit[i]n\s*diri/i,
  /self\s*harm/i,
  /sayat\s*tangan/i,
  /minum\s*obat\s*(banyak|semua|sekalian)/i,
]

const YELLOW_PATTERNS = [
  /gak\s*kuat/i,
  /capek\s*banget/i,
  /gak\s*ada\s*harapan/i,
  /gak\s*tau\s*mau\s*gimana/i,
  /nyerah\s*(aja|udah)/i,
  /sendirian\s*terus/i,
  /gak\s*berguna/i,
  /gak\s*diinginkan/i,
  /semua\s*serba\s*salah/i,
]

export function detectUrgency(text: string): UrgencyResult {
  // Check RED first (highest priority)
  for (const pattern of RED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        level: 'red',
        message: "Kak, aku dengerin. Ini berat banget. Aku bukan orang yang tepat buat bantu ini. Tapi aku tau siapa yang bisa.\n\nIni nomor yang bisa kamu hubungi SEKARANG: Hotline Kesehatan Jiwa Kemenkes 021-500-454, atau GRATIS 119 ext 8. Mereka 24 jam.\n\nAku harus akhiri chat ini ya kak, karena aku peduli sama kamu. Tolong hubungi nomor itu.",
        shouldEndChat: true,
      }
    }
  }

  // Check YELLOW
  for (const pattern of YELLOW_PATTERNS) {
    if (pattern.test(text)) {
      return {
        level: 'yellow',
        message: '',
        shouldEndChat: false,
      }
    }
  }

  return { level: 'green', message: '', shouldEndChat: false }
}
