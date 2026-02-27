"use client";

import { SessionProvider } from "next-auth/react";
import { AlertProvider } from "@/components/ui/custom-alert";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AlertProvider>{children}</AlertProvider>
    </SessionProvider>
  );
}
