import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { HopiinScrollReveal } from './components/HopiinScrollReveal';
import { GrainOverlay } from './components/GrainOverlay';
import { Marquee } from './components/Marquee';
import { BrandShowcase } from './components/MediaShowcase';
import { StorySection } from './components/StorySection';
import { FeatureShowcase } from './components/FeatureShowcase';
import { ExperienceFlow } from './components/ExperienceFlow';
import { HopiinCircle } from './components/HopiinCircle';
import { WaitlistCTA } from './components/WaitlistCTA';
import { Footer } from './components/Footer';
import { useSmoothScroll } from './hooks/useSmoothScroll';

export default function App() {
  useSmoothScroll();

  return (
    <>
      <GrainOverlay />
      <Nav />
      <main>
        <Hero />
        <HopiinScrollReveal />
        <Marquee />
        <BrandShowcase />
        <StorySection />
        <FeatureShowcase />
        <ExperienceFlow />
        <HopiinCircle />
        <WaitlistCTA />
      </main>
      <Footer />
    </>
  );
}
