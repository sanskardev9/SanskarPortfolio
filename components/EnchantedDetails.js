import { CVButton } from './CVLetter';
import { site } from '@/data/site';
export default function EnchantedDetails() {
  return <section id="cv" className="resume-invitation scroll-mt-24"><div><p className="eyebrow">EXPERIENCE / EDUCATION / PROJECTS</p><h2>The résumé.</h2><p>My professional experience and technical background, in the original document.</p></div><div><CVButton className="magic-button">Open my CV ↗</CVButton><a className="text-link" href={site.cv} download>Download PDF ↓</a></div></section>;
}
