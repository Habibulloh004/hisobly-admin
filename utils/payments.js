const stripDigits = (value = "") => String(value ?? "").replace(/\D/g, "");

export const normalizeCardNumber = (value = "") =>
  stripDigits(value).slice(0, 16);

export const formatCardNumberDisplay = (value = "") =>
  normalizeCardNumber(value)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

export const maskCardForPreview = (value = "") => {
  const digits = normalizeCardNumber(value).padEnd(16, "•");
  return digits
    .replace(/(\d{4})/g, "$1 ")
    .trim()
    .split(" ")
    .map((chunk, idx) => (idx < 2 ? chunk : chunk.replace(/\d/g, "•")))
    .join(" ");
};

const clampMonth = (raw) => {
  if (!raw) return "";
  const numeric = parseInt(raw, 10);
  if (Number.isNaN(numeric)) return "";
  if (numeric <= 0) return "01";
  if (numeric > 12) return "12";
  return numeric.toString().padStart(2, "0");
};

export const formatExpiryDisplay = (value = "") => {
  const digits = stripDigits(value).slice(0, 4);
  if (!digits) return "";
  if (digits.length <= 2) return clampMonth(digits);
  const month = clampMonth(digits.slice(0, 2));
  const year = digits.slice(2, 4);
  return year ? `${month}/${year}` : month;
};

export const expiryToBackend = (value = "") => {
  const digits = stripDigits(value);
  if (digits.length < 4) return "";
  return `${digits.slice(2, 4)}${digits.slice(0, 2)}`;
};

export const isExpiryInFuture = (value = "") => {
  const digits = stripDigits(value);
  if (digits.length !== 4) return false;
  const month = Number(digits.slice(0, 2));
  const year = Number(digits.slice(2, 4));
  if (!month || month > 12) return false;

  const now = new Date();
  const currentYear = Number(now.getFullYear().toString().slice(-2));
  const currentMonth = now.getMonth() + 1;

  if (year > currentYear) return true;
  if (year === currentYear) return month >= currentMonth;
  return false;
};

export const normalizeAmount = (value = "") =>
  stripDigits(value).slice(0, 9);

export const prettyAmount = (value = "") => {
  const digits = normalizeAmount(value);
  if (!digits) return "";
  return new Intl.NumberFormat("ru-RU").format(Number(digits));
};

export const LOCAL_SUBSCRIPTION_KEY = "tenant_subscription_status";

export const storeSubscriptionLocally = (payload) => {
  if (typeof window === "undefined") return;
  const expiresAt =
    payload?.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const entry = {
    plan: payload?.plan || "pro",
    trial_until: null,
    current_period_end: expiresAt.toISOString(),
    updated_at: new Date().toISOString(),
  };
  window.localStorage.setItem(LOCAL_SUBSCRIPTION_KEY, JSON.stringify(entry));
  return entry;
};

export const readLocalSubscription = () => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_SUBSCRIPTION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed.current_period_end &&
      new Date(parsed.current_period_end).getTime() < Date.now()
    ) {
      window.localStorage.removeItem(LOCAL_SUBSCRIPTION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};
