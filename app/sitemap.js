import { projects } from "@/data/projects";
import { site } from "@/data/site";

export default function sitemap() {
  return [
    { url: site.url, priority: 1 },
    ...projects.map((p) => ({ url: `${site.url}/projects/${p.slug}`, priority: 0.8 })),
  ];
}
