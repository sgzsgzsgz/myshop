import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { createPayment } from "./payment.ts";
import { deleteUploadedFile, deletePlaceholderImage } from "./images.ts";

export interface Product {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  image: string;
  category: string;
  stock: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  priceCents: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: number;
  orderNo: string;
  customerName: string;
  phone: string;
  address: string;
  totalCents: number;
  status: string;
  paymentMethod: string;
  paymentTxn: string | null;
  createdAt: string;
}

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, "shop.db"));
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA busy_timeout = 5000;");

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',
  payment_method TEXT NOT NULL DEFAULT 'mock',
  payment_txn TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  image TEXT NOT NULL
);
`);

export function getCategories(): string[] {
  const rows = db
    .prepare("SELECT DISTINCT category FROM products ORDER BY category")
    .all() as unknown as { category: string }[];
  return rows.map((r) => r.category);
}

// node:sqlite 返回的行是 null-prototype 对象，无法传给客户端组件，
// 这里用 { ...row } 转成普通对象
const PRODUCT_COLUMNS = `id, name, description, price_cents AS priceCents, image, category, stock`;
const ORDER_COLUMNS = `id, order_no AS orderNo, customer_name AS customerName, phone, address,
  total_cents AS totalCents, status, payment_method AS paymentMethod,
  payment_txn AS paymentTxn, created_at AS createdAt`;
const ORDER_ITEM_COLUMNS = `id, order_id AS orderId, product_id AS productId,
  product_name AS productName, price_cents AS priceCents, quantity, image`;

export function getProducts(q?: string, category?: string): Product[] {
  let sql = `SELECT ${PRODUCT_COLUMNS} FROM products WHERE 1=1`;
  const params: string[] = [];
  if (q) {
    sql += " AND name LIKE ?";
    params.push(`%${q}%`);
  }
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  sql += " ORDER BY id";
  const rows = db.prepare(sql).all(...params) as unknown as Product[];
  return rows.map((row) => ({ ...row }));
}

export function getProductById(id: number): Product | undefined {
  const row = db
    .prepare(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`)
    .get(id) as unknown as Product | undefined;
  return row ? { ...row } : undefined;
}

export type ProductInput = Omit<Product, "id">;

export function createProduct(input: ProductInput): Product {
  const result = db
    .prepare(
      `INSERT INTO products (name, description, price_cents, image, category, stock)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.name,
      input.description,
      input.priceCents,
      input.image,
      input.category,
      input.stock
    );
  return getProductById(Number(result.lastInsertRowid))!;
}

export function updateProduct(id: number, input: ProductInput): Product | undefined {
  const result = db
    .prepare(
      `UPDATE products
       SET name = ?, description = ?, price_cents = ?, image = ?, category = ?, stock = ?
       WHERE id = ?`
    )
    .run(
      input.name,
      input.description,
      input.priceCents,
      input.image,
      input.category,
      input.stock,
      id
    );
  if (result.changes === 0) return undefined;
  return getProductById(id);
}

export function deleteProduct(id: number): void {
  const product = getProductById(id);
  if (!product) return;
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  deleteUploadedFile(product.image);
  deletePlaceholderImage(product.image);
}

export function getAllOrders(): Order[] {
  const rows = db
    .prepare(`SELECT ${ORDER_COLUMNS} FROM orders ORDER BY id DESC`)
    .all() as unknown as Order[];
  return rows.map((row) => ({ ...row }));
}

export function getOrdersByPhone(phone: string): Order[] {
  const rows = db
    .prepare(`SELECT ${ORDER_COLUMNS} FROM orders WHERE phone = ? ORDER BY id DESC`)
    .all(phone) as unknown as Order[];
  return rows.map((row) => ({ ...row }));
}

export function getOrderItems(orderIds: number[]): OrderItem[] {
  if (orderIds.length === 0) return [];
  const placeholders = orderIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT ${ORDER_ITEM_COLUMNS} FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id`
    )
    .all(...orderIds) as unknown as OrderItem[];
  return rows.map((row) => ({ ...row }));
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  address: string;
  items: { productId: number; quantity: number }[];
}

export class OrderError extends Error {
  status: number;
  constructor(message: string, status: number = 400) {
    super(message);
    this.status = status;
  }
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (input.items.length === 0) {
    throw new OrderError("购物车为空");
  }
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new OrderError("商品数量不正确");
    }
  }

  const products = input.items.map((item) => {
    const product = getProductById(item.productId);
    if (!product) {
      throw new OrderError(`商品不存在（ID: ${item.productId}）`);
    }
    if (product.stock < item.quantity) {
      throw new OrderError(`「${product.name}」库存不足，仅剩 ${product.stock} 件`);
    }
    return { product, quantity: item.quantity };
  });

  const totalCents = products.reduce(
    (sum, { product, quantity }) => sum + product.priceCents * quantity,
    0
  );

  const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;

  db.exec("BEGIN");
  try {
    const result = db
      .prepare(
        `INSERT INTO orders (order_no, customer_name, phone, address, total_cents, status, payment_method)
         VALUES (?, ?, ?, ?, ?, 'unpaid', 'mock')`
      )
      .run(orderNo, input.customerName, input.phone, input.address, totalCents);
    const orderId = Number(result.lastInsertRowid);

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, price_cents, quantity, image)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const decrementStock = db.prepare(
      "UPDATE products SET stock = stock - ? WHERE id = ?"
    );
    for (const { product, quantity } of products) {
      insertItem.run(
        orderId,
        product.id,
        product.name,
        product.priceCents,
        quantity,
        product.image
      );
      decrementStock.run(quantity, product.id);
    }

    const payment = await createPayment(orderNo, totalCents);
    if (!payment.success) {
      throw new OrderError(payment.message ?? "支付失败", 402);
    }
    db.prepare(
      "UPDATE orders SET status = 'paid', payment_txn = ? WHERE id = ?"
    ).run(payment.transactionId, orderId);

    db.exec("COMMIT");
    return getOrderByNo(orderNo)!;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function getOrderByNo(orderNo: string): Order | undefined {
  const row = db
    .prepare(`SELECT ${ORDER_COLUMNS} FROM orders WHERE order_no = ?`)
    .get(orderNo) as unknown as Order | undefined;
  return row ? { ...row } : undefined;
}
