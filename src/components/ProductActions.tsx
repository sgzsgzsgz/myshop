"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

interface Props {
  product: {
    id: number;
    name: string;
    priceCents: number;
    image: string;
    stock: number;
  };
}

export default function ProductActions({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.stock <= 0) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-xl bg-gray-200 py-3 font-medium text-gray-400"
      >
        暂时无货
      </button>
    );
  }

  const handleAdd = () => {
    addToCart(
      {
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        image: product.image,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-xl border border-gray-300">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-4 py-2 text-lg text-gray-600 hover:text-indigo-600"
            aria-label="减少数量"
          >
            −
          </button>
          <span className="w-10 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => Math.min(product.stock, q + 1))
            }
            className="px-4 py-2 text-lg text-gray-600 hover:text-indigo-600"
            aria-label="增加数量"
          >
            +
          </button>
        </div>
        <span className="text-sm text-gray-500">
          小计 {formatPrice(product.priceCents * quantity)}
        </span>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className={`mt-4 w-full rounded-xl py-3 font-medium text-white transition ${
          added ? "bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {added ? "已加入购物车" : "加入购物车"}
      </button>
      <Link
        href="/cart"
        className="mt-3 block w-full rounded-xl border border-indigo-600 py-3 text-center font-medium text-indigo-600 hover:bg-indigo-50"
      >
        去购物车结算
      </Link>
    </div>
  );
}
