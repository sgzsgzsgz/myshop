import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/db";

export default function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          unoptimized={product.image.startsWith("/uploads/")}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {outOfStock && (
          <span className="absolute right-2 top-2 rounded-full bg-gray-800/80 px-2 py-0.5 text-xs text-white">
            缺货
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-1 font-medium text-gray-900 hover:text-indigo-600"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-xs text-gray-500">{product.category}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-semibold text-rose-600">
            {formatPrice(product.priceCents)}
          </span>
          {outOfStock ? (
            <span className="text-xs text-gray-400">暂时无货</span>
          ) : (
            <AddToCartButton product={product} />
          )}
        </div>
      </div>
    </div>
  );
}
