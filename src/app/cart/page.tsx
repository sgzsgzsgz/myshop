"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import {
  cartCount,
  cartTotalCents,
  removeFromCart,
  updateCartQuantity,
} from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const items = useCart();

  const changeQuantity = (productId: number, delta: number) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    updateCartQuantity(productId, item.quantity + delta);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <p className="text-xl font-medium text-gray-700">购物车还是空的</p>
        <p className="mt-2 text-sm text-gray-500">快去挑选心仪的商品吧</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">购物车</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
            >
              <Link
                href={`/products/${item.productId}`}
                className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </Link>
              <div className="flex-1">
                <Link
                  href={`/products/${item.productId}`}
                  className="line-clamp-1 font-medium text-gray-900 hover:text-indigo-600"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-rose-600">
                  {formatPrice(item.priceCents)}
                </p>
              </div>
              <div className="flex items-center rounded-lg border border-gray-300">
                <button
                  type="button"
                  onClick={() => changeQuantity(item.productId, -1)}
                  className="px-3 py-1 text-gray-600 hover:text-indigo-600"
                  aria-label="减少数量"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => changeQuantity(item.productId, 1)}
                  className="px-3 py-1 text-gray-600 hover:text-indigo-600"
                  aria-label="增加数量"
                >
                  +
                </button>
              </div>
              <p className="w-24 text-right font-medium text-gray-900">
                {formatPrice(item.priceCents * item.quantity)}
              </p>
              <button
                type="button"
                onClick={() => removeFromCart(item.productId)}
                className="text-gray-400 hover:text-rose-500"
                aria-label="删除商品"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-medium text-gray-900">订单摘要</h2>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>商品件数</span>
            <span>{cartCount(items)} 件</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <span>商品金额</span>
            <span>{formatPrice(cartTotalCents(items))}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <span>运费</span>
            <span>免运费</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
            <span className="font-medium text-gray-900">合计</span>
            <span className="text-xl font-semibold text-rose-600">
              {formatPrice(cartTotalCents(items))}
            </span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block rounded-xl bg-indigo-600 py-3 text-center font-medium text-white hover:bg-indigo-700"
          >
            去结算
          </Link>
          <Link
            href="/"
            className="mt-3 block text-center text-sm text-gray-500 hover:text-indigo-600"
          >
            继续购物
          </Link>
        </div>
      </div>
    </div>
  );
}
