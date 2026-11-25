export const BRAND = "Nspace Visa Agency";
export const USD_TO_BDT = 122;
export const SERVICE_FEE_BDT = 1500;

export type Mode = "evisa" | "embassy" | "arrival";

export type Country = {
  slug: string;
  name: string;
  iso: string;
  lat: number;
  lng: number;
  tz: string;
  airport: string;
  continent: string;
  visaType: string;
  govUsd: number;
  days: number;
  stay: number;
  validity: string;
  entry: string;
  mode: Mode;
  world: string;
  popular: boolean;
};

export const ORIGIN = {
  name: "Bangladesh",
  city: "Dhaka",
  airport: "Dhaka (DAC)",
  iso: "bd",
  lat: 23.84,
  lng: 90.4,
  tz: "Asia/Dhaka",
  world: "Bangladesh",
};

type Row = [
  string, // slug
  string, // name
  string, // iso
  number, // lat
  number, // lng
  string, // tz
  string, // airport
  string, // continent
  string, // visaType
  number, // gov USD
  number, // days
  number, // stay
  string, // validity
  string, // entry
  Mode,
  string?, // world name override
];

const SCH = "Schengen Visa (Type C)";

const rows: Row[] = [
  ["australia", "Australia", "au", -33.94, 151.18, "Australia/Sydney", "Sydney (SYD)", "Oceania", "Visitor Visa (Subclass 600)", 130, 20, 90, "12 months", "Multiple", "embassy"],
  ["united-arab-emirates", "United Arab Emirates", "ae", 25.25, 55.36, "Asia/Dubai", "Dubai (DXB)", "Asia", "UAE Tourist eVisa", 100, 3, 30, "60 days", "Single", "evisa"],
  ["united-states", "United States", "us", 40.64, -73.78, "America/New_York", "New York (JFK)", "North America", "B1/B2 Visitor Visa", 185, 60, 180, "10 years", "Multiple", "embassy", "United States of America"],
  ["united-kingdom", "United Kingdom", "gb", 51.47, -0.45, "Europe/London", "London (LHR)", "Europe", "Standard Visitor Visa", 140, 21, 180, "6 months", "Multiple", "embassy"],
  ["canada", "Canada", "ca", 43.68, -79.63, "America/Toronto", "Toronto (YYZ)", "North America", "Visitor Visa (TRV)", 75, 30, 180, "Up to 10 years", "Multiple", "embassy"],
  ["singapore", "Singapore", "sg", 1.36, 103.99, "Asia/Singapore", "Singapore (SIN)", "Asia", "Singapore Visit Visa", 30, 3, 30, "30 days", "Single", "evisa"],
  ["thailand", "Thailand", "th", 13.69, 100.75, "Asia/Bangkok", "Bangkok (BKK)", "Asia", "Thailand Tourist eVisa", 40, 7, 60, "3 months", "Single", "evisa"],
  ["malaysia", "Malaysia", "my", 2.75, 101.71, "Asia/Kuala_Lumpur", "Kuala Lumpur (KUL)", "Asia", "Malaysia eVisa", 40, 5, 30, "3 months", "Single", "evisa"],
  ["japan", "Japan", "jp", 35.55, 139.78, "Asia/Tokyo", "Tokyo (HND)", "Asia", "Japan Tourist Visa", 25, 10, 15, "90 days", "Single", "embassy"],
  ["south-korea", "South Korea", "kr", 37.46, 126.44, "Asia/Seoul", "Seoul (ICN)", "Asia", "Korea Short-term Visa (C-3)", 40, 10, 90, "90 days", "Single", "embassy"],
  ["turkey", "Turkey", "tr", 41.26, 28.74, "Europe/Istanbul", "Istanbul (IST)", "Europe", "Turkey eVisa", 60, 2, 30, "180 days", "Single", "evisa"],
  ["vietnam", "Vietnam", "vn", 21.22, 105.8, "Asia/Ho_Chi_Minh", "Hanoi (HAN)", "Asia", "Vietnam eVisa", 25, 4, 90, "90 days", "Single", "evisa"],
  ["sri-lanka", "Sri Lanka", "lk", 7.18, 79.88, "Asia/Colombo", "Colombo (CMB)", "Asia", "Sri Lanka ETA", 50, 1, 30, "90 days", "Double", "evisa"],
  ["maldives", "Maldives", "mv", 4.19, 73.53, "Indian/Maldives", "Malé (MLE)", "Asia", "Visa on Arrival + Imuga Form", 0, 1, 30, "30 days", "Single", "arrival"],
  ["nepal", "Nepal", "np", 27.7, 85.36, "Asia/Kathmandu", "Kathmandu (KTM)", "Asia", "Nepal Tourist Visa", 30, 1, 90, "90 days", "Multiple", "arrival"],
  ["indonesia", "Indonesia", "id", -8.75, 115.17, "Asia/Makassar", "Bali (DPS)", "Asia", "Indonesia e-VOA", 35, 1, 30, "30 days", "Single", "arrival"],
  ["saudi-arabia", "Saudi Arabia", "sa", 24.96, 46.7, "Asia/Riyadh", "Riyadh (RUH)", "Asia", "Saudi Tourist eVisa", 120, 3, 90, "1 year", "Multiple", "evisa"],
  ["qatar", "Qatar", "qa", 25.27, 51.61, "Asia/Qatar", "Doha (DOH)", "Asia", "Qatar Tourist Visa", 30, 3, 30, "30 days", "Single", "evisa"],
  ["oman", "Oman", "om", 23.59, 58.28, "Asia/Muscat", "Muscat (MCT)", "Asia", "Oman eVisa", 25, 3, 30, "30 days", "Single", "evisa"],
  ["jordan", "Jordan", "jo", 31.72, 35.99, "Asia/Amman", "Amman (AMM)", "Asia", "Jordan Visa", 60, 7, 30, "30 days", "Single", "embassy"],
  ["egypt", "Egypt", "eg", 30.12, 31.4, "Africa/Cairo", "Cairo (CAI)", "Africa", "Egypt eVisa", 25, 7, 30, "90 days", "Single", "evisa"],
  ["south-africa", "South Africa", "za", -26.13, 28.24, "Africa/Johannesburg", "Johannesburg (JNB)", "Africa", "Visitor Visa", 40, 25, 90, "90 days", "Single", "embassy"],
  ["kenya", "Kenya", "ke", -1.32, 36.93, "Africa/Nairobi", "Nairobi (NBO)", "Africa", "Kenya eTA", 30, 3, 90, "90 days", "Single", "evisa"],
  ["mauritius", "Mauritius", "mu", -20.43, 57.68, "Indian/Mauritius", "Mauritius (MRU)", "Africa", "Mauritius Travel Authorisation", 0, 2, 60, "60 days", "Single", "evisa"],
  ["new-zealand", "New Zealand", "nz", -37.0, 174.79, "Pacific/Auckland", "Auckland (AKL)", "Oceania", "Visitor Visa", 150, 25, 90, "9 months", "Multiple", "embassy"],
  ["france", "France", "fr", 49.0, 2.55, "Europe/Paris", "Paris (CDG)", "Europe", SCH, 100, 15, 90, "Up to 90 days", "Single", "embassy"],
  ["germany", "Germany", "de", 50.03, 8.57, "Europe/Berlin", "Frankfurt (FRA)", "Europe", SCH, 100, 15, 90, "Up to 90 days", "Single", "embassy"],
  ["italy", "Italy", "it", 41.8, 12.25, "Europe/Rome", "Rome (FCO)", "Europe", SCH, 100, 15, 90, "Up to 90 days", "Single", "embassy"],
  ["spain", "Spain", "es", 40.47, -3.56, "Europe/Madrid", "Madrid (MAD)", "Europe", SCH, 100, 15, 90, "Up to 90 days", "Single", "embassy"],
  ["netherlands", "Netherlands", "nl", 52.31, 4.76, "Europe/Amsterdam", "Amsterdam (AMS)", "Europe", SCH, 100, 15, 90, "Up to 90 days", "Single", "embassy"],
  ["switzerland", "Switzerland", "ch", 47.46, 8.55, "Europe/Zurich", "Zurich (ZRH)", "Europe", SCH, 100, 15, 90, "Up to 90 days", "Single", "embassy"],
  ["austria", "Austria", "at", 48.11, 16.57, "Europe/Vienna", "Vienna (VIE)", "Europe", SCH, 100, 15, 90, "Up to 90 days", "Single", "embassy"],
  ["greece", "Greece", "gr", 37.94, 23.94, "Europe/Athens", "Athens (ATH)", "Europe", SCH, 100, 15, 90, "Up to 90 days", "Single", "embassy"],
  ["portugal", "Portugal", "pt", 38.77, -9.13, "Europe/Lisbon", "Lisbon (LIS)", "Europe", SCH, 100, 15, 90, "Up to 90 days", "Single", "embassy"],
  ["ireland", "Ireland", "ie", 53.43, -6.27, "Europe/Dublin", "Dublin (DUB)", "Europe", "Irish Short Stay Visa (C)", 70, 28, 90, "90 days", "Single", "embassy"],
  ["russia", "Russia", "ru", 55.97, 37.41, "Europe/Moscow", "Moscow (SVO)", "Europe", "Russia eVisa", 52, 4, 16, "60 days", "Single", "evisa"],
  ["azerbaijan", "Azerbaijan", "az", 40.47, 50.05, "Asia/Baku", "Baku (GYD)", "Asia", "Azerbaijan ASAN eVisa", 25, 3, 30, "90 days", "Single", "evisa"],
  ["georgia", "Georgia", "ge", 41.67, 44.95, "Asia/Tbilisi", "Tbilisi (TBS)", "Asia", "Georgia eVisa", 20, 5, 30, "90 days", "Single", "evisa"],
  ["uzbekistan", "Uzbekistan", "uz", 41.26, 69.28, "Asia/Tashkent", "Tashkent (TAS)", "Asia", "Uzbekistan eVisa", 20, 3, 30, "90 days", "Single", "evisa"],
  ["china", "China", "cn", 40.08, 116.6, "Asia/Shanghai", "Beijing (PEK)", "Asia", "China L Tourist Visa", 55, 10, 30, "3 months", "Single", "embassy"],
  ["hong-kong", "Hong Kong", "hk", 22.31, 113.91, "Asia/Hong_Kong", "Hong Kong (HKG)", "Asia", "Hong Kong Pre-arrival Registration", 0, 3, 14, "14 days", "Single", "evisa"],
  ["cambodia", "Cambodia", "kh", 13.41, 103.81, "Asia/Phnom_Penh", "Siem Reap (SAI)", "Asia", "Cambodia eVisa", 36, 3, 30, "3 months", "Single", "evisa"],
  ["philippines", "Philippines", "ph", 14.51, 121.02, "Asia/Manila", "Manila (MNL)", "Asia", "Philippines Tourist Visa", 35, 10, 30, "59 days", "Single", "embassy"],
  ["bhutan", "Bhutan", "bt", 27.4, 89.42, "Asia/Thimphu", "Paro (PBH)", "Asia", "Bhutan Tourist Visa", 40, 5, 14, "14 days", "Single", "evisa"],
  ["brazil", "Brazil", "br", -23.43, -46.47, "America/Sao_Paulo", "São Paulo (GRU)", "South America", "Brazil eVisa", 80, 10, 90, "10 years", "Multiple", "evisa"],
  ["mexico", "Mexico", "mx", 19.44, -99.07, "America/Mexico_City", "Mexico City (MEX)", "North America", "Mexico Tourist Visa", 36, 15, 180, "180 days", "Single", "embassy"],
];

