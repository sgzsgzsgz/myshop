import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "好物商城 - 精选好物",
  description: "好物商城：精选数码、家居、服饰、食品、图书好物。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <footer className="mt-12 border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          好物商城 · 演示项目（模拟支付，不产生真实扣款）
        </footer>
      </body>
    </html>
  );
}
