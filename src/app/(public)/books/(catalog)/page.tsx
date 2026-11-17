import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { CATEGORIES } from "@/data/books";
import { CATEGORY_DETAILS } from "@/lib/book-presentation";
import { listBooks } from "@/lib/books";
import { db } from "@/lib/db";
import { serverTime } from "@/lib/time";

export const metadata: Metadata = {
  title: "Danh mục sách",
  description:
    "Tìm kiếm và tra cứu 24 đầu sách thuộc 4 chuyên mục tại thư viện khoa CNTT PTIT.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = first(params.q);
  const rawCategory = first(params.category);
  const category = CATEGORIES.find((item) => item === rawCategory) ?? "";
  const books = await listBooks({ q, category });
  const hasFilter = Boolean(q || category);

  return (
    <div className="container catalog-page">
      <nav className="breadcrumbs" aria-label="Đường dẫn">
        <Link href="/">Trang chủ</Link>
        <Icon name="chevron-right" />
        <span aria-current="page">Danh mục sách</span>
      </nav>
      <header className="page-heading">
        <div>
          <p className="eyebrow">KHÁM PHÁ NGUỒN HỌC LIỆU</p>
          <h1>
            Danh mục sách<span className="title-dot">.</span>
          </h1>
          <p>Tìm một cuốn sách, mở thêm một hướng đi.</p>
        </div>
        <span className="collection-count">
          <strong>{db.books.length}</strong>đầu sách trong thư viện
        </span>
      </header>
      <div className="catalog-layout">
        <aside className="catalog-sidebar" aria-label="Chuyên mục sách">
          <h2>CHUYÊN MỤC</h2>
          <Link
            className={`category-filter ${!category ? "selected" : ""}`}
            href={`/books?${new URLSearchParams({ q, category: "" })}`}
            prefetch={false}
            aria-current={!category ? "true" : undefined}
          >
            <span>Tất cả sách</span>
            <span>{db.books.length}</span>
          </Link>
          {CATEGORIES.map((item) => (
            <Link
              className={`category-filter ${category === item ? "selected" : ""}`}
              href={`/books?${new URLSearchParams({ q, category: item })}`}
              key={item}
              prefetch={false}
              aria-current={category === item ? "true" : undefined}
            >
              <span>
                <i
                  className={`category-dot ${CATEGORY_DETAILS[item].className}`}
                />
                {item}
              </span>
              <span>
                {db.books.filter((book) => book.category === item).length}
              </span>
            </Link>
          ))}
          <div className="sidebar-note">
            <Icon name="book" />
            <p>Mỗi cuốn sách là một điểm khởi đầu.</p>
            <span>THƯ VIỆN KHOA CNTT</span>
          </div>
        </aside>
        <section className="catalog-results" aria-label="Tra cứu sách">
          <form action="/books" method="get" className="filter-form">
            <div className="field search-field">
              <label htmlFor="q">Tìm sách</label>
              <div className="search-input">
                <Icon name="search" />
                <input
                  id="q"
                  name="q"
                  type="search"
                  placeholder="Nhập tên cuốn sách bạn cần…"
                  defaultValue={q}
                />
              </div>
            </div>
            <div className="field category-select">
              <label htmlFor="category">Chuyên mục</label>
              <select id="category" name="category" defaultValue={category}>
                <option value="">Tất cả chuyên mục</option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="button button-primary filter-submit"
              type="submit"
            >
              <Icon name="search" />
              Lọc
            </button>
          </form>
          <div className="results-toolbar">
            <p>
              Tìm thấy <strong>{books.length}</strong> sách
            </p>
            {hasFilter && (
              <Link className="clear-filter" href="/books" prefetch={false}>
                Xóa bộ lọc<span aria-hidden="true"> ×</span>
              </Link>
            )}
          </div>
          {books.length ? (
            <div className="book-table-wrap">
              <table className="book-table" role="table">
                <caption className="sr-only">
                  Danh sách sách trong thư viện
                </caption>
                <thead>
                  <tr role="row">
                    <th scope="col">TÊN SÁCH</th>
                    <th scope="col">TÁC GIẢ</th>
                    <th scope="col">CHUYÊN MỤC</th>
                    <th scope="col">SỐ BẢN</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} role="row">
                      <td role="cell">
                        <Link
                          className="table-book-link"
                          href={`/books/${book.id}`}
                        >
                          <span
                            className={`mini-spine ${CATEGORY_DETAILS[book.category].className}`}
                            aria-hidden="true"
                          />
                          <span>
                            <small>#{String(book.id).padStart(3, "0")}</small>
                            <strong>{book.title}</strong>
                          </span>
                          <Icon name="arrow-up-right" />
                        </Link>
                      </td>
                      <td role="cell">
                        <span className="mobile-cell-label" aria-hidden="true">
                          Tác giả
                        </span>
                        {book.author}
                      </td>
                      <td role="cell">
                        <span
                          className={`category-tag ${CATEGORY_DETAILS[book.category].className}`}
                        >
                          {book.category}
                        </span>
                      </td>
                      <td role="cell">
                        <span className="copies-badge">
                          <span className="sr-only">Số bản: </span>
                          {book.copies}
                          <span className="mobile-cell-label"> bản</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Icon name="search" />
              </span>
              <h2>Không tìm thấy sách nào</h2>
              <p>Thử một từ khóa khác hoặc chọn lại chuyên mục.</p>
              <Link className="text-link" href="/books" prefetch={false}>
                Xem tất cả sách
                <Icon name="arrow-right" />
              </Link>
            </div>
          )}
          <p className="render-time">
            <Icon name="clock" />
            Render lúc: <time>{serverTime()}</time>
            <span>· Giờ Việt Nam</span>
          </p>
        </section>
      </div>
    </div>
  );
}
