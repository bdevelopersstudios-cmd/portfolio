import type { Metadata } from "next";
import { Billing } from "@/components/templates/console/screens";

export const metadata: Metadata = { title: "Console — Billing" };

export default function Page() {
  return <Billing />;
}
