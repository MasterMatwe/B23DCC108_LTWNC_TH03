import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { generateBooks } from "@/data/books";
import LoanForm from "./LoanForm";
import type { LoanFormState } from "@/lib/loan-validate";

const books = generateBooks(24);
type Action = (
  previous: LoanFormState,
  data: FormData,
) => Promise<LoanFormState>;

describe("Form đăng ký mượn sách", () => {
  it("lỗi hiển thị dưới đúng ô và được liên kết cho trình đọc màn hình", async () => {
    const action = vi
      .fn<Action>()
      .mockResolvedValue({
        errors: {
          bookId: "Hãy chọn sách",
          pickupDate: "Hãy chọn ngày",
          term: "Hãy chọn thời hạn",
          reason: "Lý do tối thiểu 10 ký tự",
        },
        values: { quantity: "1" },
      });
    render(<LoanForm books={books} action={action} />);
    await userEvent.click(screen.getByRole("button", { name: "Gửi yêu cầu" }));
    await screen.findByText("Hãy chọn sách");
    expect(screen.getByLabelText("Sách")).toHaveAccessibleDescription(
      "Hãy chọn sách",
    );
    expect(screen.getByLabelText("Ngày lấy sách")).toHaveAccessibleDescription(
      "Hãy chọn ngày",
    );
    expect(screen.getByLabelText("Thời hạn mượn")).toHaveAccessibleDescription(
      "Hãy chọn thời hạn",
    );
    expect(screen.getByLabelText("Lý do mượn")).toHaveAccessibleDescription(
      "Lý do tối thiểu 10 ký tự",
    );
  });
  it("gửi đúng FormData và xóa form khi action thành công", async () => {
    const user = userEvent.setup();
    const action = vi
      .fn<Action>()
      .mockResolvedValue({
        errors: {},
        values: {},
        ok: true,
        message: "Đã gửi yêu cầu, chờ duyệt",
      });
    render(<LoanForm books={books} defaultBookId={6} action={action} />);
    await user.type(screen.getByLabelText("Ngày lấy sách"), "2026-12-02");
    await user.selectOptions(screen.getByLabelText("Thời hạn mượn"), "14");
    await user.type(
      screen.getByLabelText("Lý do mượn"),
      "Mượn tài liệu để làm bài tập",
    );
    await user.click(screen.getByRole("button", { name: "Gửi yêu cầu" }));
    await screen.findByText("Đã gửi yêu cầu, chờ duyệt");
    expect(action).toHaveBeenCalledTimes(1);
    const sent = action.mock.calls[0][1];
    expect(sent.get("bookId")).toBe("6");
    expect(sent.get("term")).toBe("14");
    expect(sent.get("quantity")).toBe("1");
    expect(screen.getByLabelText("Sách")).toHaveValue("");
    expect(screen.getByLabelText("Lý do mượn")).toHaveValue("");
  });
  it("hết bản vẫn giữ dữ liệu và cho gửi lại mà không mất lý do", async () => {
    const user = userEvent.setup();
    const action = vi
      .fn<Action>()
      .mockImplementation(async (_previous, data) => ({
        errors: {},
        values: {
          bookId: String(data.get("bookId")),
          pickupDate: String(data.get("pickupDate")),
          term: String(data.get("term")),
          quantity: String(data.get("quantity")),
          reason: String(data.get("reason")),
        },
        message: "Sách đã hết bản vào ngày này",
      }));
    render(<LoanForm books={books} defaultBookId={6} action={action} />);
    await user.type(screen.getByLabelText("Ngày lấy sách"), "2026-12-02");
    await user.selectOptions(screen.getByLabelText("Thời hạn mượn"), "14");
    await user.type(
      screen.getByLabelText("Lý do mượn"),
      "Mượn tài liệu để làm bài tập",
    );
    await user.click(screen.getByRole("button", { name: "Gửi yêu cầu" }));
    await screen.findByText("Sách đã hết bản vào ngày này");
    await user.click(screen.getByRole("button", { name: "Gửi yêu cầu" }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(2));
    expect(screen.getByLabelText("Lý do mượn")).toHaveValue(
      "Mượn tài liệu để làm bài tập",
    );
    expect(screen.getByLabelText("Sách")).toHaveValue("6");
    expect(screen.getByLabelText("Thời hạn mượn")).toHaveValue("14");
  });
  it("chọn sẵn sách theo defaultBookId", () => {
    const action = vi.fn<Action>();
    render(<LoanForm books={books} defaultBookId={6} action={action} />);
    expect(screen.getByLabelText("Sách")).toHaveValue("6");
    expect(
      screen.getByRole("option", { name: "An toàn mạng (1 bản)" }),
    ).toHaveProperty("selected", true);
  });
});
