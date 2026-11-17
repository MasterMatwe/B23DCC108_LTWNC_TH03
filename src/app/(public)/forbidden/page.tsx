import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Không có quyền truy cập",
  robots: { index: false },
};

export default function ForbiddenPage() {
  return (
    <section className="container not-found-page forbidden-page">
      <span className="not-found-code">403</span>
      <p className="eyebrow">KHU VỰC GIỚI HẠN</p>
      <h1>Bạn không có quyền truy cập trang này</h1>
      <p>
        Tài khoản hiện tại chưa được cấp quyền vào khu vực này.
        <br />
        Bạn có thể tiếp tục tra cứu sách trong thư viện.
      </p>
      <Link className="button button-primary" href="/books" prefetch={false}>
        <Icon name="arrow-left" />
        Về danh mục sách
      </Link>
    </section>
  );
}
