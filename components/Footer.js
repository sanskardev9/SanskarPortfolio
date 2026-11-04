import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { ridges } from "./Mountains";
import ThemeToggle from "./ThemeToggle";
import { GitHubIcon, LinkedInIcon, MailIcon } from "./Icons";

const col = "mb-4 text-xs font-semibold uppercase tracking-widest text-accent";
const lnk = "text-[15px] text-muted transition hover:text-fg";

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Horizon: photo rises like a sun behind the ridges, a tiny rider crosses the front */}
      <div className="relative h-44 sm:h-56">
        <div className="group absolute bottom-[40%] left-1/2 -translate-x-1/2 sm:left-[16%] sm:translate-x-0">
          <div className="absolute -inset-5 rounded-full bg-accent/25 blur-2xl transition group-hover:bg-accent/40" />
          <Image
            src="/sanskar.jpg"
            alt="Sanskar Singh"
            width={120}
            height={120}
            className="relative size-24 translate-y-0 rounded-full border-4 border-[var(--ridge-3)] object-cover shadow-xl transition duration-500 group-hover:-translate-y-2 sm:size-28"
          />
        </div>
        <svg viewBox="0 0 1440 240" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-full w-full" aria-hidden>
          <path d={ridges[0]} fill="var(--ridge-3)" />
          <path d={ridges[1]} fill="var(--ridge-2)" />
          <path d={ridges[2]} fill="var(--footer)" />
        </svg>
        <svg viewBox="0 0 40 24" className="footer-rider absolute bottom-[8%] h-4 w-7 text-fg/70" fill="currentColor" aria-hidden>
          <circle cx="8" cy="18" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="32" cy="18" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M8 18 L16 10 L26 10 L32 18 M16 10 L14 6 M26 10 L28 5 L31 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="21" cy="4" r="3" />
        </svg>
      </div>

      <div className="bg-[var(--footer)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pt-8 pb-10 md:px-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="text-2xl font-bold tracking-tight">{site.name}</p>
            <p className="mt-2 max-w-xs text-muted">If something bugs me twice, I build a fix for it.</p>
            <a href={`mailto:${site.email}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition hover:opacity-85">
              <MailIcon className="size-4" /> Say hello
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className={col}>Projects</p>
              <ul className="space-y-2.5">
                {projects.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/projects/${p.slug}`} className={lnk}>
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={col}>This site</p>
              <ul className="space-y-2.5">
                {["Story", "Projects", "Skills", "About", "Contact"].map((s) => (
                  <li key={s}>
                    <a href={`/#${s.toLowerCase()}`} className={lnk}>
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className={col}>Elsewhere</p>
              <ul className="space-y-2.5">
                <li><a href={site.github} target="_blank" rel="noreferrer" className={lnk}>GitHub</a></li>
                <li><a href={site.linkedin} target="_blank" rel="noreferrer" className={lnk}>LinkedIn</a></li>
                <li><a href={`mailto:${site.email}`} className={lnk}>Email</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl flex-col-reverse gap-6 border-t border-line px-6 py-6 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between md:px-12">
          <p>© 2026 Sanskar Singh. Built with Next.js, Tailwind CSS and three.js.</p>
          <div className="flex items-center gap-2">
            {[
              { href: site.github, label: "GitHub", Icon: GitHubIcon },
              { href: site.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
              { href: `mailto:${site.email}`, label: "Email", Icon: MailIcon },
            ].map(({ href, label, Icon }) => (
              <a key={label} href={href} aria-label={label} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-line/60 hover:text-fg">
                <Icon className="size-[18px]" />
              </a>
            ))}
            <a href="#top" aria-label="Back to top" className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-line/60 hover:text-fg">
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
            </a>
            <ThemeToggle className="ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
