import type { Metadata } from "next";
import { Login } from "@/components/templates/nimbus/app";

export const metadata: Metadata = { title: "Nimbus — Sign in" };

export default function Page() {
  return <Login />;
}
