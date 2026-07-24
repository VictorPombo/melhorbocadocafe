import Hero from "@/components/Hero";
import Menu from "@/components/ActionButtons";
import About from "@/components/About";
import BlogPreview from "@/components/BlogPreview";
import Visit from "@/components/Hours";
import Footer from "@/components/Footer";
import { JsonLdLocalBusiness } from "@/components/JsonLd";

export default function Home() {
  return (
    <>
      <JsonLdLocalBusiness />
      <Hero />
      <Menu />
      <About />
      <BlogPreview />
      <Visit />
      <Footer />
    </>
  );
}
