"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";

export async function reviewLoan(
  id: number,
  status: "approved" | "rejected",
): Promise<void> {
  const session = await auth();
  if (!can(session?.user.role, "loan:review"))
    throw new Error("Không có quyền");

  if (
    !Number.isSafeInteger(id) ||
    id < 1 ||
    (status !== "approved" && status !== "rejected")
  ) {
    throw new Error("Yêu cầu không hợp lệ");
  }

  const loan = db.loans.find((item) => item.id === id);
  if (!loan || loan.status !== "pending") return;

  loan.status = status;
  revalidatePath("/admin");
}
