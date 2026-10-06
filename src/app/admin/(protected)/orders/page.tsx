import Image from "next/image";
import { getAllOrders, getOrderItems } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  const orders = getAllOrders();
  const items = getOrderItems(orders.map((o) => o.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">订单查看</h1>
      <p className="mt-1 text-sm text-gray-500">
        共 {orders.length} 笔订单（只读，历史订单不受商品删除影响）
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {orders.map((order) => {
          const orderItems = items.filter((i) => i.orderId === order.id);
          return (
            <div key={order.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {order.orderNo}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      order.status === "paid"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {order.status === "paid" ? "已支付" : "未支付"}
                  </span>
                </div>
                <span className="text-lg font-semibold text-rose-600">
                  {formatPrice(order.totalCents)}
                </span>
              </div>

              <div className="mt-3 grid gap-1 text-sm text-gray-600 md:grid-cols-2">
                <p>
                  收货人：{order.customerName}（{order.phone}）
                </p>
                <p>下单时间：{order.createdAt}</p>
                <p className="md:col-span-2">地址：{order.address}</p>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2 text-sm"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        sizes="40px"
                        unoptimized={item.image.startsWith("/uploads/")}
                        className="object-cover"
                      />
                    </div>
                    <span className="flex-1 text-gray-900">
                      {item.productName}
                    </span>
                    <span className="text-gray-500">
                      {formatPrice(item.priceCents)} × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <p className="rounded-2xl bg-white py-12 text-center text-gray-400 shadow-sm">
            还没有订单
          </p>
        )}
      </div>
    </div>
  );
}
