"use client";

import { FolderOpen, LayoutDashboard, Settings, Wand2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";

const SidebarMenuItems = () => {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Create",
      url: "/dashboard/create",
      icon: Wand2,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: FolderOpen,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false); // Close the sidebar on mobile after clicking a menu item
    }
  };

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.url}
            tooltip={item.title}
            className="transition-all duration-200 ease-in-out hover:translate-x-1"
          >
            <Link
              href={item.url}
              onClick={handleMenuItemClick}
            >
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default SidebarMenuItems;
