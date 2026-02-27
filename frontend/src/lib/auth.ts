import { PrismaClient } from "../../generated/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";
import { th } from "zod/v4/locales";
import { SUBSCRIPTION_PLANS } from "./plans";
import { db } from "~/server/db";



const polarClient = new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: env.POLAR_SERVER
});

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "sqlite", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: Object.values(SUBSCRIPTION_PLANS).map((plan) => ({
                        productId: plan.productId,
                        slug: plan.slug,
                    })),
                    successUrl: "/dashboard",
                    authenticatedUsersOnly: true
                }),
                portal(),
                usage(),
                webhooks({
                    secret: env.POLAR_WEBHOOK_SECRET,
                    onOrderPaid: async (order) => {
                        const externalCustomerId = order.data.customer.externalId;

                        if(!externalCustomerId) {
                            console.error("No external customer ID found for order:", order);
                            throw new Error("No external customer ID found for order");
                        }

                        const productId = order.data.productId;

                        const plan = Object.values(SUBSCRIPTION_PLANS).find(
                            (p) => p.productId === productId
                        );

                        if (!plan) {
                            console.error("Unknown product ID:", productId);
                            throw new Error("Unknown product ID");
                        }

                        const creditsToAdd = plan.credits;

                        await db.user.update({
                            where: { id: externalCustomerId },
                            data: {
                                credits: {
                                    increment: creditsToAdd,
                                },
                            },
                        })

                    }
                    
                })
            ],
        })
    ]
});
