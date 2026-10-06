import { createOrder, OrderError } from "@/lib/db";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }

  const { customerName, phone, address, items } = (body ?? {}) as {
    customerName?: unknown;
    phone?: unknown;
    address?: unknown;
    items?: unknown;
  };

  if (
    typeof customerName !== "string" ||
    customerName.trim().length === 0 ||
    customerName.trim().length > 50
  ) {
    return Response.json({ error: "请填写收货人姓名" }, { status: 400 });
  }
  if (typeof phone !== "string" || !/^1\d{10}$/.test(phone.trim())) {
    return Response.json({ error: "请填写正确的 11 位手机号" }, { status: 400 });
  }
  if (
    typeof address !== "string" ||
    address.trim().length < 5 ||
    address.trim().length > 200
  ) {
    return Response.json(
      { error: "请填写详细收货地址（不少于 5 个字）" },
      { status: 400 }
    );
  }
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "购物车为空" }, { status: 400 });
  }

  const parsedItems = items.map((item) => {
    const it = item as { productId?: unknown; quantity?: unknown };
    return { productId: Number(it.productId), quantity: Number(it.quantity) };
  });
  if (
    parsedItems.some(
      (i) =>
        !Number.isInteger(i.productId) ||
        i.productId <= 0 ||
        !Number.isInteger(i.quantity) ||
        i.quantity < 1
    )
  ) {
    return Response.json({ error: "商品数据不正确" }, { status: 400 });
  }

  try {
    const order = await createOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      items: parsedItems,
    });
    return Response.json({
      orderNo: order.orderNo,
      totalCents: order.totalCents,
    });
  } catch (error) {
    if (error instanceof OrderError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("创建订单失败:", error);
    return Response.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}
