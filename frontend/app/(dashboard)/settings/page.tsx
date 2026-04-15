import type { Metadata } from "next";
import { SettingsPage, StripeReturnIntent } from "@/modules/settings/shared";

export const metadata: Metadata = { title: "Settings" };


interface Props {
  searchParams: Promise<{ stripe?: string }>;
}

export default async function Settings({ searchParams }: Props) {
  
  const { stripe } = await searchParams;
  
  const stripeIntent: StripeReturnIntent | null =
    stripe === "success" || stripe === "refresh" ? stripe : null;

  return <SettingsPage stripeIntent={stripeIntent} />;
}