import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Work } from "@/components/work";
import { Impact } from "@/components/impact";
import { Experience } from "@/components/experience";
import { Skills } from "@/components/skills";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Work />
      <Impact />
      <Experience />
      <Skills />
      <Contact />
    </main>
  );
}
