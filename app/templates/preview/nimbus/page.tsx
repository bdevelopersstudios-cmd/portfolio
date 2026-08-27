import type { Metadata } from "next";
import { Landing } from "@/components/templates/nimbus/marketing";

export const metadata: Metadata = { title: "Nimbus — SaaS template" };

export default function Page() {
  return <Landing />;
}
