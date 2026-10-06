"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/db";

export default function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: string[];
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(
    product ? (product.priceCents / 100).toString() : ""
  );
  const [category, setCategory] = useState(product?.category ?? "");
  const [stock, setStock] = useState(product?.stock.toString() ?? "0");
  const [label, setLabel] = useState("");
  const [bg, setBg] = useState("#e0e7ff");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product?.image ?? null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(product?.image ?? null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("description", description);
      fd.append("price", price);
      fd.append("category", category);
      fd.append("stock", stock);
      if (!product) {
        fd.append("label", label);
        fd.append("bg", bg);
      }
      if (imageFile) {
        fd.append("image", imageFile);
      }
      const res = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        { method: product ? "PUT" : "POST", body: fd }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "保存失败");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">商品名称 *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="例如：蓝牙音箱"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">分类 *</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
            list="category-options"
            placeholder="例如：数码"
            required
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">价格（元）*</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputCls}
            placeholder="例如：159.00"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">库存（件）*</label>
          <input
            type="number"
            step="1"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={inputCls}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">商品描述 *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputCls}
          rows={3}
          placeholder="介绍商品的特点、卖点…"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">商品图片</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-600 hover:file:bg-indigo-100"
        />
        <p className="text-xs text-gray-400">
          {isEdit
            ? "选择新图片可替换当前图片；不选则保持原图。"
            : "可选。不上传时会自动生成一张带文字的占位图。"}
        </p>
      </div>

      {preview && (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="图片预览"
            className="h-24 w-24 rounded-xl border border-gray-200 object-cover"
          />
          {(imageFile || product) && (
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setPreview(product?.image ?? null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-sm text-gray-500 hover:text-rose-600"
            >
              取消新图片
            </button>
          )}
        </div>
      )}

      {!isEdit && (
        <div className="grid gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">
              占位图文字（不上传图片时生效）
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={inputCls}
              placeholder="留空则用商品名前两个字"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">占位图底色</label>
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="h-11 w-16 cursor-pointer rounded-xl border border-gray-300"
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "保存中…" : isEdit ? "保存修改" : "添加商品"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="text-sm text-gray-500 hover:text-indigo-600"
        >
          取消
        </button>
      </div>
    </form>
  );
}
