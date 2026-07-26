import { NavBar } from "./components/NavBar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Showcase } from "./components/Showcase";
import { PerfCallout } from "./components/PerfCallout";
import { CtaBand } from "./components/CtaBand";
import { Footer } from "./components/Footer";
import { useTheme } from "./lib/useTheme";

export function App() {
  const [theme, toggleTheme] = useTheme();

  return (
    <>
      <NavBar theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <PerfCallout />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
