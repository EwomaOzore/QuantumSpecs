export const TENANT = {
  name: "Kora",
  legalName: "Kora Payments Limited",
  tagline: "Pan-African payment infrastructure",
  environment: "production",
} as const;

export const OPERATOR = {
  name: process.env.NEXT_PUBLIC_OPERATOR_NAME ?? "Ewoma",
  role: "Head of Operations",
  email: "ewoma@kora.pay",
} as const;

export const FX_TO_USD: Record<string, number> = {
  USD: 1,
  GBP: 1.27,
  NGN: 1 / 1580,
  GHS: 1 / 15.4,
  KES: 1 / 129,
  ZAR: 1 / 18.2,
};

export const REGIONS = [
  {
    id: "reg_ng",
    code: "NG",
    name: "Nigeria",
    country: "Nigeria",
    currency: "NGN",
    timezone: "Africa/Lagos",
  },
  {
    id: "reg_gh",
    code: "GH",
    name: "Ghana",
    country: "Ghana",
    currency: "GHS",
    timezone: "Africa/Accra",
  },
  {
    id: "reg_ke",
    code: "KE",
    name: "Kenya",
    country: "Kenya",
    currency: "KES",
    timezone: "Africa/Nairobi",
  },
  {
    id: "reg_za",
    code: "ZA",
    name: "South Africa",
    country: "South Africa",
    currency: "ZAR",
    timezone: "Africa/Johannesburg",
  },
  {
    id: "reg_gb",
    code: "GB",
    name: "United Kingdom",
    country: "United Kingdom",
    currency: "GBP",
    timezone: "Europe/London",
  },
] as const;

export const PROVIDERS = [
  {
    id: "prov_paystack",
    slug: "paystack",
    name: "Paystack",
    type: "card",
    regions: ["NG", "GH", "ZA"],
  },
  {
    id: "prov_flutterwave",
    slug: "flutterwave",
    name: "Flutterwave",
    type: "card",
    regions: ["NG", "GH", "KE", "ZA"],
  },
  {
    id: "prov_mtn",
    slug: "mtn-momo",
    name: "MTN MoMo",
    type: "mobile_money",
    regions: ["NG", "GH", "ZA"],
  },
  {
    id: "prov_mpesa",
    slug: "mpesa",
    name: "M-Pesa",
    type: "mobile_money",
    regions: ["KE"],
  },
  {
    id: "prov_stripe",
    slug: "stripe",
    name: "Stripe",
    type: "card",
    regions: ["GB", "ZA"],
  },
  {
    id: "prov_nuban",
    slug: "nuban",
    name: "NUBAN Transfer",
    type: "bank",
    regions: ["NG"],
  },
] as const;

export const SERVICES = [
  "checkout-api",
  "ledger",
  "fx-engine",
  "risk-engine",
  "payout-worker",
  "webhook-gateway",
] as const;

export const TEAMS = [
  "payments",
  "risk",
  "platform",
  "regional-ng",
  "regional-gh",
  "regional-ke",
  "compliance",
] as const;
