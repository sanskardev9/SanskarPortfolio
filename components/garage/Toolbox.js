import { skills } from "@/data/site";
import { BrandIcon } from "../Icons";
import Reveal from "../Reveal";

// Skills hanging on a pegboard; tags swing when you hover them.
export default function Toolbox() {
  return (
    <section id="skills" aria-label="Skills" className="mx-auto max-w-6xl px-6 pt-28 md:px-12 md:pt-40">
      <p className="font-mono text-xs tracking-widest text-accent">04 · TOOLBOX</p>
      <h2 className="mt-3 max-w-3xl text-4xl leading-[1.05] font-black tracking-tight text-balance md:text-6xl">The tools on my wall.</h2>
      <Reveal className="pegboard mt-10 rounded-[1.5rem] border border-line p-4 sm:mt-12 sm:rounded-[2rem] sm:p-10">
        <div className="grid gap-7 sm:gap-10 md:grid-cols-2">
          {skills.map((g) => (
            <div key={g.group}>
              <p className="mb-3 inline-block rounded-md bg-fg px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-bg uppercase sm:mb-5 sm:px-2.5 sm:py-1 sm:text-[11px]">{g.group}</p>
              <ul className="flex flex-wrap gap-x-2 gap-y-3 sm:gap-x-3 sm:gap-y-5">
                {g.items.map((s) => (
                  <li key={s.name} className="tool-tag relative flex items-center gap-1.5 rounded-lg border border-line bg-bg px-2.5 pt-4 pb-1.5 text-[13px] font-medium shadow-[0_6px_14px_-8px_rgba(0,0,0,0.4)] sm:gap-2 sm:rounded-xl sm:px-3.5 sm:pt-5 sm:pb-2.5 sm:text-sm">
                    <BrandIcon name={s.icon} className="size-3.5 sm:size-4" />
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
