import type { Metadata } from "next";
import { Home } from "@/components/templates/atelier/screens";

export const metadata: Metadata = { title: "Atelier — studio template" };

export default function Page() {
  return <Home />;
}
