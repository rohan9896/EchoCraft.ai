"use client";

import { authClient } from "~/lib/auth-client";
import { SUBSCRIPTION_PLANS } from "~/lib/plans";
import { Button } from "../ui/button";
import { Coins } from "lucide-react";

const UpgradeButton = () => {
  const handleUpgrade = async () => {
    await authClient.checkout({
      products: [
        SUBSCRIPTION_PLANS.SMALL.productId,
        SUBSCRIPTION_PLANS.MEDIUM.productId,
        SUBSCRIPTION_PLANS.LARGE.productId,
      ],
    });
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      className="text-brand-dark hover:text-brand z-20 h-8 w-full font-bold shadow-sm"
      onClick={handleUpgrade}
    >
      <Coins className="mr-2 h-3.5 w-3.5" />
      Buy Credits
    </Button>
  );
};

export default UpgradeButton;