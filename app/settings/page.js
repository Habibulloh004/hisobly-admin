"use client";
import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import { Settings, DollarSign, Save, Crown, ShieldCheck, Clock4 } from "lucide-react";
import { settingsAPI, tenantAPI, storeAPI } from "@/utils/api";
import toast from "react-hot-toast";
import PaymentModal from "@/components/PaymentModal";
import { readLocalSubscription, storeSubscriptionLocally, describeSubscription } from "@/utils/payments";

const SUBSCRIPTION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

const enhanceTenantInfo = (tenant) => {
  if (!tenant) return null;
  const next = { ...tenant };
  if (next.trial_until) {
    const trialDate = new Date(next.trial_until);
    if (Number.isNaN(trialDate.getTime()) || trialDate.getTime() < Date.now()) {
      next.trial_until = null;
      if (next.plan === "trial") next.plan = "trial_expired";
    }
  }
  if (next.current_period_end) {
    const endDate = new Date(next.current_period_end);
    if (Number.isNaN(endDate.getTime())) {
      next.current_period_end = null;
    }
  }
  return next;
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("ru-RU");
};

const getPlanLabel = (plan) => {
  if (!plan) return "—";
  switch (plan) {
    case "pro":
      return "Pro";
    case "trial":
      return "Trial";
    case "trial_expired":
      return "Trial завершён";
    default:
      return plan.charAt(0).toUpperCase() + plan.slice(1);
  }
};

const syncLocalSubscription = (tenant) => {
  if (!tenant) return;
  if (tenant.plan === "pro") {
    const expiresAt = tenant.current_period_end
      ? new Date(tenant.current_period_end)
      : new Date(Date.now() + SUBSCRIPTION_DURATION_MS);
    storeSubscriptionLocally({ plan: "pro", expiresAt });
  }
};

const readSubscriptionFallback = () => {
  const local = readLocalSubscription();
  if (!local) return null;
  return enhanceTenantInfo({
    ...local,
    plan: local.plan || "pro",
    is_active: true,
  });
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [stores, setStores] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [subscriptionRefreshing, setSubscriptionRefreshing] = useState(false);
  const [generalSettings, setGeneralSettings] = useState({
    company_name: "",
  });

  const tabs = [
    { id: "general", name: "Общие настройки", icon: Settings },
    // { id: "payments", name: "Оплата / Подписка", icon: DollarSign },
  ];


  const loadSettings = useCallback(async () => {
    try {
      const { data } = await settingsAPI.getGeneral();
      const saved = localStorage.getItem("settings_general");
      if (saved) setGeneralSettings(JSON.parse(saved));
      if (data.company_name)
        setGeneralSettings((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  const fetchTenantInfo = useCallback(async () => {
    try {
      const { data } = await tenantAPI.getMe();
      const next = enhanceTenantInfo(data);
      if (next) {
        syncLocalSubscription(next);
        setTenantInfo(next);
        setGeneralSettings((prev) => ({
          ...prev,
          company_name: data.name || prev.company_name,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch tenant info:", error);
      const fallback = readSubscriptionFallback();
      if (fallback) {
        setTenantInfo((prev) => ({
          ...(prev || {}),
          ...fallback,
        }));
      }
    }
  }, []);

  const fetchStores = useCallback(async () => {
    try {
      const { data } = await storeAPI.list();
      setStores(data);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    fetchTenantInfo();
    fetchStores();
  }, [loadSettings, fetchTenantInfo, fetchStores]);

  const saveGeneralSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem("settings_general", JSON.stringify(generalSettings));
      await settingsAPI.updateGeneral(generalSettings);
      toast.success("Общие настройки сохранены");
    } catch {
      toast.error("Ошибка при сохранении настроек");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    const expiresAt = new Date(Date.now() + SUBSCRIPTION_DURATION_MS);
    storeSubscriptionLocally({ plan: "pro", expiresAt });
    setTenantInfo((prev) =>
      enhanceTenantInfo({
        ...(prev || {}),
        plan: "pro",
        trial_until: null,
        current_period_end: expiresAt.toISOString(),
        is_active: true,
      })
    );
    setSubscriptionRefreshing(true);
    try {
      const { data } = await tenantAPI.getMe();
      const next = enhanceTenantInfo(data);
      if (next) {
        syncLocalSubscription(next);
        setTenantInfo(next);
      }
    } catch (error) {
      console.error("Failed to refresh tenant after payment:", error);
    } finally {
      setSubscriptionRefreshing(false);
    }
  };

  const planLabel = getPlanLabel(tenantInfo?.plan);
  const sub = tenantInfo ? describeSubscription(tenantInfo) : null;
  const statusLabel = sub?.label;
  const statusUntil = sub?.untilText;
  const isPaidActive = sub?.status === "paid_active";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
            <p className="mt-1 text-sm text-gray-500">
              Управляйте реквизитами компании и подпиской
            </p>
          </div>
          {tenantInfo && (
            <div className="flex flex-col items-start text-sm text-gray-600 md:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#475B8D]/10 px-3 py-1 font-medium text-[#475B8D]">
                  <Crown className="h-4 w-4" />
                  {planLabel}
                </span>
                {tenantInfo.is_active && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                    Активен
                  </span>
                )}
                {statusLabel && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {statusLabel}
                  </span>
                )}
              </div>
              {statusUntil && (
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <Clock4 className="h-4 w-4" />
                  До {statusUntil}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b overflow-x-auto">
          <nav className="flex gap-4 min-w-max sm:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#475B8D] text-[#475B8D]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        {/* Content */}
        <div className="card p-4 sm:p-6">
          {/* ================= GENERAL ================= */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Общие настройки</h3>

              {tenantInfo && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#475B8D]">
                        Текущий план
                      </p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{planLabel}</p>
                      <p className="text-sm text-gray-600">
                        {statusLabel}
                        {statusUntil ? ` до ${statusUntil}` : ''}
                      </p>
                    </div>
                    <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                      <button
                        onClick={() => setShowPayment(true)}
                        className="btn-primary flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={subscriptionRefreshing || isPaidActive}
                        title={isPaidActive ? "Подписка активна" : undefined}
                      >
                        {isPaidActive ? (
                          <>
                            <ShieldCheck className="h-4 w-4" /> Подписка активна
                          </>
                        ) : subscriptionRefreshing ? (
                          "Обновление..."
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4" /> Продлить подписку
                          </>
                        )}
                      </button>
                      {!isPaidActive && (
                        <p className="text-xs text-gray-500 text-center sm:text-right">
                          После оплаты статус Pro действует 30 дней
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Company name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название компании
                </label>
                <input
                  type="text"
                  value={generalSettings.company_name}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      company_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                />
              </div>

              {/* Warehouse / Store */}
              {stores.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Склады / Магазины</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {stores.map((store) => (
                      <div key={store.id} className="rounded-lg border p-4">
                        <p className="font-medium text-gray-900">{store.name}</p>
                        <p className="text-sm text-gray-600">Код: {store.code}</p>
                        {store.address && (
                          <p className="text-sm text-gray-600">
                            {store.address}
                          </p>
                        )}
                        <span
                          className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                            store.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {store.is_active ? "Активен" : "Неактивен"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={saveGeneralSettings}
                  disabled={loading}
                  className="btn-primary flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  Сохранить
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Layout>
  );
}
