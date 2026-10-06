import type { ProductInput } from "./db";
import { saveUploadedFile, savePlaceholderImage, UploadError } from "./images";

function getStr(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[c];
  });
}

// fallbackImage: 编辑时不换图则沿用旧图，新商品不传图则生成占位图
export async function parseProductForm(
  fd: FormData,
  fallbackImage?: string
): Promise<ProductInput> {
  const name = getStr(fd, "name");
  const description = getStr(fd, "description");
  const category = getStr(fd, "category");
  const priceStr = getStr(fd, "price");
  const stockStr = getStr(fd, "stock");
  const label = getStr(fd, "label");
  const bg = getStr(fd, "bg");

  if (!name) throw new UploadError("请填写商品名称");
  if (!description) throw new UploadError("请填写商品描述");
  if (!category) throw new UploadError("请填写商品分类");

  const priceCents = Math.round(parseFloat(priceStr) * 100);
  if (!Number.isFinite(priceCents) || priceCents <= 0) {
    throw new UploadError("价格必须是大于 0 的数字");
  }
  const stock = Number(stockStr);
  if (!Number.isInteger(stock) || stock < 0) {
    throw new UploadError("库存必须是不小于 0 的整数");
  }

  let image: string;
  const file = fd.get("image");
  if (file instanceof File && file.size > 0) {
    image = await saveUploadedFile(file);
  } else if (fallbackImage) {
    image = fallbackImage;
  } else {
    const safeLabel = escapeXml(label || name.slice(0, 2));
    const safeBg = /^#[0-9a-fA-F]{3,8}$/.test(bg) ? bg : "#e0e7ff";
    image = savePlaceholderImage(safeLabel, safeBg);
  }

  return { name, description, priceCents, image, category, stock };
}
