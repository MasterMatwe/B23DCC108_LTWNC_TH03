import type { ReactNode } from "react";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="container member-area">
      <p className="eyebrow">Khu vực thành viên</p>
      {children}
    </main>
  );
}
