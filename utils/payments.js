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

export const normalizeExpiryDigits = (value = "") =>
  stripDigits(value).slice(0, 4);

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

// ===== Subscription status helpers =====
// Possible statuses: all, paid_active, paid_overdue, trial_active, trial_expired, disabled
export const computeSubscriptionStatus = (tenant) => {
  if (!tenant) return 'disabled';

  const now = Date.now();
  const trialMs = tenant?.trial_until ? new Date(tenant.trial_until).getTime() : null;
  const paidMs = tenant?.current_period_end ? new Date(tenant.current_period_end).getTime() : null;
  const isActive = tenant?.is_active !== false;

  if (!isActive) return 'disabled';

  // Prefer explicit plan branching
  if (tenant.plan === 'pro') {
    if (paidMs && paidMs >= now) return 'paid_active';
    return 'paid_overdue';
  }
  if (tenant.plan === 'trial') {
    if (trialMs && trialMs >= now) return 'trial_active';
    return 'trial_expired';
  }

  // Fallback from dates if plan unknown
  if (paidMs && paidMs >= now) return 'paid_active';
  if (paidMs && paidMs < now) return 'paid_overdue';
  if (trialMs && trialMs >= now) return 'trial_active';
  if (trialMs && trialMs < now) return 'trial_expired';
  return 'disabled';
};

export const subscriptionStatusLabel = (status) => {
  switch (status) {
    case 'paid_active':
      return 'Оплачено';
    case 'paid_overdue':
      return 'Оплата просрочена';
    case 'trial_active':
      return 'Пробный период';
    case 'trial_expired':
      return 'Пробный завершён';
    case 'disabled':
      return 'Неактивен';
    default:
      return status;
  }
};

export const describeSubscription = (tenant) => {
  const status = computeSubscriptionStatus(tenant);
  const label = subscriptionStatusLabel(status);
  const until =
    status.startsWith('trial')
      ? tenant?.trial_until || null
      : status.startsWith('paid')
      ? tenant?.current_period_end || null
      : null;
  const untilText = until
    ? new Date(until).toLocaleDateString('ru-RU')
    : null;
  return { status, label, until, untilText };
};
