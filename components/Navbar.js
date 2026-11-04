"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/#builds", label: "Builds" },
  { href: "/#story", label: "Why" },
  { href: "/#experience", label: "Experience" },
  { href: "/#skills", label: "Toolbox" },
  { href: "/#about", label: "About" },
];

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${solid ? "border-b border-line bg-bg/75 backdrop-blur-xl" : "over-photo border-b border-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-12">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          <span>
            Sanskar Singh<span className="text-[#ff6a00]">.</span>
          </span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-1.5">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hidden rounded-full px-3 py-1.5 text-sm text-muted transition hover:text-fg lg:inline-block">
              {l.label}
            </a>
          ))}
          <a href={site.cv} target="_blank" rel="noreferrer" className="rounded-full border border-line px-3.5 py-1.5 text-sm font-medium transition hover:border-fg">
            CV
          </a>
          <a href="/#contact" className="rounded-full bg-fg px-4 py-1.5 text-sm font-semibold text-bg transition hover:opacity-85">
            Contact
          </a>
          <ThemeToggle className="ml-1 hidden sm:grid" />
        </nav>
      </div>
    </header>
  );
}
