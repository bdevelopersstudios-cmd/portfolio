import type { Metadata } from "next";
import { Team } from "@/components/templates/console/screens";

export const metadata: Metadata = { title: "Console — Team" };

export default function Page() {
  return <Team />;
}
