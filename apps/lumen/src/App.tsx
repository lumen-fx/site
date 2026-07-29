import { NavBar } from "./components/NavBar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Showcase } from "./components/Showcase";
import { FeelCallout } from "./components/FeelCallout";
import { Benchmarks } from "./components/Benchmarks";
import { CapabilityMatrix } from "./components/CapabilityMatrix";
import { CtaBand } from "./components/CtaBand";
import { Footer } from "./components/Footer";
import { ScrollMeter } from "./components/ScrollMeter";
import { useTheme } from "./lib/useTheme";
import { useReveal } from "./lib/useReveal";

export function App() {
  const [theme, toggleTheme] = useTheme();
  useReveal();

  return (
    <>
      <ScrollMeter />
      <NavBar theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <FeelCallout />
        <Benchmarks />
        <CapabilityMatrix />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
