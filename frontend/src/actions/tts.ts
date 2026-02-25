"use server";

import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";

export const getUserCredits = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        credits: 0,
        error: "Unauthorized: No user session found",
      };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return { success: false, credits: 0, error: "User not found" };
    }

    return { success: true, credits: user.credits };
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return { success: false, credits: 0, error: "An error occurred while fetching credits" };
  }
});
