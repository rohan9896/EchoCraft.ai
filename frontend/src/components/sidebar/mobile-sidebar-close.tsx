"use client";

import { X } from "lucide-react";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

const MobileSidebarClose = () => {
  const { setOpenMobile, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <div className="absolute top-2 right-2 z-50 mb-4 px-2">
      <Button
        size="sm"
        variant="ghost"
        aria-label="Close Sidebar"
        className="hover:bg-muted/50 h-8 w-8 p-0"
        onClick={() => setOpenMobile(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MobileSidebarClose;
