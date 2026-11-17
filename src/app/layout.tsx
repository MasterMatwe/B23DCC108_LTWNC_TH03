import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const lora = localFont({
  src: "./fonts/Lora-Regular.ttf",
  variable: "--font-lora",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Thư viện khoa CNTT",
    template: "%s | Thư viện khoa",
  },
  description:
    "Tra cứu tài liệu và đăng ký mượn sách tại thư viện khoa Công nghệ thông tin PTIT.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={lora.variable}>
      <body>
        <a className="skip-link" href="#main-content">
          Đến nội dung chính
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
