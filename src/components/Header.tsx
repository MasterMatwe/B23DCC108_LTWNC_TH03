"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError("");
    try {
      await signOut({ redirectTo: "/" });
    } catch {
      setSignOutError("Chưa thể đăng xuất. Vui lòng thử lại.");
    } finally {
      setSigningOut(false);
    }
  }
  return (
    <header className="site-header">
      <div className="container header-inner auth-header">
        <Link
          className="brand"
          href="/"
          aria-label="Thư viện khoa CNTT PTIT - Trang chủ"
        >
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="brand-text">
            <strong>
              PTIT<span> / </span>LIBRARY
            </strong>
            <small>THƯ VIỆN KHOA CNTT</small>
          </span>
        </Link>
        <nav aria-label="Điều hướng chính">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
            Trang chủ
          </Link>
          <Link
            href="/books"
            prefetch={false}
            aria-current={pathname.startsWith("/books") ? "page" : undefined}
          >
            Sách
          </Link>
          {session?.user && (
            <Link
              href="/loans"
              prefetch={false}
              aria-current={pathname === "/loans" ? "page" : undefined}
            >
              Sách đã mượn
            </Link>
          )}
          {session?.user.role === "admin" && (
            <Link
              href="/admin"
              prefetch={false}
              aria-current={pathname.startsWith("/admin") ? "page" : undefined}
            >
              Quản trị
            </Link>
          )}
        </nav>
        <div className="account-menu">
          {status === "loading" ? (
            <span className="account-loading" role="status">
              Đang tải tài khoản…
            </span>
          ) : session?.user ? (
            <>
              <span className="session-greeting">
                Xin chào, <strong>{session.user.name}</strong>{" "}
                <span>({session.user.role})</span>
              </span>
              <button
                className="logout-button"
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Đang đăng xuất…" : "Đăng xuất"}
              </button>
              {signOutError && (
                <span className="logout-error" role="alert">
                  {signOutError}
                </span>
              )}
            </>
          ) : (
            <Link
              className="signin-link"
              href="/login"
              prefetch={false}
              aria-current={pathname === "/login" ? "page" : undefined}
            >
              Đăng nhập<span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
