"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { cartCount } from "@/lib/cart";

export default function NavBar() {
  const count = cartCount(useCart());

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-indigo-600">
          好物商城
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-gray-700 hover:text-indigo-600">
            首页
          </Link>
          <Link href="/orders" className="text-gray-700 hover:text-indigo-600">
            我的订单
          </Link>
          <Link href="/admin" className="text-gray-700 hover:text-indigo-600">
            管理
          </Link>
          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-indigo-600"
          >
            购物车
            {count > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
