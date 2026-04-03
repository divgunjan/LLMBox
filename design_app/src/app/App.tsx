import { useState, useEffect, useRef } from "react";
import { ScrollNavigation } from "./components/ScrollNavigation";
import { IntroSection } from "./components/IntroSection";
import { TokenizationSection } from "./components/TokenizationSection";
import { EmbeddingsSection } from "./components/EmbeddingsSection";
import { AttentionSection } from "./components/AttentionSection";
import { PredictionSection } from "./components/PredictionSection";
import { HomographSection } from "./components/HomographSection";

export default function App() {
  const [activeSection, setActiveSection] = useState("intro");
  const [inputText, setInputText] = useState("The cat sat on the mat");
  const [selectedModel, setSelectedModel] = useState("Qwen 2.5 7B");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const sectionRefs = {
    intro: useRef<HTMLDivElement>(null),
    tokenization: useRef<HTMLDivElement>(null),
    embeddings: useRef<HTMLDivElement>(null),
    attention: useRef<HTMLDivElement>(null),
    prediction: useRef<HTMLDivElement>(null),
    homographs: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const [key, ref] of Object.entries(sectionRefs)) {
        if (ref.current) {
          const { offsetTop, offsetHeight } = ref.current;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(key);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const scrollToSection = (sectionId: string) => {
    const ref = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="size-full bg-background overflow-x-hidden">
      <ScrollNavigation
        activeSection={activeSection}
        onSectionClick={scrollToSection}
      />

      <div ref={sectionRefs.intro}>
        <IntroSection theme={theme} onToggleTheme={toggleTheme} />
      </div>

      <div ref={sectionRefs.tokenization}>
        <TokenizationSection
          inputText={inputText}
          onInputChange={setInputText}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>

      <div ref={sectionRefs.embeddings}>
        <EmbeddingsSection inputText={inputText} selectedModel={selectedModel} />
      </div>

      <div ref={sectionRefs.attention}>
        <AttentionSection inputText={inputText} selectedModel={selectedModel} />
      </div>

      <div ref={sectionRefs.prediction}>
        <PredictionSection inputText={inputText} selectedModel={selectedModel} />
      </div>

      <div ref={sectionRefs.homographs}>
        <HomographSection inputText={inputText} selectedModel={selectedModel} />
      </div>
    </div>
  );
}