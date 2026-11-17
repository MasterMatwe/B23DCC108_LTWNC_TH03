import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Icon } from "@/components/Icon";
import { ReviewLoanButton } from "@/components/ReviewLoanButton";
import { db } from "@/lib/db";
import { formatDate, TERM_LABEL } from "@/lib/format";
import { can } from "@/lib/permissions";
import { reviewLoan } from "./actions";

export const metadata: Metadata = {
  title: "Quản trị thư viện",
  robots: { index: false },
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Fadmin");
  if (!can(session.user.role, "loan:review")) redirect("/forbidden");

  const pending = db.loans.filter((loan) => loan.status === "pending");
  const approvedCount = db.loans.filter(
    (loan) => loan.status === "approved",
  ).length;
  const rejectedCount = db.loans.filter(
    (loan) => loan.status === "rejected",
  ).length;

  return (
    <div className="admin-page">
      <header className="member-page-heading">
        <div>
          <h1>
            Duyệt yêu cầu mượn<span className="title-dot">.</span>
          </h1>
          <p>Kiểm tra và xử lý các phiếu đăng ký của sinh viên.</p>
        </div>
        <span className="staff-badge">
          <span />
          TÀI KHOẢN THỦ THƯ
        </span>
      </header>
      <section className="review-stats" aria-label="Thống kê yêu cầu mượn">
        <div className="review-stat stat-pending">
          <p>
            Chờ duyệt: <strong>{pending.length}</strong>
          </p>
          <span>Các phiếu cần được xử lý</span>
        </div>
        <div className="review-stat stat-approved">
          <p>
            Đã duyệt: <strong>{approvedCount}</strong>
          </p>
          <span>Các yêu cầu đã được chấp thuận</span>
        </div>
        <div className="review-stat stat-rejected">
          <p>
            Từ chối: <strong>{rejectedCount}</strong>
          </p>
          <span>Các yêu cầu không được chấp thuận</span>
        </div>
      </section>
      <section className="review-section" aria-labelledby="pending-title">
        <div className="review-section-heading">
          <div>
            <p className="eyebrow">HỘP THƯ YÊU CẦU</p>
            <h2 id="pending-title">
              Đang chờ xử lý <span>{pending.length}</span>
            </h2>
          </div>
          <span className="review-scope">Chỉ hiển thị phiếu chờ duyệt</span>
        </div>
        {pending.length > 0 ? (
          <div className="review-table-wrap">
            <table className="review-table" role="table">
              <caption className="sr-only">
                Các yêu cầu mượn sách đang chờ duyệt
              </caption>
              <thead>
                <tr role="row">
                  <th scope="col">PHIẾU / TÀI LIỆU</th>
                  <th scope="col">NGƯỜI MƯỢN</th>
                  <th scope="col">NGÀY LẤY</th>
                  <th scope="col">THỜI HẠN</th>
                  <th scope="col">XỬ LÝ</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((loan) => {
                  const book = db.books.find((item) => item.id === loan.bookId);
                  return (
                    <tr key={loan.id} role="row">
                      <td role="cell">
                        <span className="review-id">
                          PHIẾU #{String(loan.id).padStart(3, "0")}
                        </span>
                        {book ? (
                          <Link
                            className="review-book-title"
                            href={`/books/${book.id}`}
                          >
                            {book.title}
                          </Link>
                        ) : (
                          <strong className="review-book-title">
                            Sách không còn trong danh mục
                          </strong>
                        )}
                        <span className="review-quantity">
                          {loan.quantity} quyển
                        </span>
                      </td>
                      <td role="cell">
                        <span
                          className="review-mobile-label"
                          aria-hidden="true"
                        >
                          Người mượn
                        </span>
                        <span className="borrower-email">{loan.userEmail}</span>
                      </td>
                      <td role="cell">
                        <span
                          className="review-mobile-label"
                          aria-hidden="true"
                        >
                          Ngày lấy
                        </span>
                        <time dateTime={loan.pickupDate}>
                          {formatDate(loan.pickupDate)}
                        </time>
                      </td>
                      <td role="cell">
                        <span
                          className="review-mobile-label"
                          aria-hidden="true"
                        >
                          Thời hạn
                        </span>
                        {TERM_LABEL[loan.term]}
                      </td>
                      <td role="cell">
                        <div className="review-actions">
                          <form
                            action={reviewLoan.bind(null, loan.id, "approved")}
                            aria-label={`Duyệt phiếu ${loan.id}`}
                          >
                            <ReviewLoanButton decision="approved" />
                          </form>
                          <form
                            action={reviewLoan.bind(null, loan.id, "rejected")}
                            aria-label={`Từ chối phiếu ${loan.id}`}
                          >
                            <ReviewLoanButton decision="rejected" />
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state review-empty">
            <span className="empty-icon">
              <Icon name="book" />
            </span>
            <h2>Đã xử lý hết yêu cầu</h2>
            <p>Hiện không có phiếu mượn nào đang chờ duyệt.</p>
          </div>
        )}
      </section>
    </div>
  );
}
