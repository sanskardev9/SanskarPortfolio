import Image from "next/image";

// Real screenshot: desktop apps in a browser frame, mobile apps in a phone frame on an accent backdrop.
// Falls back to a tasteful placeholder when there is no screenshot.
export default function ProjectVisual({ project, priority = false, className = "" }) {
  const backdrop = {
    background: `radial-gradient(120% 90% at 0% 0%, ${project.accent}40, transparent 60%), radial-gradient(90% 90% at 100% 100%, ${project.accent}26, transparent 60%), var(--card)`,
  };

  if (project.image && project.device === "phone") {
    return (
      <div className={`relative flex aspect-[16/10] items-end justify-center overflow-hidden rounded-xl border border-line ${className}`} style={backdrop}>
        <div className="relative w-[38%] max-w-[230px] translate-y-[10%] rounded-[2rem] border-[6px] border-[#111] bg-[#111] shadow-2xl transition duration-500 group-hover:translate-y-[6%]">
          <div className="absolute top-1.5 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-[#111]" />
          <Image
            src={project.image}
            alt={`${project.name} on a phone`}
            width={780}
            height={1688}
            priority={priority}
            sizes="(min-width: 1024px) 230px, 40vw"
            className="h-auto w-full rounded-[1.6rem]"
          />
        </div>
      </div>
    );
  }

  if (project.image) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-line bg-[#0c0d10] ${className}`}>
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          {project.live && <span className="ml-3 truncate rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/50">{project.live.replace("https://", "")}</span>}
        </div>
        <Image
          src={project.image}
          alt={`${project.name} screenshot`}
          width={1440}
          height={900}
          priority={priority}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="h-auto w-full transition duration-700 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-[16/10] overflow-hidden rounded-xl border border-line ${className}`} style={backdrop}>
      <div className="absolute inset-x-[8%] top-[14%] bottom-0 rounded-t-lg border border-b-0 border-line bg-bg/70 p-3 shadow-xl backdrop-blur transition duration-500 group-hover:-translate-y-1">
        <div className="mb-3 flex gap-1.5">
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
        </div>
        <div className="flex items-center gap-2">
          <span className="size-5 rounded-md" style={{ background: project.accent }} />
          <span className="text-sm font-semibold">{project.name}</span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-2 w-3/4 rounded bg-line" />
          <div className="h-2 w-1/2 rounded bg-line" />
        </div>
      </div>
    </div>
  );
}
