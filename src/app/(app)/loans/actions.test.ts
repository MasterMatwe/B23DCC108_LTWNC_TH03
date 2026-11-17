import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "next-auth";
import type { Role } from "@/types";
import { generateLoans } from "@/data/books";
import { db } from "@/lib/db";
import { cancelLoanAction, createLoanAction } from "./actions";
import type { LoanFormState } from "@/lib/loan-validate";

const { mockAuth, mockRevalidate } = vi.hoisted(() => ({
  mockAuth: vi.fn<() => Promise<Session | null>>(),
  mockRevalidate: vi.fn(),
}));
vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidate }));

const initial: LoanFormState = { errors: {}, values: {} };
function session(role: Role): Session {
  return {
    expires: "2026-12-31T00:00:00Z",
    user: {
      id: "test",
      name: "Tài khoản kiểm thử",
      email: role === "admin" ? "admin@ptit.edu.vn" : "sv01@ptit.edu.vn",
      role,
    },
  };
}
function form(bookId = "11", pickupDate = "2026-12-03") {
  const result = new FormData();
  for (const [key, value] of Object.entries({
    bookId,
    pickupDate,
    term: "14",
    quantity: "1",
    reason: "  Mượn tài liệu để làm bài tập  ",
  }))
    result.set(key, value);
  return result;
}
function reset() {
  db.loans.splice(0, db.loans.length, ...generateLoans(37));
  db.nextLoanId = 38;
}

describe("Action tạo và hủy phiếu mượn", () => {
  beforeEach(() => {
    reset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T03:00:00Z"));
    mockAuth.mockReset().mockResolvedValue(session("student"));
    mockRevalidate.mockReset();
  });
  afterEach(() => {
    reset();
    vi.useRealTimers();
  });

  it("khách và admin không thể gửi hoặc hủy trực tiếp bằng action", async () => {
    for (const viewer of [null, session("admin")]) {
      mockAuth.mockResolvedValue(viewer);
      await expect(createLoanAction(initial, form())).rejects.toThrow(
        "Không có quyền",
      );
      await expect(cancelLoanAction(4)).rejects.toThrow("Không có quyền");
    }
    expect(db.loans).toHaveLength(37);
  });
  it("trả lỗi theo từng ô và giữ giá trị nhập khi vượt số bản", async () => {
    const data = form("1");
    data.set("quantity", "2");
    const result = await createLoanAction(initial, data);
    expect(result.errors.quantity).toBe("Vượt số bản của sách (1 bản)");
    expect(result.values).toMatchObject({ bookId: "1", quantity: "2" });
    expect(mockRevalidate).not.toHaveBeenCalled();
  });
  it("hết bản giữ nguyên dữ liệu form và không tạo phiếu", async () => {
    const result = await createLoanAction(initial, form("6", "2026-12-02"));
    expect(result.message).toBe("Sách đã hết bản vào ngày này");
    expect(result.values).toMatchObject({
      bookId: "6",
      pickupDate: "2026-12-02",
      reason: "  Mượn tài liệu để làm bài tập  ",
    });
    expect(db.loans).toHaveLength(37);
  });
  it("tạo thành công lấy email từ phiên, bỏ dữ liệu giả và xóa giá trị form", async () => {
    const data = form();
    data.set("userEmail", "admin@ptit.edu.vn");
    data.set("status", "approved");
    expect(await createLoanAction(initial, data)).toEqual({
      errors: {},
      values: {},
      message: "Đã gửi yêu cầu, chờ duyệt",
      ok: true,
    });
    expect(db.loans[0]).toMatchObject({
      id: 38,
      userEmail: "sv01@ptit.edu.vn",
      status: "pending",
      reason: "Mượn tài liệu để làm bài tập",
    });
    expect(mockRevalidate).toHaveBeenCalledWith("/loans");
    expect(mockRevalidate).toHaveBeenCalledWith("/admin");
  });
  it("không hủy phiếu người khác hoặc phiếu đã được xử lý", async () => {
    await cancelLoanAction(1);
    await cancelLoanAction(2);
    await cancelLoanAction(999);
    expect(db.loans).toHaveLength(37);
  });
  it("hủy phiếu của mình còn pending và cập nhật hai trang", async () => {
    await cancelLoanAction(4);
    expect(db.loans.find((loan) => loan.id === 4)).toBeUndefined();
    expect(mockRevalidate).toHaveBeenCalledWith("/loans");
    expect(mockRevalidate).toHaveBeenCalledWith("/admin");
  });
});
