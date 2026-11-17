import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateBooks } from "@/data/books";
import { today, toLoanData, toLoanInput, validateLoan } from "./loan-validate";
import type { LoanInput } from "./loan-validate";

const books = generateBooks(24);
const valid: LoanInput = {
  bookId: "6",
  pickupDate: "2026-12-02",
  term: "14",
  quantity: "1",
  reason: "Mượn tài liệu phục vụ môn học",
};

describe("Kiểm tra phiếu đăng ký mượn", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T03:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("dữ liệu hợp lệ không có lỗi, ngày hôm nay cũng được chấp nhận", () => {
    expect(validateLoan(valid, books)).toEqual({});
    expect(validateLoan({ ...valid, pickupDate: today() }, books)).toEqual({});
  });
  it("form trống báo đủ lỗi cho năm trường", () => {
    const input = toLoanInput({});
    expect(validateLoan(input, books)).toEqual({
      bookId: "Hãy chọn sách",
      pickupDate: "Hãy chọn ngày",
      term: "Hãy chọn thời hạn",
      quantity: "Số quyển phải từ 1 trở lên",
      reason: "Lý do tối thiểu 10 ký tự",
    });
  });
  it("không chấp nhận sách giả hoặc id sai định dạng", () => {
    for (const bookId of ["999", "6abc", "-1"])
      expect(validateLoan({ ...valid, bookId }, books).bookId).toBe(
        "Hãy chọn sách",
      );
  });
  it("từ chối ngày quá khứ và ngày không có trong lịch", () => {
    expect(
      validateLoan({ ...valid, pickupDate: "2026-11-16" }, books).pickupDate,
    ).toBe("Ngày lấy sách không được ở quá khứ");
    for (const pickupDate of ["2026-02-30", "2026-13-01", "02/12/2026"])
      expect(validateLoan({ ...valid, pickupDate }, books).pickupDate).toBe(
        "Hãy chọn ngày",
      );
  });
  it("tính ngày hôm nay theo múi giờ Việt Nam tại ranh giới ngày UTC", () => {
    vi.setSystemTime(new Date("2026-11-17T18:30:00Z"));
    expect(today()).toBe("2026-11-18");
  });
  it("số quyển phải là số nguyên dương và không vượt tổng số bản", () => {
    for (const quantity of ["", "0", "-1", "1.5", "abc", "Infinity"])
      expect(validateLoan({ ...valid, quantity }, books).quantity).toBe(
        "Số quyển phải từ 1 trở lên",
      );
    expect(
      validateLoan({ ...valid, bookId: "1", quantity: "2" }, books).quantity,
    ).toBe("Vượt số bản của sách (1 bản)");
  });
  it("chỉ nhận thời hạn 7, 14, 30 và lý do đủ dài sau khi trim", () => {
    expect(validateLoan({ ...valid, term: "10" }, books).term).toBe(
      "Hãy chọn thời hạn",
    );
    for (const reason of ["ngắn", "         ", "  123456789  "])
      expect(validateLoan({ ...valid, reason }, books).reason).toBe(
        "Lý do tối thiểu 10 ký tự",
      );
  });
  it("đọc đúng FormData và bỏ qua trường không thuộc phiếu", () => {
    const data = new FormData();
    for (const [key, value] of Object.entries(valid)) data.set(key, value);
    data.set("status", "approved");
    expect(toLoanInput(data)).toEqual(valid);
    data.set("bookId", new File(["6"], "id.txt"));
    expect(toLoanInput(data).bookId).toBe("");
  });
  it("chuyển số từ chuỗi và trim lý do sau khi hợp lệ", () => {
    expect(
      toLoanData({ ...valid, reason: "  Mượn tài liệu để học  " }),
    ).toEqual({
      bookId: 6,
      pickupDate: "2026-12-02",
      term: 14,
      quantity: 1,
      reason: "Mượn tài liệu để học",
    });
  });
});
