// 支付模块 —— 目前为「模拟支付」，下单即视为支付成功。
//
// 以后接入真实支付（微信 / 支付宝）时只需修改本文件：
//   1. createPayment：调用支付渠道下单接口，返回支付链接或二维码；
//   2. 新增一个回调接口（如 /api/payment/notify）调用 verifyPayment 校验支付结果，
//      校验通过后再把订单标记为已支付。
export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message?: string;
}

export async function createPayment(
  orderNo: string,
  totalCents: number
): Promise<PaymentResult> {
  void totalCents;
  return {
    success: true,
    transactionId: `MOCK-${orderNo}-${Date.now()}`,
  };
}

export async function verifyPayment(
  transactionId: string
): Promise<PaymentResult> {
  return { success: transactionId.startsWith("MOCK-"), transactionId };
}
