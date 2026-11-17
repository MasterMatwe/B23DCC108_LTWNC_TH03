import { describe, expect, it } from "vitest";
import { can } from "./permissions";
import type { Action } from "./permissions";

const actions: Action[] = [
  "book:view",
  "loan:create",
  "loan:view-own",
  "loan:view-all",
  "loan:review",
];

describe("Ma trận phân quyền thư viện", () => {
  it("khách chỉ được xem sách", () => {
    expect(actions.filter((action) => can(undefined, action))).toEqual([
      "book:view",
    ]);
  });
  it("sinh viên được tạo và xem phiếu của mình, không được duyệt", () => {
    expect(actions.filter((action) => can("student", action))).toEqual([
      "book:view",
      "loan:create",
      "loan:view-own",
    ]);
  });
  it("admin được xem mọi phiếu và duyệt, không được tạo phiếu", () => {
    expect(actions.filter((action) => can("admin", action))).toEqual([
      "book:view",
      "loan:view-all",
      "loan:review",
    ]);
  });
});
