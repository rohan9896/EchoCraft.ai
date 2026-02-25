"use server"

import { AudioWaveform, Settings, User } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "../ui/sidebar"
import Link from "next/link"
import { UserButton } from "@daveyplate/better-auth-ui"
import SidebarMenuItems from "./sidebar-menu-items"
import MobileSidebarClose from "./mobile-sidebar-close"

const AppSidebar =  async () => {
  return (
    <Sidebar className="from-background to-muted/20 border-r-0 bg-linear-to-b">
        <SidebarHeader className="px-3 py-4">
            <MobileSidebarClose />
            <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
                    <AudioWaveform className="h-5 w-5 text-white" />
                </div>
                <Link href='/' className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight text-foreground">EchoCraft</span>
                    <span className="text-xs text-muted-foreground">.ai</span>
                </Link>
            </div>
        </SidebarHeader>
        <SidebarContent className="px-3">
            <SidebarGroup>
                <SidebarMenuItems />
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
            <UserButton variant='outline' className="border-muted-foreground/20 hover:border-primary/50 w-full transition-colors duration-200" disableDefaultLinks={true} additionalLinks={[
                {
                    label: "Customer Portal",
                    href: "/dashboard/customer-portal",
                    icon: <User className="h-4 w-4" />
                },
                {
                    label: "Settings",
                    href: "/dashboard/settings",
                    icon: <Settings className="h-4 w-4" />
                }
            ]} />
        </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
