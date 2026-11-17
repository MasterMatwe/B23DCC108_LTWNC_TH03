"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="container header-inner">
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
        </nav>
        <span className="header-note">
          <span />
          Không gian tri thức
        </span>
      </div>
    </header>
  );
}
