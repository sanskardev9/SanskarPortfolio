import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/data/projects";
import ProjectVisual from "@/components/ProjectVisual";
import ThemeToggle from "@/components/ThemeToggle";
import Reveal from "@/components/Reveal";
import { Chips, ProjectLinks } from "@/components/ProjectCard";
import { CheckIcon } from "@/components/Icons";
import Footer from "@/components/Footer";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: p.name, description: `${p.tagline} ${p.summary}` };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];

  return (
    <>
    <div id="top" className="relative z-10 mx-auto max-w-3xl px-6 py-10 md:px-12 md:py-16">
      <nav className="flex items-center justify-between">
        <Link href="/#projects" className="group inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-fg">
          <span className="transition group-hover:-translate-x-1"><svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5M11 6l-6 6 6 6" /></svg></span> All projects
        </Link>
        <ThemeToggle />
      </nav>

      <header className="mt-12">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="size-3 rounded-full" style={{ background: p.accent }} />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted">{p.featured ? "Featured project" : "Project"}</span>
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{p.name}</h1>
          <p className="mt-3 text-lg text-muted text-balance">{p.tagline}</p>
          <div className="mt-6">
            <ProjectLinks project={p} size="lg" />
          </div>
        </Reveal>
      </header>

      <Reveal delay={100} className="mt-10">
        <ProjectVisual project={p} priority />
      </Reveal>

      <div className="mt-14 space-y-14">
        {p.problem && (
          <Reveal as="section">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">The problem</h2>
            <p className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-balance">{p.problem}</p>
          </Reveal>
        )}

        <Reveal as="section">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">What it does</h2>
          <p className="mt-3 text-[17px]">{p.summary}</p>
        </Reveal>

        <Reveal as="section">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">What I built</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {p.features.map((f) => (
              <li key={f} className="flex gap-3 rounded-xl border border-line bg-card/60 p-4 text-[15px]">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-white" style={{ background: p.accent }}>
                  <CheckIcon className="size-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="section">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">Built with</h2>
          <Chips items={p.stack} />
        </Reveal>
      </div>

      <Link href={`/projects/${next.slug}`} className="group mt-20 flex items-center justify-between rounded-2xl border border-line p-6 transition hover:border-accent/50">
        <span>
          <span className="block text-xs font-semibold uppercase tracking-widest text-muted">Next project</span>
          <span className="mt-1 block text-xl font-semibold group-hover:text-accent">{next.name}</span>
        </span>
        <span className="transition group-hover:translate-x-1"><svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
      </Link>
    </div>
    <Footer />
    </>
  );
}
