import type { Metadata } from "next";
import { AppHome } from "@/components/templates/nimbus/app";

export const metadata: Metadata = { title: "Nimbus — App" };

export default function Page() {
  return <AppHome />;
}
