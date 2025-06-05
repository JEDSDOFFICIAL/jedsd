"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

// This should only wrap SessionProvider and pass children
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <InnerProviders>{children}</InnerProviders>
    </SessionProvider>
  );
}

// This is the inner provider that can use useSession
function InnerProviders({ children }: { children: ReactNode }) {
  return (
    < >
      <Toaster position="bottom-right" reverseOrder={false} />
      {children}
    </>
  );
}
