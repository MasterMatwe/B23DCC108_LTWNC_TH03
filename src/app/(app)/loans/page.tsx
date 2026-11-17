import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Icon } from "@/components/Icon";
import LoanForm from "@/components/LoanForm";
import { CancelLoanButton } from "@/components/CancelLoanButton";
import { getBook } from "@/lib/books";
import { CATEGORY_DETAILS } from "@/lib/book-presentation";
import { db } from "@/lib/db";
import { formatDate, STATUS_LABEL, TERM_LABEL } from "@/lib/format";
import { listLoans, parseStatus } from "@/lib/loans";
import { can } from "@/lib/permissions";
import { cancelLoanAction, createLoanAction } from "./actions";

export const metadata: Metadata = {
  title: "Sách đã mượn",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function LoansPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user.email) redirect("/login?callbackUrl=%2Floans");
  const role = session.user.role;
  if (!can(role, "loan:view-own") && !can(role, "loan:view-all"))
    redirect("/forbidden");

  const params = await searchParams;
  const status = parseStatus(first(params.status));
  const viewer = { email: session.user.email, role };
  const result = listLoans(viewer, status, Number(first(params.page) || 1));
  const defaultBook = await getBook(first(params.book));
  const canCreate = can(role, "loan:create");
  const showAll = can(role, "loan:view-all");

  function pageHref(page: number): string {
    const query = new URLSearchParams({
      status: status ?? "",
      page: String(page),
    });
    if (defaultBook) query.set("book", String(defaultBook.id));
    return `/loans?${query}`;
  }

  return (
    <div className="loans-page">
      <header className="member-page-heading">
        <div>
          <h1>
            Sách đã mượn<span className="title-dot">.</span>
          </h1>
          <p>
            {showAll
              ? "Theo dõi toàn bộ yêu cầu mượn của sinh viên."
              : "Quản lý những cuốn sách trên hành trình học tập của bạn."}
          </p>
        </div>
        {canCreate ? (
          <a className="button loan-heading-action" href="#loan-request">
            <Icon name="book" />
            Đăng ký mượn sách
          </a>
        ) : (
          <Link className="text-link" href="/admin" prefetch={false}>
            Duyệt yêu cầu
            <Icon name="arrow-up-right" />
          </Link>
        )}
      </header>
      <div
        className={`loans-layout ${canCreate ? "loans-with-form" : "loans-admin-view"}`}
      >
        <section
          className="loan-list-section"
          aria-labelledby="loan-list-title"
        >
          <div className="loan-list-heading">
            <div>
              <p className="eyebrow">
                {showAll ? "TOÀN BỘ PHIẾU MƯỢN" : "PHIẾU MƯỢN CỦA BẠN"}
              </p>
              <h2 id="loan-list-title">Danh sách yêu cầu</h2>
            </div>
            <span className="loan-list-icon">
              <Icon name="book" />
            </span>
          </div>
          <form className="loan-filter" action="/loans" method="get">
            <div>
              <label htmlFor="loan-status">Trạng thái</label>
              <select
                id="loan-status"
                name="status"
                defaultValue={status ?? ""}
              >
                <option value="">Tất cả</option>
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {defaultBook && (
              <input type="hidden" name="book" value={defaultBook.id} />
            )}
            <button className="button loan-filter-submit" type="submit">
              Lọc
              <Icon name="search" />
            </button>
            {status && (
              <Link
                className="loan-clear-filter"
                href={defaultBook ? `/loans?book=${defaultBook.id}` : "/loans"}
                prefetch={false}
              >
                Xóa bộ lọc
              </Link>
            )}
          </form>
          <div className="loan-result-summary">
            <p>
              Tìm thấy <strong>{result.total}</strong> yêu cầu
            </p>
            <span>
              {result.total
                ? `${(result.page - 1) * 10 + 1}–${Math.min(result.page * 10, result.total)}`
                : "0"}{" "}
              / {result.total} phiếu
            </span>
          </div>
          {result.items.length ? (
            <div className="loan-table-wrap">
              <table
                className={`loan-table ${showAll ? "loan-table-all" : "loan-table-own"}`}
                role="table"
              >
                <caption className="sr-only">
                  {showAll
                    ? "Yêu cầu mượn sách của tất cả sinh viên"
                    : "Yêu cầu mượn sách của bạn"}
                </caption>
                <thead>
                  <tr role="row">
                    <th scope="col">SÁCH</th>
                    {showAll && <th scope="col">NGƯỜI MƯỢN</th>}
                    <th scope="col">NGÀY LẤY</th>
                    <th scope="col">THỜI HẠN</th>
                    <th scope="col">SỐ QUYỂN</th>
                    <th scope="col">TRẠNG THÁI</th>
                    {canCreate && <th scope="col">THAO TÁC</th>}
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((loan) => (
                    <tr key={loan.id} role="row">
                      <td role="cell">
                        <div className="loan-book-cell">
                          <span
                            className={`mini-spine ${loan.bookCategory ? CATEGORY_DETAILS[loan.bookCategory].className : "programming"}`}
                            aria-hidden="true"
                          />
                          <div>
                            <span className="loan-ticket">
                              PHIẾU #{String(loan.id).padStart(3, "0")}
                            </span>
                            <Link
                              className="loan-book-title"
                              href={`/books/${loan.bookId}`}
                            >
                              {loan.bookTitle}
                            </Link>
                          </div>
                        </div>
                      </td>
                      {showAll && (
                        <td role="cell">
                          <span
                            className="loan-mobile-label"
                            aria-hidden="true"
                          >
                            Người mượn
                          </span>
                          <span className="loan-borrower">
                            {loan.userEmail}
                          </span>
                        </td>
                      )}
                      <td role="cell">
                        <span className="loan-mobile-label" aria-hidden="true">
                          Ngày lấy
                        </span>
                        <time dateTime={loan.pickupDate}>
                          {formatDate(loan.pickupDate)}
                        </time>
                      </td>
                      <td role="cell">
                        <span className="loan-mobile-label" aria-hidden="true">
                          Thời hạn
                        </span>
                        {TERM_LABEL[loan.term]}
                      </td>
                      <td role="cell">
                        <span className="loan-mobile-label" aria-hidden="true">
                          Số quyển
                        </span>
                        <span className="loan-row-quantity">
                          {loan.quantity} quyển
                        </span>
                      </td>
                      <td role="cell">
                        <span className="loan-mobile-label" aria-hidden="true">
                          Trạng thái
                        </span>
                        <span
                          className={`loan-status loan-status-${loan.status}`}
                        >
                          {STATUS_LABEL[loan.status]}
                        </span>
                      </td>
                      {canCreate && (
                        <td role="cell">
                          {loan.status === "pending" &&
                          loan.userEmail === viewer.email ? (
                            <form
                              action={cancelLoanAction.bind(null, loan.id)}
                              aria-label={`Hủy phiếu ${loan.id}`}
                            >
                              <CancelLoanButton />
                            </form>
                          ) : (
                            <span
                              className="loan-no-action"
                              aria-label="Không thể hủy"
                            >
                              —
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state loan-empty">
              <span className="empty-icon">
                <Icon name="book" />
              </span>
              <h3>Chưa có yêu cầu phù hợp</h3>
              <p>Thử chọn trạng thái khác để xem các phiếu mượn.</p>
            </div>
          )}
          <nav className="loan-pagination" aria-label="Phân trang yêu cầu">
            <div>
              {result.page > 1 ? (
                <Link
                  className="loan-page-link"
                  href={pageHref(result.page - 1)}
                  prefetch={false}
                >
                  <Icon name="arrow-left" />
                  Trước
                </Link>
              ) : (
                <span className="loan-page-link disabled" aria-disabled="true">
                  <Icon name="arrow-left" />
                  Trước
                </span>
              )}
            </div>
            <p>
              Trang {result.page}/{result.totalPages}
            </p>
            <div>
              {result.page < result.totalPages ? (
                <Link
                  className="loan-page-link"
                  href={pageHref(result.page + 1)}
                  prefetch={false}
                >
                  Sau
                  <Icon name="arrow-right" />
                </Link>
              ) : (
                <span className="loan-page-link disabled" aria-disabled="true">
                  Sau
                  <Icon name="arrow-right" />
                </span>
              )}
            </div>
          </nav>
          <p className="loan-list-note">
            <Icon name="clock" />
            {showAll
              ? "Xử lý các phiếu chờ duyệt tại trang Quản trị."
              : "Chỉ phiếu đang chờ duyệt của bạn mới có thể hủy."}
          </p>
        </section>
        {canCreate && (
          <aside
            className="loan-request-panel"
            id="loan-request"
            aria-labelledby="loan-request-title"
          >
            <div className="loan-request-heading">
              <span className="eyebrow">PHIẾU ĐĂNG KÝ</span>
              <Icon name="book" />
            </div>
            <h2 id="loan-request-title">Đăng ký mượn sách</h2>
            <p className="loan-request-intro">
              Chọn tài liệu và ngày bạn muốn đến thư viện. Tất cả các trường đều
              bắt buộc.
            </p>
            <LoanForm
              key={defaultBook?.id ?? "new-loan"}
              books={db.books}
              defaultBookId={defaultBook?.id}
              action={createLoanAction}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
