"use client";

import { useFormStatus } from "react-dom";

export function ReviewLoanButton({
  decision,
}: {
  decision: "approved" | "rejected";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className={`review-button ${decision === "approved" ? "approve-button" : "reject-button"}`}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? "Đang xử lý…" : decision === "approved" ? "Duyệt" : "Từ chối"}
    </button>
  );
}
