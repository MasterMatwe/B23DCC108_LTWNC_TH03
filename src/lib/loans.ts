import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import type { Category, Loan, LoanStatus, Role } from "@/types";
import type { LoanData } from "@/lib/loan-validate";

export interface LoanViewer {
  email: string;
  role: Role | undefined;
}

export interface LoanListItem extends Loan {
  bookTitle: string;
  bookCategory: Category | null;
}

export interface LoanPage {
  items: LoanListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export function parseStatus(value: unknown): LoanStatus | undefined {
  return value === "pending" || value === "approved" || value === "rejected"
    ? value
    : undefined;
}

export function listLoans(
  viewer: LoanViewer,
  status?: LoanStatus,
  page = 1,
): LoanPage {
  const visible = can(viewer.role, "loan:view-all")
    ? db.loans
    : can(viewer.role, "loan:view-own")
      ? db.loans.filter((loan) => loan.userEmail === viewer.email)
      : [];
  const filtered = status
    ? visible.filter((loan) => loan.status === status)
    : visible;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / 10));
  const requestedPage = Number.isFinite(page) ? Math.trunc(page) : 1;
  const currentPage = Math.min(totalPages, Math.max(1, requestedPage));
  const items = filtered
    .slice((currentPage - 1) * 10, currentPage * 10)
    .map((loan) => {
      const book = db.books.find((item) => item.id === loan.bookId);
      return {
        ...loan,
        bookTitle: book?.title ?? "Sách không còn trong danh mục",
        bookCategory: book?.category ?? null,
      };
    });
  return { items, total, page: currentPage, totalPages };
}

export type SubmitLoanResult =
  { ok: true; loan: Loan } | { ok: false; message: string };

export function submitLoan(email: string, data: LoanData): SubmitLoanResult {
  const book = db.books.find((item) => item.id === data.bookId);
  if (!book) return { ok: false, message: "Hãy chọn sách" };

  // A pending request reserves copies too; only rejected requests are excluded.
  const reserved = db.loans.reduce(
    (sum, loan) =>
      loan.bookId === data.bookId &&
      loan.pickupDate === data.pickupDate &&
      loan.status !== "rejected"
        ? sum + loan.quantity
        : sum,
    0,
  );
  if (reserved + data.quantity > book.copies) {
    return { ok: false, message: "Sách đã hết bản vào ngày này" };
  }

  const loan: Loan = {
    ...data,
    id: db.nextLoanId++,
    userEmail: email,
    status: "pending",
  };
  db.loans.unshift(loan);
  return { ok: true, loan };
}

export type CancelLoanResult = "not-found" | "forbidden" | "not-pending" | "ok";

export function cancelLoan(email: string, id: number): CancelLoanResult {
  const index = db.loans.findIndex((loan) => loan.id === id);
  if (index === -1) return "not-found";
  const loan = db.loans[index];
  if (loan.userEmail !== email) return "forbidden";
  if (loan.status !== "pending") return "not-pending";
  db.loans.splice(index, 1);
  return "ok";
}
