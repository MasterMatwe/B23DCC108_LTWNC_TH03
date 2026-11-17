import { CATEGORY_DETAILS } from "@/lib/book-presentation";
import type { Book } from "@/types";

export function BookCover({
  book,
  className = "",
}: {
  book: Book;
  className?: string;
}) {
  const details = CATEGORY_DETAILS[book.category];
  return (
    <div
      className={`book-cover ${details.className} ${className}`}
      aria-hidden="true"
    >
      <div className="cover-top">
        <span>PTIT / CNTT</span>
        <span>{String(book.id).padStart(3, "0")}</span>
      </div>
      <div className="cover-rule" />
      <span className="cover-category">{book.category}</span>
      <span className="cover-title">{book.title}</span>
      <div className="cover-art">
        <span>{details.symbol}</span>
        <i />
        <i />
        <i />
      </div>
      <span className="cover-author">{book.author}</span>
      <span className="cover-footer">TỦ SÁCH CHUYÊN NGÀNH</span>
    </div>
  );
}