export const COUNTRIES: Country[] = rows.map((r) => ({
  slug: r[0],
  name: r[1],
  iso: r[2],
  lat: r[3],
  lng: r[4],
  tz: r[5],
  airport: r[6],
  continent: r[7],
  visaType: r[8],
  govUsd: r[9],
  days: r[10],
  stay: r[11],
  validity: r[12],
  entry: r[13],
  mode: r[14],
  world: r[15] ?? r[1],
  popular: [
    "australia",
    "united-arab-emirates",
    "united-states",
    "united-kingdom",
    "canada",
    "singapore",
    "thailand",
    "malaysia",
    "japan",
    "turkey",
    "saudi-arabia",
    "france",
  ].includes(r[0]),
}));

export const CONTINENTS = [
  "All",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Africa",
  "Oceania",
];

export function normalizeSlug(slug: string) {
  return slug.replace(/-visa$/, "");
}

export function getCountry(slug: string | null | undefined) {
  if (!slug) return undefined;
  const s = normalizeSlug(slug.toLowerCase());
  return COUNTRIES.find((c) => c.slug === s);
}

export function flagUrl(iso: string, w: 40 | 80 | 160 | 320 | 640 = 160) {
  return `https://flagcdn.com/w${w}/${iso}.png`;
}

export function govFeeBdt(c: Country) {
  return Math.round(c.govUsd * USD_TO_BDT);
}

