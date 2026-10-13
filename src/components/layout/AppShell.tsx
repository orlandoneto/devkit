"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BlogArchiveNav } from "@/components/blog/BlogArchiveNav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePathname } from "@/i18n/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBlog = pathname.startsWith("/blog");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <TooltipProvider delayDuration={200}>
      <SiteHeader
        onToggleSidebar={() => setMobileOpen((v) => !v)}
        sidebarOpen={mobileOpen}
        showSidebarToggle
      />

      <div className="relative flex min-h-0 flex-1">
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {isBlog ? (
          <BlogArchiveNav
            mobileOpen={mobileOpen}
            onNavigate={() => setMobileOpen(false)}
          />
        ) : (
          <Sidebar
            mobileOpen={mobileOpen}
            onNavigate={() => setMobileOpen(false)}
          />
        )}

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </TooltipProvider>
  );
}
