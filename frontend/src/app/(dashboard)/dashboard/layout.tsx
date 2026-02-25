import React from "react";
import { Providers } from "~/components/providers";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Toaster } from "~/components/ui/sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "~/components/ui/breadcrumb";
import "~/styles/globals.css";
import { type Metadata } from "next";
import { Separator } from "~/components/ui/separator";
import Link from "next/link";
import BreadcrumbPageClient from "~/components/sidebar/breadcrumb-page-client";
import AppSidebar from "~/components/sidebar/app-sidebar";

export const metadata: Metadata = {
  title: "EchoCraft.ai",
  description: "A Voice AI for Everyone",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Providers>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex h-screen flex-col">
          <header className="bg-background supports-backdrop-filter:bg-background/60 border-border/40 sticky top-0 z-10 border-b backdrop-blur px-6 py-3 shadow-xs">
            <div className="flex shrink-0 grow items-center gap-3">
              <SidebarTrigger className="hover:bg-muted -ml-1 h-8 w-8 transition-colors" />
              <Separator
                orientation="vertical"
                className="mr-2 h-6 data-[orientation=vertical]:h-6"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    {/* <Link href="/settings">Settings</Link> */}
                    <BreadcrumbPageClient />
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </Providers>
  );
};

export default RootLayout;
