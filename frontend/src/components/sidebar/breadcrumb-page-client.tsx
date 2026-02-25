"use client"

import { usePathname } from "next/navigation"
import {BreadcrumbPage} from "~/components/ui/breadcrumb"


const BreadcrumbPageClient = () => {

    const pathname = usePathname()

    const getPageTitle = (pathname: string) => {
        switch (pathname) {
            case "/dashboard":
                return "Dashboard"
            case "/settings":
                return "Settings"
            default:
                return "Dashoard"
        }
    }

  return (
    <BreadcrumbPage className="text-foreground text-sm font-medium">
      {getPageTitle(pathname)}
    </BreadcrumbPage>
  )
}

export default BreadcrumbPageClient
