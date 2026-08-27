import { ConsoleShell } from "@/components/templates/console/shell";
import { PreviewBar } from "@/components/templates/preview-bar";

/** A route layout, so the sidebar, search and theme persist across screens. */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ConsoleShell>{children}</ConsoleShell>
      <PreviewBar name="Console" price={1000} />
    </>
  );
}
