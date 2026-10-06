"use client";

import { useSyncExternalStore } from "react";
import { getCart, invalidateCart, type CartItem } from "@/lib/cart";

const emptyCart: CartItem[] = [];

function subscribe(callback: () => void): () => void {
  const onChange = () => {
    invalidateCart();
    callback();
  };
  window.addEventListener("cart-updated", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("cart-updated", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): CartItem[] {
  return getCart();
}

function getServerSnapshot(): CartItem[] {
  return emptyCart;
}

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
