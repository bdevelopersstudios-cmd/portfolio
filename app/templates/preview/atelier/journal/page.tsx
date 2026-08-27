import type { Metadata } from "next";
import { Journal } from "@/components/templates/atelier/screens";

export const metadata: Metadata = { title: "Atelier — Journal" };

export default function Page() {
  return <Journal />;
}
