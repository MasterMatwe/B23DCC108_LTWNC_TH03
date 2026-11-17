import { db } from "@/lib/db";
import type { Book } from "@/types";

export interface BookFilters {
  category?: string;
  q?: string;
}

export async function listBooks(filters: BookFilters = {}): Promise<Book[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, 800));
  const query = (filters.q ?? "")
    .trim()
    .normalize("NFC")
    .toLocaleLowerCase("vi-VN");

  return db.books.filter((book) => {
    const matchesCategory =
      !filters.category || book.category === filters.category;
    const matchesTitle = book.title
      .normalize("NFC")
      .toLocaleLowerCase("vi-VN")
      .includes(query);
    return matchesCategory && matchesTitle;
  });
}

export async function getBook(id: string): Promise<Book | undefined> {
  if (!/^[1-9]\d*$/.test(id)) return undefined;
  return db.books.find((book) => book.id === Number(id));
}
