import type { Metadata } from "next";
import { Overview } from "@/components/templates/console/screens";

export const metadata: Metadata = { title: "Console — Overview" };

export default function Page() {
  return <Overview />;
}
