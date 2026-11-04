import Link from "next/link";
import ProjectVisual from "./ProjectVisual";
import { ArrowIcon, GitHubIcon } from "./Icons";

export function Chips({ items }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Technologies used">
      {items.map((t) => (
        <li key={t} className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
          {t}
        </li>
      ))}
    </ul>
  );
}

export function ProjectLinks({ project, size = "sm" }) {
  const base =
    size === "lg"
      ? "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition"
      : "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition";
  return (
    <div className="relative z-10 flex flex-wrap gap-2">
      {project.live && (
        <a href={project.live} target="_blank" rel="noreferrer" className={`${base} bg-fg text-bg hover:opacity-85`}>
          Live app <ArrowIcon className="size-3.5" />
        </a>
      )}
      {project.demo && (
        <a href={project.demo} target="_blank" rel="noreferrer" className={`${base} bg-fg text-bg hover:opacity-85`}>
          Watch demo <ArrowIcon className="size-3.5" />
        </a>
      )}
      {project.repos.map((r) => (
        <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className={`${base} border border-line text-muted hover:border-fg hover:text-fg`}>
          <GitHubIcon className="size-3.5" /> {r.label}
        </a>
      ))}
    </div>
  );
}

export function FeaturedCard({ project, index }) {
  const reverse = index % 2 === 1;
  return (
    <article className="group relative grid items-center gap-8 rounded-3xl border border-line bg-card/50 p-4 transition duration-300 hover:border-accent/40 hover:shadow-[0_20px_60px_-24px_rgba(0,0,0,0.25)] sm:p-6 lg:grid-cols-2 lg:gap-12 lg:p-8">
      <div className={`relative ${reverse ? "lg:order-2" : ""}`}>
        <div className="absolute -inset-6 rounded-[2rem] opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" style={{ background: `${project.accent}26` }} />
        <ProjectVisual project={project} priority={index === 0} className="relative" />
      </div>
      <div>
        <p className="font-mono text-xs tracking-widest text-subtle">0{index + 1}</p>
        <p className="text-sm text-muted italic">“{project.problem}”</p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-1.5 hover:text-accent">
            {/* whole card is clickable */}
            <span className="absolute inset-0 rounded-3xl" aria-hidden />
            {project.name}
            <ArrowIcon className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </h3>
        <p className="mt-1 text-[15px] text-muted">{project.tagline}</p>
        <ul className="mt-4 space-y-2 text-[15px]">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2.5">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full" style={{ background: project.accent }} />
              <span>{h}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <Chips items={project.stack} />
        </div>
        <div className="mt-5">
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}

export function CompactCard({ project }) {
  return (
    <article className="group relative flex flex-col rounded-xl border border-line bg-card/50 p-5 transition hover:-translate-y-0.5 hover:border-accent/50">
      <div className="flex items-center gap-2.5">
        <span className="size-2.5 rounded-full" style={{ background: project.accent }} />
        <h3 className="font-semibold tracking-tight">
          <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-1 hover:text-accent">
            <span className="absolute inset-0 rounded-xl" aria-hidden />
            {project.name}
            <ArrowIcon className="size-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </h3>
      </div>
      <p className="mt-2 text-sm text-muted">{project.tagline}</p>
      <p className="mt-2 grow text-sm">{project.summary}</p>
      <div className="mt-4">
        <Chips items={project.stack.slice(0, 4)} />
      </div>
      {(project.live || project.demo || project.repos.length > 0) && (
        <div className="mt-4">
          <ProjectLinks project={project} />
        </div>
      )}
    </article>
  );
}
