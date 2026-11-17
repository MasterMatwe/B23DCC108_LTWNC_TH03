import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "http://localhost:3000";
  return [
    { url: base },
    { url: `${base}/books` },
    ...db.books.map((book) => ({ url: `${base}/books/${book.id}` })),
  ];
}
