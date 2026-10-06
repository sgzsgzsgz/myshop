export function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}

export const ORDER_STATUS: Record<string, string> = {
  unpaid: "待支付",
  paid: "已支付",
  shipped: "已发货",
  completed: "已完成",
  cancelled: "已取消",
};
