import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function BookNotFound() {
  return (
    <section className="container not-found-page">
      <span className="not-found-code">404</span>
      <p className="eyebrow">TRANG SÁCH CÒN THIẾU</p>
      <h1>Không tìm thấy sách</h1>
      <p>
        Đầu sách này không có trong danh mục của thư viện.
        <br />
        Bạn có thể quay lại và tìm một cuốn sách khác.
      </p>
      <Link className="button button-primary" href="/books" prefetch={false}>
        <Icon name="arrow-left" />
        Về danh mục sách
      </Link>
    </section>
  );
}
