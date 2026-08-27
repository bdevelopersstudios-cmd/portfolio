import type { Metadata } from "next";
import { Changelog } from "@/components/templates/nimbus/marketing";

export const metadata: Metadata = { title: "Nimbus — Changelog" };

export default function Page() {
  return <Changelog />;
}
