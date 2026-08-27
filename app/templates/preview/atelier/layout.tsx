import { AtelierShell } from "@/components/templates/atelier/shell";
import { PreviewBar } from "@/components/templates/preview-bar";

/** Route layout so the header and footer persist across every screen. */
export default function AtelierLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AtelierShell>{children}</AtelierShell>
      <PreviewBar name="Atelier" price={1000} />
    </>
  );
}
