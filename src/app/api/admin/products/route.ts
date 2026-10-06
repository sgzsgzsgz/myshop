import { isAdmin } from "@/lib/auth";
import { createProduct } from "@/lib/db";
import { parseProductForm } from "@/lib/product-form";
import { UploadError } from "@/lib/images";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }
  try {
    const fd = await request.formData();
    const input = await parseProductForm(fd);
    const product = createProduct(input);
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
