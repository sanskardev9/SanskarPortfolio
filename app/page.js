import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/garage/Hero";
import Story from "@/components/garage/Story";
import Builds from "@/components/garage/Builds";
import ServiceLog from "@/components/garage/ServiceLog";
import Toolbox from "@/components/garage/Toolbox";
import OffClock from "@/components/garage/OffClock";
import Contact from "@/components/garage/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <main className="relative z-10">
        <Builds />
        <Story />
        <ServiceLog />
        <Toolbox />
        <OffClock />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
