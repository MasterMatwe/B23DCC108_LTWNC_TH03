import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getBook, listBooks } from "./books";

describe("Tra cứu sách công khai", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function search(filters: Parameters<typeof listBooks>[0] = {}) {
    const result = listBooks(filters);
    await vi.advanceTimersByTimeAsync(800);
    return result;
  }

  it("trả đủ 24 đầu sách và 4 chuyên mục khi chưa lọc", async () => {
    const books = await search();
    expect(books).toHaveLength(24);
    expect(new Set(books.map((book) => book.category)).size).toBe(4);
  });
  it("lọc chuyên mục Lập trình còn 6 sách", async () => {
    expect(await search({ category: "Lập trình" })).toHaveLength(6);
  });
  it("tìm tên không phân biệt hoa thường và bỏ khoảng trắng thừa", async () => {
    expect(await search({ q: "  MẠNG  " })).toHaveLength(4);
  });
  it("kết hợp từ khóa và chuyên mục thay vì chỉ áp dụng một bộ lọc", async () => {
    expect(await search({ q: "lập trình" })).toHaveLength(5);
    expect(
      await search({ q: "lập trình", category: "Lập trình" }),
    ).toHaveLength(4);
  });
  it("tìm cơ sở được 3 sách và trả mảng rỗng cho từ khóa không có", async () => {
    expect(await search({ q: "cơ sở" })).toHaveLength(3);
    expect(await search({ q: "zzz" })).toEqual([]);
  });
  it("lấy được sách ngoài 12 đường dẫn sinh trước", async () => {
    expect((await getBook("20"))?.title).toBe("Giải tích 1");
  });
  it("không lấy nhầm sách khi id không tồn tại hoặc sai định dạng", async () => {
    for (const id of ["999", "6abc", "-1", "1.5"])
      expect(await getBook(id)).toBeUndefined();
  });
});
