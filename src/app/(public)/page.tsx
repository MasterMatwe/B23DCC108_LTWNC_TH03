import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { BookCard } from "@/components/BookCard";
import { Icon } from "@/components/Icon";
import { CATEGORIES } from "@/data/books";
import { CATEGORY_DETAILS } from "@/lib/book-presentation";
import { listBooks } from "@/lib/books";

export default async function HomePage() {
  const books = await listBooks();
  const categoryCount = new Set(books.map((book) => book.category)).size;
  const spotlight = books.find((book) => book.id === 6) ?? books[0];

  return (
    <>
      <section className="container hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-rule" />
            HỌC LIỆU CHO HÀNH TRÌNH CỦA BẠN
          </p>
          <h1 id="home-title">
            Thư viện
            <br />
            <span>khoa CNTT PTIT</span>
          </h1>
          <p className="hero-description">
            Mỗi trang sách, một góc nhìn mới.
            <br />
            Khám phá nguồn tài liệu chuyên ngành và tìm cuốn sách cho hành trình
            học tập của bạn.
          </p>
          <div className="hero-actions">
            <Link
              className="button button-primary"
              href="/books"
              prefetch={false}
            >
              Xem danh mục sách
              <Icon name="arrow-right" />
            </Link>
            <a className="text-link" href="#chuyen-muc">
              Khám phá chuyên mục<span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-stats">
            <Icon name="book" />
            <span>
              <strong>{books.length}</strong> đầu sách ·{" "}
              <strong>{categoryCount}</strong> chuyên mục
            </span>
            <span className="stats-rule" />
            <small>Sẵn sàng để khám phá</small>
          </div>
        </div>
        <div className="hero-display">
          <span className="hero-orbit orbit-one" aria-hidden="true" />
          <span className="hero-orbit orbit-two" aria-hidden="true" />
          <span className="shelf-caption">
            GÓC SÁCH CHUYÊN NGÀNH <span>01 / 04</span>
          </span>
          <div className="hero-back-book" aria-hidden="true">
            <span>LẬP TRÌNH</span>
            <b>C</b>
            <small>NỀN TẢNG & TƯ DUY</small>
          </div>
          <Link
            className="hero-featured-book"
            href={`/books/${spotlight.id}`}
            aria-label={`Xem sách ${spotlight.title}`}
          >
            <BookCover book={spotlight} />
          </Link>
          <div className="book-plinth" aria-hidden="true">
            <span>THƯ VIỆN KHOA CÔNG NGHỆ THÔNG TIN</span>
            <span>PTIT</span>
          </div>
        </div>
      </section>

      <section
        id="chuyen-muc"
        className="category-section"
        aria-labelledby="category-title"
      >
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">TỪ NỀN TẢNG ĐẾN CHUYÊN SÂU</p>
              <h2 id="category-title">Bạn muốn tìm hiểu điều gì?</h2>
            </div>
            <span className="section-index">
              {String(categoryCount).padStart(2, "0")} CHUYÊN MỤC
            </span>
          </div>
          <div className="category-grid">
            {CATEGORIES.map((category, index) => {
              const details = CATEGORY_DETAILS[category];
              const count = books.filter(
                (book) => book.category === category,
              ).length;
              return (
                <Link
                  className={`category-card ${details.className}`}
                  href={`/books?${new URLSearchParams({ q: "", category })}`}
                  key={category}
                  prefetch={false}
                >
                  <div className="category-card-top">
                    <span className="category-symbol" aria-hidden="true">
                      {details.symbol}
                    </span>
                    <span>0{index + 1}</span>
                  </div>
                  <h3>{category}</h3>
                  <p>{details.description}</p>
                  <div className="category-card-bottom">
                    <span>{count} đầu sách</span>
                    <Icon name="arrow-up-right" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="container featured-section"
        aria-labelledby="featured-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">TRÊN KỆ THƯ VIỆN</p>
            <h2 id="featured-title">Bắt đầu từ một cuốn sách</h2>
          </div>
          <Link className="text-link" href="/books" prefetch={false}>
            Xem tất cả
            <Icon name="arrow-right" />
          </Link>
        </div>
        <div className="book-grid">
          {books.slice(0, 4).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
      <section className="container library-note">
        <span className="note-symbol" aria-hidden="true">
          *
        </span>
        <div>
          <h2>Tri thức luôn có chỗ cho bạn.</h2>
          <p>
            Tra cứu tự do. Chọn tài liệu phù hợp. Bắt đầu hành trình học tập của
            riêng mình.
          </p>
        </div>
        <Link
          href="/books"
          prefetch={false}
          className="circle-link"
          aria-label="Khám phá danh mục sách"
        >
          <Icon name="arrow-up-right" />
        </Link>
      </section>
    </>
  );
}
