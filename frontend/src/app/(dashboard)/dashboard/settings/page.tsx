"use client"

import { useEffect, useState } from "react"
import { authClient } from "~/lib/auth-client"
import PageLoader from "~/components/ui/page-loader"
import { AccountSettingsCards, RedirectToSignIn, SecuritySettingsCards, SignedIn } from "@daveyplate/better-auth-ui"

const SettingsPage = () => {

    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkSession = async () => {
            try {
                await authClient.getSession();
            } catch (error) {
                console.error("Error checking session:", error);
            } finally {
                setIsLoading(false);
            }
        }
        checkSession();
    }, [])

    if(isLoading) {
        return <PageLoader text="Loading settings" subtitle="Fetching your preferences..." />;
    }

  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="mx-auto max-w-4xl space-y-12 py-12">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="mt-3 text-base text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Account Settings Section */}
          <section className="space-y-6">
            <div className="border-l-4 border-brand pl-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Account Settings
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your personal information and account details
              </p>
            </div>
            <AccountSettingsCards />
          </section>

          {/* Security Settings Section */}
          <section className="space-y-6">
            <div className="border-l-4 border-brand pl-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Security & Privacy
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep your account secure with these settings
              </p>
            </div>
            <SecuritySettingsCards />
          </section>
        </div>
      </SignedIn>
    </>
  )
}

export default SettingsPage
