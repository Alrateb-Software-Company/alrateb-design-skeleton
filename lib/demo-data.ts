/**
 * Mock data for the sample pages. Real pages load this from the API — keep the shapes,
 * drop the arrays. Bilingual records carry `name` (English) + `nameAr` and the UI picks one.
 */

export type CustomerStatus = "active" | "lead" | "inactive";

export interface Customer {
  id: number;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  city: string;
  status: CustomerStatus;
  balance: number;
  vip: boolean;
  joined: string; // YYYY-MM-DD
}

export const CUSTOMERS: Customer[] = [
  { id: 1, name: "Ahmed Al Balushi", nameAr: "أحمد البلوشي", email: "ahmed@example.com", phone: "+96891234567", city: "muscat", status: "active", balance: 1250.5, vip: true, joined: "2025-01-14" },
  { id: 2, name: "Fatma Al Harthy", nameAr: "فاطمة الحارثي", email: "fatma@example.com", phone: "+96892345678", city: "sohar", status: "active", balance: 0, vip: false, joined: "2025-02-03" },
  { id: 3, name: "Salim Al Rawahi", nameAr: "سالم الرواحي", email: "salim@example.com", phone: "+96893456789", city: "nizwa", status: "lead", balance: 0, vip: false, joined: "2025-03-22" },
  { id: 4, name: "Maryam Al Kindi", nameAr: "مريم الكندي", email: "maryam@example.com", phone: "+96894567890", city: "salalah", status: "inactive", balance: -320, vip: false, joined: "2024-11-09" },
  { id: 5, name: "Khalid Al Siyabi", nameAr: "خالد السيابي", email: "khalid@example.com", phone: "+96895678901", city: "muscat", status: "active", balance: 4810, vip: true, joined: "2024-09-30" },
  { id: 6, name: "Aisha Al Lawati", nameAr: "عائشة اللواتي", email: "aisha@example.com", phone: "+96896789012", city: "sur", status: "lead", balance: 0, vip: false, joined: "2025-04-18" },
  { id: 7, name: "Yousuf Al Hinai", nameAr: "يوسف الهنائي", email: "yousuf@example.com", phone: "+96897890123", city: "muscat", status: "active", balance: 75.25, vip: false, joined: "2025-05-01" },
  { id: 8, name: "Noor Al Maskari", nameAr: "نور المسكري", email: "noor@example.com", phone: "+96898901234", city: "sohar", status: "active", balance: 980, vip: false, joined: "2025-05-27" },
  { id: 9, name: "Hamed Al Busaidi", nameAr: "حمد البوسعيدي", email: "hamed@example.com", phone: "+96899012345", city: "nizwa", status: "inactive", balance: 0, vip: false, joined: "2024-08-12" },
  { id: 10, name: "Zainab Al Shukaili", nameAr: "زينب الشكيلي", email: "zainab@example.com", phone: "+96890123456", city: "salalah", status: "active", balance: 2200, vip: true, joined: "2025-06-15" },
  { id: 11, name: "Saeed Al Mamari", nameAr: "سعيد المعمري", email: "saeed@example.com", phone: "+96891122334", city: "sur", status: "lead", balance: 0, vip: false, joined: "2025-07-02" },
  { id: 12, name: "Huda Al Amri", nameAr: "هدى العامري", email: "huda@example.com", phone: "+96892233445", city: "muscat", status: "active", balance: 410, vip: false, joined: "2025-07-19" },
];

export const CITIES = ["muscat", "sohar", "nizwa", "salalah", "sur"] as const;

export type ProjectStage = "planning" | "active" | "review" | "done";

export interface Project {
  id: number;
  name: string;
  nameAr: string;
  customerId: number;
  stage: ProjectStage;
  progress: number;
  due: string; // YYYY-MM-DD
  budget: number;
  color: string;
}

/** YYYY-MM-DD `days` from today (UTC), so the demo's deadlines never go stale. */
function daysFromToday(days: number): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days)).toISOString().slice(0, 10);
}

export const PROJECTS: Project[] = [
  { id: 1, name: "Villa renovation", nameAr: "تجديد فيلا", customerId: 1, stage: "active", progress: 64, due: daysFromToday(12), budget: 18500, color: "#0f766e" },
  { id: 2, name: "Office fit-out", nameAr: "تجهيز مكتب", customerId: 5, stage: "review", progress: 92, due: daysFromToday(4), budget: 42000, color: "#c29a4b" },
  { id: 3, name: "Retail kiosk", nameAr: "كشك تجاري", customerId: 10, stage: "planning", progress: 10, due: daysFromToday(45), budget: 6800, color: "#6366f1" },
  { id: 4, name: "Warehouse lighting", nameAr: "إنارة مستودع", customerId: 8, stage: "done", progress: 100, due: daysFromToday(-21), budget: 3200, color: "#10b981" },
  { id: 5, name: "Clinic signage", nameAr: "لافتات عيادة", customerId: 2, stage: "active", progress: 38, due: daysFromToday(26), budget: 2400, color: "#f43f5e" },
  { id: 6, name: "Apartment interiors", nameAr: "تصميم شقة داخلي", customerId: 12, stage: "planning", progress: 5, due: daysFromToday(60), budget: 12600, color: "#f59e0b" },
];

export const STAGES: ProjectStage[] = ["planning", "active", "review", "done"];

/** Pick the localized name of a bilingual record. */
export const localName = (r: { name: string; nameAr: string }, lang: string) => (lang === "ar" && r.nameAr ? r.nameAr : r.name);
