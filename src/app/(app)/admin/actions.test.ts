import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "next-auth";
import type { Role } from "@/types";
import { generateLoans } from "@/data/books";
import { db } from "@/lib/db";
import { reviewLoan } from "./actions";

const { mockAuth, mockRevalidate } = vi.hoisted(() => ({
  mockAuth: vi.fn<() => Promise<Session | null>>(),
  mockRevalidate: vi.fn(),
}));
vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidate }));

function session(role: Role): Session {
  return {
    expires: "2026-12-31T00:00:00Z",
    user: {
      id: role === "admin" ? "u3" : "u1",
      name: "Tài khoản kiểm thử",
      email: role === "admin" ? "admin@ptit.edu.vn" : "sv01@ptit.edu.vn",
      role,
    },
  };
}

describe("Server Action duyệt phiếu", () => {
  beforeEach(() => {
    mockAuth.mockReset().mockResolvedValue(null);
    mockRevalidate.mockReset();
    db.loans.splice(0, db.loans.length, ...generateLoans(37));
  });
  afterEach(() => {
    db.loans.splice(0, db.loans.length, ...generateLoans(37));
  });

  it("chặn khách gọi action trực tiếp", async () => {
    await expect(reviewLoan(1, "approved")).rejects.toThrow("Không có quyền");
    expect(db.loans[0].status).toBe("pending");
    expect(mockRevalidate).not.toHaveBeenCalled();
  });
  it("chặn sinh viên gọi action dù bỏ qua proxy", async () => {
    mockAuth.mockResolvedValue(session("student"));
    await expect(reviewLoan(1, "approved")).rejects.toThrow("Không có quyền");
    expect(db.loans[0].status).toBe("pending");
  });
  it("admin duyệt phiếu làm thống kê chuyển từ 13/12 sang 12/13", async () => {
    mockAuth.mockResolvedValue(session("admin"));
    await reviewLoan(1, "approved");
    expect(db.loans.filter((loan) => loan.status === "pending")).toHaveLength(
      12,
    );
    expect(db.loans.filter((loan) => loan.status === "approved")).toHaveLength(
      13,
    );
    expect(mockRevalidate).toHaveBeenCalledWith("/admin");
  });
  it("admin từ chối được phiếu đang chờ", async () => {
    mockAuth.mockResolvedValue(session("admin"));
    await reviewLoan(1, "rejected");
    expect(db.loans[0].status).toBe("rejected");
    expect(db.loans.filter((loan) => loan.status === "rejected")).toHaveLength(
      13,
    );
  });
  it("không đổi quyết định của phiếu đã duyệt hoặc phiếu không tồn tại", async () => {
    mockAuth.mockResolvedValue(session("admin"));
    await reviewLoan(2, "rejected");
    await reviewLoan(999, "approved");
    expect(db.loans.find((loan) => loan.id === 2)?.status).toBe("approved");
    expect(mockRevalidate).not.toHaveBeenCalled();
  });
  it("không nhận id hoặc trạng thái giả mạo từ request", async () => {
    mockAuth.mockResolvedValue(session("admin"));
    await expect(reviewLoan(1.5, "approved")).rejects.toThrow(
      "Yêu cầu không hợp lệ",
    );
    await expect(reviewLoan(1, "pending" as "approved")).rejects.toThrow(
      "Yêu cầu không hợp lệ",
    );
    expect(db.loans[0].status).toBe("pending");
  });
});
