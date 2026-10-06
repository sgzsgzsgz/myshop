export interface CartItem {
  productId: number;
  name: string;
  priceCents: number;
  image: string;
  quantity: number;
}

const CART_KEY = "myshop-cart";
const MAX_QUANTITY = 99;

let cached: CartItem[] | null = null;

function readCart(): CartItem[] {
  if (cached === null) {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
      cached = Array.isArray(parsed) ? parsed : [];
    } catch {
      cached = [];
    }
  }
  return cached;
}

function writeCart(items: CartItem[]): void {
  cached = items;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCart(): CartItem[] {
  return readCart();
}

export function invalidateCart(): void {
  cached = null;
}

export function addToCart(
  item: Omit<CartItem, "quantity">,
  quantity = 1
): void {
  const items = readCart();
  const index = items.findIndex((i) => i.productId === item.productId);
  if (index >= 0) {
    const next = [...items];
    next[index] = {
      ...next[index],
      quantity: Math.min(next[index].quantity + quantity, MAX_QUANTITY),
    };
    writeCart(next);
  } else {
    writeCart([...items, { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }]);
  }
}

export function updateCartQuantity(productId: number, quantity: number): void {
  writeCart(
    readCart().map((i) =>
      i.productId === productId
        ? { ...i, quantity: Math.max(1, Math.min(quantity, MAX_QUANTITY)) }
        : i
    )
  );
}

export function removeFromCart(productId: number): void {
  writeCart(readCart().filter((i) => i.productId !== productId));
}

export function clearCart(): void {
  writeCart([]);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotalCents(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
}
