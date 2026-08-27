import type { Metadata } from "next";
import { Settings } from "@/components/templates/console/screens";

export const metadata: Metadata = { title: "Console — Settings" };

export default function Page() {
  return <Settings />;
}
