import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Icon } from "@/components/Icon";
import { can } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Sách đã mượn",
  robots: { index: false },
};

export default async function LoansPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Floans");

  return (
    <div className="member-home-page">
      <header className="member-page-heading">
        <div>
          <h1>
            Sách đã mượn<span className="title-dot">.</span>
          </h1>
          <p>Xin chào, {session.user.name}. Bạn đã đăng nhập thành công.</p>
        </div>
      </header>
      <section
        className="member-welcome"
        aria-labelledby="member-welcome-title"
      >
        <span className="member-welcome-icon">
          <Icon name="book" />
        </span>
        <p className="eyebrow">KHÔNG GIAN THÀNH VIÊN</p>
        <h2 id="member-welcome-title">Chào mừng bạn đến với thư viện.</h2>
        <p>
          Chức năng gửi yêu cầu và xem danh sách mượn đang được chuẩn bị. Bạn có
          thể tiếp tục khám phá tài liệu trong danh mục sách.
        </p>
        <div className="member-welcome-actions">
          <Link
            className="button button-primary"
            href="/books"
            prefetch={false}
          >
            Khám phá danh mục
            <Icon name="arrow-right" />
          </Link>
          {can(session.user.role, "loan:review") && (
            <Link className="text-link" href="/admin" prefetch={false}>
              Đến trang quản trị
              <Icon name="arrow-up-right" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
