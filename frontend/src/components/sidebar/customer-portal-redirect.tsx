"use client";

import { useEffect } from "react";
import { authClient } from "~/lib/auth-client";

const CustomerPortalRedirect = () => {

    useEffect(() => {
        const portal = async () => {
            await authClient.customer.portal();
        }

        portal();
    })

  return (
    <div>
      
    </div>
  )
}

export default CustomerPortalRedirect
