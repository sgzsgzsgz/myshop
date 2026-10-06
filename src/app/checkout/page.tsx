"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCart } from "@/hooks/useCart";
import { cartCount, cartTotalCents, clearCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("请填写姓名、手机号和收货地址");
      return;
    }
    if (items.length === 0) {
      setError("购物车为空，无法下单");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = (await res.json()) as { orderNo?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "下单失败，请重试");
        return;
      }
      clearCart();
      router.push(`/orders?phone=${encodeURIComponent(phone.trim())}`);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <p className="text-xl font-medium text-gray-700">购物车是空的</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">结算</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2 className="font-medium text-gray-900">收货信息</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm text-gray-600"
              >
                收货人姓名
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入姓名"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="mb-1 block text-sm text-gray-600"
              >
                手机号
              </label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入 11 位手机号"
                inputMode="numeric"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="mb-1 block text-sm text-gray-600"
              >
                收货地址
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="请输入省市区及详细地址"
                rows={3}
                className={inputClass}
              />
            </div>
          </div>

          <h2 className="mt-6 font-medium text-gray-900">支付方式</h2>
          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-sm font-medium text-indigo-700">模拟支付</p>
            <p className="mt-1 text-xs text-indigo-500">
              演示模式：提交订单即视为支付成功，不会产生真实扣款
            </p>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitting ? "正在提交…" : "提交订单并支付（模拟）"}
          </button>
        </form>

        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-medium text-gray-900">商品清单</h2>
          <div className="mt-4 flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm text-gray-900">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatPrice(item.priceCents)} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(item.priceCents * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
            <span className="font-medium text-gray-900">合计</span>
            <span className="text-xl font-semibold text-rose-600">
              {formatPrice(cartTotalCents(items))}（{cartCount(items)} 件）
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
