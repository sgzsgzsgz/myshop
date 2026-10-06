import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const products = getProducts(q, category);
  const categories = getCategories();

  const chipBase =
    "rounded-full border px-4 py-1.5 text-sm transition hover:border-indigo-500 hover:text-indigo-600";
  const chipActive =
    "border-indigo-600 bg-indigo-600 text-white hover:text-white";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">好物商城</h1>
        <p className="mt-2 text-gray-500">精选好物，一站购齐</p>
      </div>

      <form action="/" method="GET" className="mx-auto mb-6 flex max-w-xl gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="搜索商品"
          className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500"
        />
        {category && <input type="hidden" name="category" value={category} />}
        <button
          type="submit"
          className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          搜索
        </button>
      </form>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <Link href="/" className={`${chipBase} ${category ? "" : chipActive}`}>
          全部
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/?category=${encodeURIComponent(c)}`}
            className={`${chipBase} ${category === c ? chipActive : ""}`}
          >
            {c}
          </Link>
        ))}
      </div>

      {q && (
        <p className="mb-4 text-sm text-gray-500">
          “{q}” 的搜索结果，共 {products.length} 件商品
          <Link href="/" className="ml-2 text-indigo-600 hover:underline">
            清除搜索
          </Link>
        </p>
      )}

      {products.length === 0 ? (
        <p className="py-16 text-center text-gray-400">没有找到相关商品</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
