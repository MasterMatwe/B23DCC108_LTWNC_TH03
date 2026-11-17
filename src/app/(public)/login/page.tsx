import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { LoginForm } from "@/components/LoginForm";
import { safeCallbackUrl } from "@/lib/auth-navigation";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào thư viện khoa CNTT PTIT.",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ callbackUrl?: string | string[] }> };

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user) redirect("/");
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(
    Array.isArray(params.callbackUrl)
      ? params.callbackUrl[0]
      : params.callbackUrl,
  );
  const coverBook = db.books.find((book) => book.id === 6) ?? db.books[0];

  return (
    <div className="container login-page">
      <Link className="login-back text-link" href="/">
        <Icon name="arrow-left" />
        Về trang chủ
      </Link>
      <div className="login-panel">
        <section className="login-story" aria-labelledby="login-story-title">
          <p className="eyebrow">THƯ VIỆN KHOA CNTT PTIT</p>
          <h2 id="login-story-title">
            Một tài khoản.
            <br />
            <span>Cả một thư viện.</span>
          </h2>
          <p>Tiếp nối hành trình học tập với những cuốn sách dành cho bạn.</p>
          <div className="login-book-display" aria-hidden="true">
            <span className="login-book-orbit" />
            <BookCover book={coverBook} />
            <span className="login-shelf-line" />
          </div>
          <span className="login-story-footer">
            TRA CỨU · KHÁM PHÁ · HỌC TẬP
          </span>
        </section>
        <section className="login-form-panel" aria-labelledby="login-title">
          <span className="login-form-icon">
            <Icon name="book" />
          </span>
          <p className="eyebrow">CHÀO MỪNG BẠN TRỞ LẠI</p>
          <h1 id="login-title">Đăng nhập</h1>
          <p className="login-intro">
            Đăng nhập để truy cập khu vực thành viên và quản lý hoạt động mượn
            sách.
          </p>
          <LoginForm callbackUrl={callbackUrl} />
          <div className="login-help">
            <span>Chưa có tài khoản hoặc cần hỗ trợ?</span>
            <p>Liên hệ thủ thư để được hướng dẫn.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
