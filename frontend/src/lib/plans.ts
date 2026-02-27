import { env } from "~/env";

const PLAN_PRODUCT_IDS = {
  sandbox: {
    SMALL: "fd73e857-a3a8-4958-9010-bfa947d1b8b0",
    MEDIUM: "7e7ed49f-b60e-41a0-8ab0-649a8e42a81e",
    LARGE: "f36f4b95-1426-49ed-9b0e-ec4069cc9101",
  },
  production: {
    SMALL: "68adea7d-5a92-4cca-905c-16a59b242d68",
    MEDIUM: "236e97d5-e8dd-4cd4-ae5b-ed0bd47d3d1c",
    LARGE: "713da002-af64-4f4f-90f9-e2bda4f8c503",
  },
} as const;

const ids = PLAN_PRODUCT_IDS[env.NEXT_PUBLIC_POLAR_SERVER];

export const SUBSCRIPTION_PLANS = {
  SMALL: {
    productId: ids.SMALL,
    slug: "small",
    credits: 50,
  },
  MEDIUM: {
    productId: ids.MEDIUM,
    slug: "medium",
    credits: 200,
  },
  LARGE: {
    productId: ids.LARGE,
    slug: "large",
    credits: 400,
  },
} as const;

export type SubscriptionPlanId =
  (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS]["productId"];
