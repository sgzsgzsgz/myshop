import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  return (
    <div>
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6 text-sm">
            <Link href="/admin" className="font-bold text-indigo-600">
              后台管理
            </Link>
            <Link
              href="/admin"
              className="text-gray-700 hover:text-indigo-600"
            >
              商品管理
            </Link>
            <Link
              href="/admin/orders"
              className="text-gray-700 hover:text-indigo-600"
            >
              订单查看
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-gray-500 hover:text-indigo-600">
              回商城
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
