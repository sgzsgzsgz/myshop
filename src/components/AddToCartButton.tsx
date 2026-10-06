"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

interface Props {
  product: {
    id: number;
    name: string;
    priceCents: number;
    image: string;
  };
  quantity?: number;
}

export default function AddToCartButton({ product, quantity = 1 }: Props) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
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
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        added
          ? "bg-emerald-500 text-white"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      }`}
    >
      {added ? "已加入" : "加入购物车"}
    </button>
  );
}
