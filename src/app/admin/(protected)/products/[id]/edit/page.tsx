import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getProductById } from "@/lib/db";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }
  const product = getProductById(productId);
  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/admin"
        className="text-sm text-gray-500 hover:text-indigo-600"
      >
        ← 返回商品管理
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        编辑商品：{product.name}
      </h1>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <ProductForm product={product} categories={getCategories()} />
      </div>
    </div>
  );
}
