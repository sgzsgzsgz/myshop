"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`确定删除「${name}」吗？删除后无法恢复。`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        window.alert(data.error ?? "删除失败");
        return;
      }
      router.refresh();
    } catch {
      window.alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg px-3 py-1.5 text-sm text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
    >
      {loading ? "删除中…" : "删除"}
    </button>
  );
}
