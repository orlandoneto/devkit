import type { ReactNode } from "react";

/** Root layout passthrough — real shell lives in `[locale]/layout`. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
