"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

function SyncSessionAfterNavigation() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const { update } = useSession();

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    // Server Actions set the cookie on the server. Refresh the client context
    // after a redirect so the header immediately reflects the new session.
    void update();
  }, [pathname, update]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SyncSessionAfterNavigation />
      {children}
    </SessionProvider>
  );
}
