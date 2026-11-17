import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <main id="main-content" className="container not-found-page">
      <span className="not-found-code">404</span>
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn bạn đang tìm không tồn tại.</p>
      <Link className="button button-primary" href="/">
        <Icon name="arrow-left" />
        Về trang chủ
      </Link>
    </main>
  );
}
