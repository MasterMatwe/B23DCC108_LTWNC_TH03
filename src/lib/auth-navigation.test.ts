import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "./auth-navigation";

describe("Đường dẫn sau đăng nhập", () => {
  it("mặc định về trang mượn khi thiếu đường dẫn", () => {
    expect(safeCallbackUrl(undefined)).toBe("/loans");
    expect(safeCallbackUrl("")).toBe("/loans");
  });
  it("giữ query để quay lại đúng sách đã chọn", () => {
    expect(safeCallbackUrl("/loans?book=6")).toBe("/loans?book=6");
    expect(safeCallbackUrl("/books/20")).toBe("/books/20");
  });
  it("từ chối đường dẫn ngoài website hoặc ký tự điều khiển", () => {
    for (const value of [
      "https://example.com",
      "//example.com",
      "/\\example.com",
      "javascript:alert(1)",
      "/\n/example.com",
    ]) {
      expect(safeCallbackUrl(value)).toBe("/loans");
    }
  });
  it("không tạo vòng lặp quay lại trang đăng nhập", () => {
    expect(safeCallbackUrl("/login?callbackUrl=/admin")).toBe("/loans");
  });
});
