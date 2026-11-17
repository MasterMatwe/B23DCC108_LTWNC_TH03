import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCard } from "@/components/BookCard";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { getBook } from "@/lib/books";
import { CATEGORY_DETAILS } from "@/lib/book-presentation";
import { db } from "@/lib/db";
import { serverTime } from "@/lib/time";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return db.books.slice(0, 12).map((book) => ({ id: String(book.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();
  return {
    title: `${book.title} – ${book.author}`,
    description: `Sách ${book.category}, thư viện có ${book.copies} bản.`,
    alternates: { canonical: `/books/${book.id}` },
  };
}

export default async function BookPage({ params }: Props) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();
  const related = db.books
    .filter((item) => item.category === book.category && item.id !== book.id)
    .slice(0, 3);
  return (
    <div className="container detail-page">
      <nav className="breadcrumbs" aria-label="Đường dẫn">
        <Link href="/">Trang chủ</Link>
        <Icon name="chevron-right" />
        <Link href="/books" prefetch={false}>
          Danh mục sách
        </Link>
        <Icon name="chevron-right" />
        <span aria-current="page">Chi tiết sách</span>
      </nav>
      <section className="book-detail" aria-labelledby="book-title">
        <div
          className={`detail-cover-stage ${CATEGORY_DETAILS[book.category].className}`}
        >
          <span className="detail-stage-label">
            TỦ SÁCH CHUYÊN NGÀNH / PTIT
          </span>
          <BookCover book={book} />
          <span className="detail-stage-number">
            #{String(book.id).padStart(3, "0")}
          </span>
        </div>
        <div className="detail-content">
          <Link
            className={`category-tag ${CATEGORY_DETAILS[book.category].className}`}
            href={`/books?${new URLSearchParams({ category: book.category })}`}
            prefetch={false}
          >
            {book.category}
            <Icon name="arrow-up-right" />
          </Link>
          <h1 id="book-title">{book.title}</h1>
          <p className="detail-author">
            Tác giả: <strong>{book.author}</strong>
          </p>
          <dl className="book-facts">
            <div>
              <dt>Chuyên mục:</dt>
              <dd>{book.category}</dd>
            </div>
            <div>
              <dt>Số bản:</dt>
              <dd>
                <strong>{book.copies}</strong>
                <span className="fact-note">Tổng số bản của thư viện</span>
              </dd>
            </div>
            <div>
              <dt>Mã sách:</dt>
              <dd>#{String(book.id).padStart(3, "0")}</dd>
            </div>
          </dl>
          <Link
            className="button button-primary borrow-link"
            href={`/loans?book=${book.id}`}
            prefetch={false}
          >
            Mượn sách này
            <Icon name="arrow-right" />
          </Link>
          <p className="borrowing-note">
            <Icon name="book" />
            Sinh viên cần đăng nhập để gửi yêu cầu mượn.
          </p>
          <p className="render-time">
            <Icon name="clock" />
            Cập nhật lúc: <time>{serverTime()}</time>
            <span>· Giờ Việt Nam</span>
          </p>
        </div>
      </section>
      <section className="related-section" aria-labelledby="related-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TIẾP TỤC KHÁM PHÁ</p>
            <h2 id="related-title">Cùng một chuyên mục</h2>
          </div>
          <Link
            className="text-link"
            href={`/books?${new URLSearchParams({ category: book.category })}`}
            prefetch={false}
          >
            Xem chuyên mục
            <Icon name="arrow-right" />
          </Link>
        </div>
        <div className="book-grid related-grid">
          {related.map((item) => (
            <BookCard key={item.id} book={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
