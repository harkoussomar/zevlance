import type { Metadata } from "next";
import { SettingsPage } from "@/modules/settings";

export const metadata: Metadata = { title: "Settings" };

export type StripeReturnIntent = "success" | "refresh";

interface Props {
  searchParams: Promise<{ stripe?: string }>;
}

export default async function Settings({ searchParams }: Props) {
  
  const { stripe } = await searchParams;
  
  const stripeIntent: StripeReturnIntent | null =
    stripe === "success" || stripe === "refresh" ? stripe : null;

  return <SettingsPage stripeIntent={stripeIntent} />;
}