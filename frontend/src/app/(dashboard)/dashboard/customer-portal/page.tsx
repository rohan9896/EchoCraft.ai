import { headers } from "next/headers"
import { redirect } from "next/navigation"
import CustomerPortalRedirect from "~/components/sidebar/customer-portal-redirect"
import { auth } from "~/lib/auth"

const Page = async () => {

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session) {
        redirect("/auth/sign-in")
    }

  return (
    <CustomerPortalRedirect />
  )
}

export default Page
