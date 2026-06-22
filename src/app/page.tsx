import { Hero } from "@/components/home/hero";
import { SearchTools } from "@/components/home/search-tools";
import { PopularTools } from "@/components/home/popular-tools";
import { FeatureHighlights } from "@/components/home/feature-highlights";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularTools />
      <SearchTools />
      <FeatureHighlights />
      <Testimonials />
      <FAQ />
    </>
  );
}
