import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import type { Book } from "@/types";

export function BookCard({ book }: { book: Book }) {
  return (
    <article className="book-card">
      <Link className="book-card-link" href={`/books/${book.id}`}>
        <div className="book-card-stage">
          <BookCover book={book} />
          <span className="book-card-arrow">
            <Icon name="arrow-up-right" />
          </span>
        </div>
        <span className="book-card-category">{book.category}</span>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
      </Link>
      <span className="book-card-copies">{book.copies} bản trong thư viện</span>
    </article>
  );
}
