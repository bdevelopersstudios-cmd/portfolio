import { NimbusShell } from "@/components/templates/nimbus/shell";
import { PreviewBar } from "@/components/templates/preview-bar";

/** Route layout so the nav and footer persist across every marketing screen. */
export default function NimbusLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NimbusShell>{children}</NimbusShell>
      <PreviewBar name="Nimbus" price={1000} />
    </>
  );
}
