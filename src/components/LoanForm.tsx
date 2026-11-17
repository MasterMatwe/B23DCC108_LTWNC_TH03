"use client";

import { useActionState } from "react";
import { Icon } from "@/components/Icon";
import { TERMS } from "@/data/books";
import { TERM_LABEL } from "@/lib/format";
import type { LoanFormState, LoanInput } from "@/lib/loan-validate";
import type { Book } from "@/types";

interface Props {
  books: Book[];
  defaultBookId?: number;
  action: (
    previousState: LoanFormState,
    formData: FormData,
  ) => Promise<LoanFormState>;
}

const initialState: LoanFormState = { errors: {}, values: {} };

export default function LoanForm({ books, defaultBookId, action }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formKey = JSON.stringify([
    state.values,
    state.errors,
    state.message,
    state.ok,
  ]);
  const selectedBook =
    state.values.bookId ??
    (state.ok ? "" : defaultBookId ? String(defaultBookId) : "");
  const errorId = (field: keyof LoanInput) => `loan-${field}-error`;
  const error = (field: keyof LoanInput) =>
    state.errors[field] ? (
      <p className="loan-field-error" id={errorId(field)} role="alert">
        {state.errors[field]}
      </p>
    ) : null;

  return (
    <form
      className="loan-form"
      action={formAction}
      key={formKey}
      noValidate
      aria-busy={pending}
    >
      <div className="loan-field">
        <label htmlFor="loan-bookId">Sách</label>
        <select
          id="loan-bookId"
          name="bookId"
          defaultValue={selectedBook}
          required
          aria-invalid={Boolean(state.errors.bookId)}
          aria-describedby={
            state.errors.bookId ? errorId("bookId") : "loan-book-help"
          }
        >
          <option value="">-- Chọn sách --</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} ({book.copies} bản)
            </option>
          ))}
        </select>
        {error("bookId")}
        <p className="loan-field-hint" id="loan-book-help">
          Số bản khả dụng được kiểm tra theo ngày lấy sách.
        </p>
      </div>
      <div className="loan-field">
        <label htmlFor="loan-pickupDate">Ngày lấy sách</label>
        <input
          id="loan-pickupDate"
          name="pickupDate"
          type="date"
          defaultValue={state.values.pickupDate ?? ""}
          required
          aria-invalid={Boolean(state.errors.pickupDate)}
          aria-describedby={
            state.errors.pickupDate ? errorId("pickupDate") : undefined
          }
        />
        {error("pickupDate")}
      </div>
      <div className="loan-form-grid">
        <div className="loan-field">
          <label htmlFor="loan-term">Thời hạn mượn</label>
          <select
            id="loan-term"
            name="term"
            defaultValue={state.values.term ?? ""}
            required
            aria-invalid={Boolean(state.errors.term)}
            aria-describedby={state.errors.term ? errorId("term") : undefined}
          >
            <option value="">-- Chọn thời hạn --</option>
            {TERMS.map((term) => (
              <option key={term} value={term}>
                {TERM_LABEL[term]}
              </option>
            ))}
          </select>
          {error("term")}
        </div>
        <div className="loan-field">
          <label htmlFor="loan-quantity">Số quyển</label>
          <input
            id="loan-quantity"
            name="quantity"
            type="number"
            min="1"
            step="1"
            defaultValue={state.values.quantity ?? "1"}
            required
            aria-invalid={Boolean(state.errors.quantity)}
            aria-describedby={
              state.errors.quantity ? errorId("quantity") : undefined
            }
          />
          {error("quantity")}
        </div>
      </div>
      <div className="loan-field">
        <label htmlFor="loan-reason">Lý do mượn</label>
        <textarea
          id="loan-reason"
          name="reason"
          rows={3}
          placeholder="Bạn cần tài liệu cho môn học hoặc mục đích nào?"
          defaultValue={state.values.reason ?? ""}
          required
          aria-invalid={Boolean(state.errors.reason)}
          aria-describedby={
            state.errors.reason ? errorId("reason") : "loan-reason-help"
          }
        />
        {error("reason")}
        <p className="loan-field-hint" id="loan-reason-help">
          Tối thiểu 10 ký tự, không tính khoảng trắng ở hai đầu.
        </p>
      </div>
      {state.message && (
        <p
          className={`loan-form-message ${state.ok ? "loan-success" : "loan-server-error"}`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
      <button
        className="button button-primary loan-submit"
        type="submit"
        disabled={pending}
      >
        {pending ? "Đang gửi…" : "Gửi yêu cầu"}
        <Icon name="arrow-right" />
      </button>
      <p className="loan-submit-note">
        Yêu cầu sẽ được thủ thư kiểm tra và duyệt.
      </p>
    </form>
  );
}
