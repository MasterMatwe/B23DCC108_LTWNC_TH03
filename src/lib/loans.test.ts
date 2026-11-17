import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateLoans } from "@/data/books";
import { db } from "@/lib/db";
import { cancelLoan, listLoans, parseStatus, submitLoan } from "./loans";
import type { LoanData } from "@/lib/loan-validate";

const student = { email: "sv01@ptit.edu.vn", role: "student" as const };
const admin = { email: "admin@ptit.edu.vn", role: "admin" as const };
const request: LoanData = {
  bookId: 11,
  pickupDate: "2026-12-03",
  term: 14,
  quantity: 1,
  reason: "Mượn tài liệu phục vụ môn học",
};
function reset() {
  db.loans.splice(0, db.loans.length, ...generateLoans(37));
  db.nextLoanId = 38;
}

describe("Danh sách, tồn kho và hủy phiếu", () => {
  beforeEach(reset);
  afterEach(reset);

  it("sv01 có 27 phiếu, chia 10/10/7 và không thấy email người khác", () => {
    const pages = [1, 2, 3].map((page) => listLoans(student, undefined, page));
    expect(pages.map((page) => page.items.length)).toEqual([10, 10, 7]);
    expect(pages[0]).toMatchObject({ total: 27, page: 1, totalPages: 3 });
    expect(
      pages
        .flatMap((page) => page.items)
        .every((loan) => loan.userEmail === student.email && loan.bookTitle),
    ).toBe(true);
  });
  it("sv02 thấy 10 phiếu, admin thấy 37 và khách không thấy phiếu", () => {
    expect(
      listLoans({ email: "sv02@ptit.edu.vn", role: "student" }),
    ).toMatchObject({ total: 10, totalPages: 1 });
    expect(listLoans(admin)).toMatchObject({ total: 37, totalPages: 4 });
    expect(listLoans({ email: "", role: undefined })).toMatchObject({
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
    });
  });
  it("lọc trạng thái và kẹp trang vào giới hạn hợp lệ", () => {
    expect(listLoans(student, "pending")).toMatchObject({
      total: 9,
      totalPages: 1,
    });
    expect(listLoans(admin, "pending", 2).items).toHaveLength(3);
    expect(listLoans(student, undefined, 999)).toMatchObject({ page: 3 });
    expect(listLoans(student, undefined, -5).page).toBe(1);
    expect(listLoans(student, undefined, Number.NaN).page).toBe(1);
    expect(parseStatus("pending")).toBe("pending");
    expect(parseStatus("approved")).toBe("approved");
    expect(parseStatus("rejected")).toBe("rejected");
    for (const value of ["", "all", "Pending", undefined, ["pending"]])
      expect(parseStatus(value)).toBeUndefined();
  });
  it("An toàn mạng ngày 02/12 đã hết bản do phiếu được duyệt", () => {
    expect(
      submitLoan(student.email, {
        ...request,
        bookId: 6,
        pickupDate: "2026-12-02",
      }),
    ).toEqual({ ok: false, message: "Sách đã hết bản vào ngày này" });
    expect(db.nextLoanId).toBe(38);
    expect(db.loans).toHaveLength(37);
  });
  it("phiếu từ chối không giữ bản; phiếu mới được thêm đầu mảng và giữ chỗ", () => {
    const result = submitLoan(student.email, request);
    expect(result.ok).toBe(true);
    expect(db.loans[0]).toMatchObject({
      id: 38,
      bookId: 11,
      status: "pending",
      userEmail: student.email,
    });
    expect(db.nextLoanId).toBe(39);
    expect(submitLoan(student.email, request)).toEqual({
      ok: false,
      message: "Sách đã hết bản vào ngày này",
    });
  });
  it("tồn kho cộng số quyển, chỉ tính cùng sách và cùng ngày", () => {
    const original = db.loans[0];
    db.loans.splice(
      0,
      db.loans.length,
      {
        ...original,
        id: 100,
        bookId: 3,
        pickupDate: "2026-12-09",
        quantity: 2,
        status: "pending",
      },
      {
        ...original,
        id: 101,
        bookId: 3,
        pickupDate: "2026-12-09",
        quantity: 1,
        status: "rejected",
      },
      {
        ...original,
        id: 102,
        bookId: 3,
        pickupDate: "2026-12-10",
        quantity: 3,
        status: "approved",
      },
    );
    const data = { ...request, bookId: 3, pickupDate: "2026-12-09" };
    expect(submitLoan(student.email, data).ok).toBe(true);
    expect(submitLoan(student.email, data).ok).toBe(false);
  });
  it("hủy trả đủ mã kết quả và chỉ xóa phiếu pending của chủ sở hữu", () => {
    expect(cancelLoan(student.email, 999)).toBe("not-found");
    expect(cancelLoan(student.email, 1)).toBe("forbidden");
    expect(cancelLoan(student.email, 2)).toBe("not-pending");
    expect(cancelLoan(student.email, 4)).toBe("ok");
    expect(cancelLoan(student.email, 4)).toBe("not-found");
  });
  it("hủy phiếu đang chờ giải phóng số bản của ngày đó", () => {
    const data = { ...request, bookId: 1, pickupDate: "2026-12-01" };
    expect(submitLoan(student.email, data).ok).toBe(false);
    expect(cancelLoan("sv02@ptit.edu.vn", 1)).toBe("ok");
    expect(submitLoan(student.email, data).ok).toBe(true);
  });
});
