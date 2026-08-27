import type { Metadata } from "next";
import { Product } from "@/components/templates/nimbus/marketing";

export const metadata: Metadata = { title: "Nimbus — Product" };

export default function Page() {
  return <Product />;
}
