import Image from "next/image";
import { getOrderItems, getOrdersByPhone, type OrderItem } from "@/lib/db";
import { formatPrice, ORDER_STATUS } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;
  const trimmed = phone?.trim() ?? "";
  const orders = trimmed ? getOrdersByPhone(trimmed) : [];

  const itemsByOrder = new Map<number, OrderItem[]>();
  if (orders.length > 0) {
    for (const item of getOrderItems(orders.map((o) => o.id))) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>
      <p className="mt-2 text-sm text-gray-500">
        输入下单时填写的手机号，查询订单
      </p>

      <form action="/orders" method="GET" className="mt-6 flex gap-2">
        <input
          name="phone"
          defaultValue={trimmed}
          placeholder="请输入 11 位手机号"
          inputMode="numeric"
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          查询
        </button>
      </form>

      {trimmed && orders.length === 0 && (
        <p className="mt-10 text-center text-gray-400">
          该手机号暂无订单记录
        </p>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                订单号 {order.orderNo}
              </p>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                {ORDER_STATUS[order.status] ?? order.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              下单时间：{order.createdAt}
            </p>

            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4">
              {(itemsByOrder.get(order.id) ?? []).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm text-gray-900">
                      {item.productName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatPrice(item.priceCents)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(item.priceCents * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">
                收货人：{order.customerName} · {order.phone}
              </p>
              <p className="font-medium text-gray-900">
                合计：
                <span className="text-lg font-semibold text-rose-600">
                  {formatPrice(order.totalCents)}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
