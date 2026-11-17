"use client";

import { useFormStatus } from "react-dom";

export function CancelLoanButton() {
  const { pending } = useFormStatus();
  return (
    <button className="cancel-loan-button" type="submit" disabled={pending}>
      {pending ? "Đang hủy…" : "Hủy"}
    </button>
  );
}
