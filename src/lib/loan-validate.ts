import type { Book, Term } from "@/types";

export interface LoanInput {
  bookId: string;
  pickupDate: string;
  term: string;
  quantity: string;
  reason: string;
}

export interface LoanData {
  bookId: number;
  pickupDate: string;
  term: Term;
  quantity: number;
  reason: string;
}

export type LoanErrors = Partial<Record<keyof LoanInput, string>>;

export interface LoanFormState {
  errors: LoanErrors;
  values: Partial<LoanInput>;
  message?: string;
  ok?: boolean;
}

export function today(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return ["year", "month", "day"]
    .map((part) => parts.find((item) => item.type === part)?.value ?? "")
    .join("-");
}

export function toLoanInput(
  raw: FormData | Record<string, unknown>,
): LoanInput {
  const read = (field: keyof LoanInput): string => {
    const value = raw instanceof FormData ? raw.get(field) : raw[field];
    return typeof value === "string" ? value : "";
  };
  return {
    bookId: read("bookId"),
    pickupDate: read("pickupDate"),
    term: read("term"),
    quantity: read("quantity"),
    reason: read("reason"),
  };
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export function validateLoan(
  input: LoanInput,
  books: readonly Book[],
): LoanErrors {
  const errors: LoanErrors = {};
  const book = /^[1-9]\d*$/.test(input.bookId)
    ? books.find((item) => item.id === Number(input.bookId))
    : undefined;

  if (!book) errors.bookId = "Hãy chọn sách";

  if (!isCalendarDate(input.pickupDate)) {
    errors.pickupDate = "Hãy chọn ngày";
  } else if (input.pickupDate < today()) {
    errors.pickupDate = "Ngày lấy sách không được ở quá khứ";
  }

  if (!["7", "14", "30"].includes(input.term)) {
    errors.term = "Hãy chọn thời hạn";
  }

  const quantity = Number(input.quantity);
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    errors.quantity = "Số quyển phải từ 1 trở lên";
  } else if (book && quantity > book.copies) {
    errors.quantity = `Vượt số bản của sách (${book.copies} bản)`;
  }

  if (input.reason.trim().length < 10)
    errors.reason = "Lý do tối thiểu 10 ký tự";
  return errors;
}

// Only call after validateLoan returns no errors.
export function toLoanData(input: LoanInput): LoanData {
  return {
    bookId: Number(input.bookId),
    pickupDate: input.pickupDate,
    term: Number(input.term) as Term,
    quantity: Number(input.quantity),
    reason: input.reason.trim(),
  };
}
