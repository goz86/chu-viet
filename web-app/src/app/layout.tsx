import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "한글 쓰기 연습 · Korean Handwriting Practice",
  description: "Tạo bài tập luyện viết chữ Hàn dạng lưới ký tự, xuất PDF chuyên nghiệp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
