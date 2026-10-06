import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-gray-500">页面不存在</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
      >
        返回首页
      </Link>
    </div>
  );
}
