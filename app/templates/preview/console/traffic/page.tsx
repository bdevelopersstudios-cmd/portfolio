import type { Metadata } from "next";
import { Traffic } from "@/components/templates/console/screens";

export const metadata: Metadata = { title: "Console — Traffic" };

export default function Page() {
  return <Traffic />;
}
