import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductActions from "@/components/ProductActions";
import { getProductById } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductPage({
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600">
        ← 返回首页
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={product.image.startsWith("/uploads/")}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-gray-500">{product.category}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-semibold text-rose-600">
            {formatPrice(product.priceCents)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            库存：
            {product.stock > 0 ? `${product.stock} 件` : "缺货"}
          </p>
          <p className="mt-6 leading-relaxed text-gray-700">
            {product.description}
          </p>
          <div className="mt-auto pt-8">
            <ProductActions product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