export function totalFeeBdt(c: Country, travelers = 1) {
  return (govFeeBdt(c) + SERVICE_FEE_BDT) * travelers;
}

export function formatBdt(n: number) {
  return "৳" + n.toLocaleString("en-IN");
}

export function modeLabel(m: Mode) {
  return m === "evisa" ? "e-Visa" : m === "arrival" ? "On arrival" : "Embassy visa";
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function flightHours(c: Country) {
  const km = haversineKm(ORIGIN, c);
  return Math.max(0.8, km / 820 + 0.5);
}

export function documentsFor(c: Country): string[] {
  const base = [
    "Passport valid for at least 6 months, with 2 blank pages",
    "Recent passport-size photograph with white background",
    "Scanned copy of your passport bio page",
  ];
  if (c.mode === "evisa" || c.mode === "arrival") {
    return [
      ...base,
      "Confirmed return flight ticket",
      "Hotel booking or address of stay",
      "Last 3 months bank statement (some visas)",
    ];
  }
  return [
    ...base,
    "National ID card (NID) copy",
    "Last 6 months bank statement with sufficient funds",
    "Employment letter / trade licence / student certificate",
    "Income tax return (TIN certificate)",
    "Day-by-day travel itinerary and return flight reservation",
    "Hotel reservation or invitation letter",
    "Travel insurance covering the whole trip",
  ];
}

export function stepsFor(c: Country): { title: string; body: string }[] {
  if (c.mode === "embassy") {
    return [
      { title: "Share your details", body: `Tell us your travel dates and ${c.name} plans. We confirm the exact visa and fee.` },
      { title: "Upload documents once", body: "We review every document against the consulate checklist and fix mistakes before submission." },
      { title: "We file & book biometrics", body: "Our team fills the forms, pays fees and books your appointment slot." },
      { title: "Get your visa on time", body: "Track every update live. Visa delayed beyond promise? Our service fee is refunded." },
    ];
  }
  return [
    { title: "Pick passport & dates", body: `Choose ${c.name} and your travel date — we show the fee and delivery date upfront.` },
    { title: "Upload passport & photo", body: "Snap your passport and a photo. We auto-fill the government form." },
    { title: "We verify & submit", body: "Every field and document is checked by a visa expert before it reaches the government portal." },
    { title: "Receive your e-visa", body: "Your approved visa lands in the app and email. Print it and fly." },
  ];
}

export function faqsFor(c: Country): { q: string; a: string }[] {
  const faqs = [
    {
      q: `Do Bangladeshi citizens need a visa for ${c.name}?`,
      a:
        c.mode === "arrival"
          ? `Bangladeshi passport holders can receive a ${c.visaType} for ${c.name}. We pre-clear the paperwork so the airport process takes minutes.`
          : `Yes. Bangladeshi passport holders need a ${c.visaType} to enter ${c.name}. Nspace prepares and submits the whole application for you.`,
    },
    {
      q: `How long does the ${c.name} visa take?`,
      a: `Typical processing time is ${c.days} ${c.days === 1 ? "day" : "days"}. The exact delivery date is shown before you pay, and if we miss it our service fee is refunded.`,
    },
    {
      q: `How long can I stay in ${c.name}?`,
      a: `The ${c.visaType} allows a stay of up to ${c.stay} days per visit and is valid for ${c.validity.toLowerCase()}. Entry type: ${c.entry.toLowerCase()}.`,
    },
    {
      q: "What happens if my visa is denied?",
      a: "We build a free re-application strategy with you. If it is denied again, we refund the service fee. Government fees are non-refundable by the authorities.",
    },
    {
      q: "Can I apply for my family in one application?",
      a: "Yes. Add every traveler to a single application — one upload session, one payment and one delivery date for the group.",
    },
  ];
  if (c.slug === "australia") {
    faqs.unshift({
      q: "What is a multiple-entry Australia visa?",
      a: "A multiple-entry visa allows you to enter Australia more than once within the visa's validity period. For example, with a 12-month multiple-entry visa that allows a stay of up to 3 months per visit, you could visit at the start of month 1 and stay until the end of month 3, leave, then visit again at the start of month 7 and stay until month 9. You just must not exceed the permitted stay on each visit. Some visitor visas also carry condition 8558: no more than 12 months in any 18-month period.",
    });
  }
  return faqs;
}

export function highlightsFor(c: Country): string[] {
  if (c.slug === "australia")
    return [
      "Sydney Opera House & Harbour Bridge",
      "Great Barrier Reef, Queensland",
      "Melbourne laneways & coffee culture",
      "Uluru and the Red Centre",
    ];
  return [
    `Fly into ${c.airport}`,
    `${c.continent} travel made simple`,
    "Paperwork prepared by experts",
    "Live tracking & 24×7 human support",
  ];
}

export const STAGES = [
  { key: "submitted", label: "Application received", note: "We received your application and traveler details.", at: 0 },
  { key: "documents", label: "Documents verified", note: "A visa expert checked every document and form field.", at: 25 },
  { key: "filed", label: "Filed with authority", note: "Application submitted to the immigration authority.", at: 60 },
  { key: "processing", label: "Under government review", note: "The authority is reviewing your application.", at: 110 },
  { key: "approved", label: "Visa approved", note: "Great news — your visa has been approved!", at: 170 },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];

export const WORLD_NAME_BY_ORIGIN = ORIGIN.world;
