"use client";
import { useMemo, useState } from "react";
import { paymentAPI } from "@/utils/api";
import toast from "react-hot-toast";
import { CreditCard, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import {
  expiryToBackend,
  formatCardNumberDisplay,
  formatExpiryDisplay,
  isExpiryInFuture,
  maskCardForPreview,
  normalizeAmount,
  normalizeCardNumber,
  prettyAmount,
} from "@/utils/payments";

const initialForm = {
  cardNumber: "",
  expireDate: "",
  amount: "",
  cardHolder: "",
};

export default function PaymentModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("enter"); // enter → otp → success
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [otp, setOtp] = useState("");
  const [paymentForm, setPaymentForm] = useState(initialForm);
  const [result, setResult] = useState(null);

  const formattedCardNumber = formatCardNumberDisplay(paymentForm.cardNumber);
  const formattedExpiry = formatExpiryDisplay(paymentForm.expireDate);
  const backendExpiry = expiryToBackend(formattedExpiry);
  const formattedAmount = prettyAmount(paymentForm.amount);

  const canSubmit = useMemo(() => {
    const hasDots = normalizeCardNumber(paymentForm.cardNumber).length === 16;
    const expiryOk = isExpiryInFuture(formattedExpiry);
    const amountOk = Number(normalizeAmount(paymentForm.amount)) > 0;
    return hasDots && expiryOk && amountOk;
  }, [paymentForm, formattedExpiry]);

  const resetState = () => {
    setStep("enter");
    setLoading(false);
    setSession(null);
    setOtp("");
    setResult(null);
    setPaymentForm(initialForm);
  };

  const handleCardChange = (value) => {
    setPaymentForm((prev) => ({
      ...prev,
      cardNumber: normalizeCardNumber(value),
    }));
  };

  const handleExpiryChange = (value) => {
    setPaymentForm((prev) => ({
      ...prev,
      expireDate: formatExpiryDisplay(value),
    }));
  };

  const handleAmountChange = (value) => {
    setPaymentForm((prev) => ({
      ...prev,
      amount: normalizeAmount(value),
    }));
  };

  const handlePay = async () => {
    const cardNumber = normalizeCardNumber(paymentForm.cardNumber);
    const amount = normalizeAmount(paymentForm.amount);

    if (!cardNumber || !backendExpiry || !amount) {
      toast.error("Заполните корректно все поля");
      return;
    }
    if (cardNumber.length !== 16) {
      toast.error("Номер карты должен состоять из 16 цифр");
      return;
    }
    if (!isExpiryInFuture(formattedExpiry)) {
      toast.error("Срок действия карты некорректен");
      return;
    }

    setLoading(true);
    try {
      const res = await paymentAPI.pay({
        cardNumber,
        expireDate: backendExpiry,
        amount,
      });
      if (res?.result?.session) {
        setSession(res.result.session);
        toast.success(`Код отправлен на ${res.result.otpSentPhone}`);
        setStep("otp");
      } else {
        toast.error(res?.error?.errorMessage || "Ошибка при оплате");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при оплате");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!session) {
      toast.error("Сессия оплаты не найдена");
      return;
    }
    if (otp.length !== 6) {
      toast.error("Введите 6-значный код");
      return;
    }

    setLoading(true);
    try {
      const res = await paymentAPI.confirm({ session, otp });
      if (res?.result) {
        toast.success(res.result.statusComment || "Платеж подтверждён");
        setResult(res.result);
        setStep("success");
        onSuccess?.(res.result);
      } else {
        toast.error(res?.error?.errorMessage || "Ошибка подтверждения");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при подтверждении");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetState();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Secure Pay</p>
            <h2 className="text-xl font-semibold text-gray-900">
              {step === "enter" && "Введите данные карты"}
              {step === "otp" && "Подтвердите оплату"}
              {step === "success" && "Оплата успешно прошла"}
            </h2>
          </div>
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
        </div>

        {step === "enter" && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-[#475B8D] via-[#4f6fae] to-[#1e2948] p-5 text-white shadow-md">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest">
                <span>Hisobly</span>
                <CreditCard className="h-5 w-5 opacity-80" />
              </div>
              <p className="mt-6 text-lg font-mono tracking-wider">{maskCardForPreview(paymentForm.cardNumber)}</p>
              <div className="mt-6 flex justify-between text-xs uppercase tracking-widest">
                <div>
                  <p className="opacity-70">Владелец</p>
                  <p className="font-semibold">
                    {paymentForm.cardHolder || "CARD HOLDER"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="opacity-70">Срок</p>
                  <p className="font-semibold">{formattedExpiry || "MM/YY"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Номер карты
                </label>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={19}
                    value={formattedCardNumber}
                    onChange={(e) => handleCardChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 font-mono text-sm tracking-wider focus:border-[#475B8D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#475B8D]/20"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Срок действия
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={formattedExpiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 px-3 font-mono text-sm tracking-widest focus:border-[#475B8D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#475B8D]/20"
                    placeholder="MM/YY"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Формат вводится как 09/30 → отправится 3009
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Сумма, сум
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formattedAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 px-3 font-medium focus:border-[#475B8D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#475B8D]/20"
                    placeholder="50 000"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Имя на карте
                </label>
                <input
                  type="text"
                  value={paymentForm.cardHolder}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({ ...prev, cardHolder: e.target.value.toUpperCase().slice(0, 26) }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 px-3 uppercase tracking-wide focus:border-[#475B8D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#475B8D]/20"
                  placeholder="IVAN IVANOV"
                />
              </div>
            </div>

            <button
              disabled={!canSubmit || loading}
              onClick={handlePay}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Оплатить
            </button>
            <p className="text-center text-xs text-gray-500">
              Данные карты передаются по защищённому каналу
            </p>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
              <p className="text-sm font-medium text-gray-800">
                Подтвердите перевод на {prettyAmount(paymentForm.amount) || "0"} сум
              </p>
              <p className="text-xs text-gray-600">
                Код отправлен на номер, привязанный к карте.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Smartphone className="h-4 w-4" /> Введите 6-значный код
            </div>
            <div className="flex justify-center">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="w-48 rounded-xl border border-gray-200 py-3 text-center text-2xl tracking-[0.6rem] focus:border-[#475B8D] focus:outline-none focus:ring-2 focus:ring-[#475B8D]/20"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
            <button
              disabled={loading}
              onClick={handleConfirm}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Подтвердить оплату
            </button>
            <button
              type="button"
              onClick={() => setStep("enter")}
              className="w-full text-sm font-medium text-[#475B8D]"
            >
              Изменить данные карты
            </button>
          </div>
        )}

        {step === "success" && result && (
          <div className="space-y-5 text-sm text-gray-700">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
              Платёж подтверждён
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="flex justify-between">
                <span>Сумма</span>
                <strong>{prettyAmount(result.amount)} сум</strong>
              </p>
              <p className="flex justify-between">
                <span>Карта</span>
                <strong>{formatCardNumberDisplay(result.cardNumber)}</strong>
              </p>
              <p className="flex justify-between">
                <span>UTRNO</span>
                <strong>{result.utrno}</strong>
              </p>
              <p className="flex justify-between">
                <span>Дата</span>
                <strong>{new Date(result.createdDate).toLocaleString("ru-RU")}</strong>
              </p>
            </div>
            <button
              className="btn-primary w-full py-3 text-sm font-medium"
              onClick={handleClose}
            >
              Вернуться к настройкам
            </button>
          </div>
        )}

        <button
          onClick={handleClose}
          className="mt-4 w-full text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
