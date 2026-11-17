import type { Role } from "@/types";

export type Action =
  | "book:view"
  | "loan:create"
  | "loan:view-own"
  | "loan:view-all"
  | "loan:review";

const permissions: Record<Action, readonly (Role | undefined)[]> = {
  "book:view": [undefined, "student", "admin"],
  "loan:create": ["student"],
  "loan:view-own": ["student"],
  "loan:view-all": ["admin"],
  "loan:review": ["admin"],
};

export function can(role: Role | undefined, action: Action): boolean {
  return permissions[action]?.includes(role) ?? false;
}
