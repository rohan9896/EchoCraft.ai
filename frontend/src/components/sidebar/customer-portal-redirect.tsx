"use client";

import { useEffect } from "react";
import { authClient } from "~/lib/auth-client";
import { Loader2, Sparkles, CreditCard } from "lucide-react";

const CustomerPortalRedirect = () => {

    useEffect(() => {
        const portal = async () => {
            await authClient.customer.portal();
        }

        portal();
    })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="relative flex flex-col items-center gap-6 rounded-2xl bg-card p-12 shadow-2xl">
        
        {/* Animated background glow */}
        <div className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-gradient-to-br from-brand/20 via-brand-light/10 to-transparent blur-2xl"></div>
        
        {/* Icon section with animations */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-brand/20 blur-xl"></div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-dark via-brand to-brand-light shadow-lg">
            <CreditCard className="h-10 w-10 text-white" />
            <Sparkles className="absolute -right-2 -top-2 h-5 w-5 animate-bounce text-yellow-400 drop-shadow-lg" />
          </div>
        </div>

        {/* Spinner */}
        <Loader2 className="h-8 w-8 animate-spin text-brand" />

        {/* Text content */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Loading your customer portal
            <span className="animate-pulse">...</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we redirect you
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-brand [animation-delay:0ms]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-brand [animation-delay:150ms]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-brand [animation-delay:300ms]"></div>
        </div>
      </div>
    </div>
  )
}

export default CustomerPortalRedirect
