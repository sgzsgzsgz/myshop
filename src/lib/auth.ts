import crypto from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "admin_token";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function passwordConfigured(): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return typeof pw === "string" && pw.length > 0;
}

export async function verifyPassword(password: string): Promise<boolean> {
  if (!passwordConfigured()) return false;
  const expected = hashPassword(process.env.ADMIN_PASSWORD!);
  const actual = hashPassword(password);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}

export async function isAdmin(): Promise<boolean> {
  if (!passwordConfigured()) return false;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const expected = hashPassword(process.env.ADMIN_PASSWORD!);
  if (!token || token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
