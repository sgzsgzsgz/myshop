import { isAdmin } from "@/lib/auth";
import { getProductById, updateProduct, deleteProduct } from "@/lib/db";
import { parseProductForm } from "@/lib/product-form";
import { UploadError, deleteUploadedFile } from "@/lib/images";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return Response.json({ error: "商品不存在" }, { status: 400 });
  }
  const existing = getProductById(productId);
  if (!existing) {
    return Response.json({ error: "商品不存在" }, { status: 404 });
  }
  try {
    const fd = await request.formData();
    const input = await parseProductForm(fd, existing.image);
    const product = updateProduct(productId, input);
    if (input.image !== existing.image) {
      deleteUploadedFile(existing.image);
    }
    return Response.json({ product });
  } catch (error) {
    if (error instanceof UploadError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return Response.json({ error: "商品不存在" }, { status: 400 });
  }
  deleteProduct(productId);
  return Response.json({ ok: true });
}
