import { cookies } from "next/headers";
import { COOKIE_NAME, hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }
  if (typeof body.password !== "string" || body.password.length === 0) {
    return Response.json({ error: "请输入密码" }, { status: 400 });
  }

  const ok = await verifyPassword(body.password);
  if (!ok) {
    return Response.json({ error: "密码错误" }, { status: 401 });
  }

  const store = await cookies();
  store.set(COOKIE_NAME, hashPassword(body.password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 3600,
    secure: process.env.NODE_ENV === "production",
  });
  return Response.json({ ok: true });
}
