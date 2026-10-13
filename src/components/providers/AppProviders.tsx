"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeSync } from "@/components/theme/ThemeSync";
import { FEATURES, isClerkConfigured } from "@/lib/features";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const content = (
    <>
      <ThemeSync />
      {children}
    </>
  );

  if (!FEATURES.clerkAuth || !isClerkConfigured()) {
    return content;
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#0f172a",
          colorBackground: "#fafaf8",
          borderRadius: "0.75rem",
        },
      }}
    >
      {content}
    </ClerkProvider>
  );
}
