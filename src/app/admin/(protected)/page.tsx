import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import DeleteProductButton from "@/components/DeleteProductButton";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const products = getProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm text-white transition hover:bg-indigo-700"
        >
          + 添加商品
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">商品</th>
              <th className="px-4 py-3 font-medium">分类</th>
              <th className="px-4 py-3 font-medium">价格</th>
              <th className="px-4 py-3 font-medium">库存</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="48px"
                        unoptimized={product.image.startsWith("/uploads/")}
                        className="object-cover"
                      />
                    </div>
                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {product.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{product.category}</td>
                <td className="px-4 py-3 font-medium text-rose-600">
                  {formatPrice(product.priceCents)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {product.stock > 0 ? `${product.stock} 件` : "缺货"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="rounded-lg px-3 py-1.5 text-sm text-indigo-600 transition hover:bg-indigo-50"
                  >
                    编辑
                  </Link>
                  <DeleteProductButton id={product.id} name={product.name} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  还没有商品，点击右上角「添加商品」开始上架
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
