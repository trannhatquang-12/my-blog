import "./globals.css";

export const metadata = {
  title: "My Blog - Chia sẻ kiến thức & trải nghiệm",
  description: "Trang Blog hoàn chỉnh xây dựng với Next.js App Router và Supabase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
