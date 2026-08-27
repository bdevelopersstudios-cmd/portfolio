import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/templates/atelier/screens";
import { PROJECTS } from "@/components/templates/atelier/projects";

/** Required by `output: export` — every dynamic path is emitted at build time. */
export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  return { title: project ? `Atelier — ${project.title}` : "Atelier" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();
  return <CaseStudy project={project} />;
}
