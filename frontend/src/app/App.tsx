import { useState, useEffect, useRef } from "react";
import { ScrollNavigation } from "./components/ScrollNavigation";
import { IntroSection } from "./components/IntroSection";
import { TokenizationSection } from "./components/TokenizationSection";
import { EmbeddingsSection } from "./components/EmbeddingsSection";
import { AttentionSection } from "./components/AttentionSection";
import { PredictionSection } from "./components/PredictionSection";
import { HomographSection } from "./components/HomographSection";
import { FloatingChat } from "./components/FloatingChat";

export default function App() {
  const [activeSection, setActiveSection] = useState("intro");
  const [inputText, setInputText] = useState("");
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

  const [llmData, setLlmData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!inputText) return;
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase: inputText, model_name: selectedModel.toLowerCase().replace(/ /g, '-').replace('.5-', '.5') })
      });
      const data = await res.json();
      setLlmData(data);
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Removed on-mount generation based on user request. 
  // It will now only trigger when 'handleGenerate' is explicitly called via UI.
  useEffect(() => {
    // Initial mount hook if needed
  }, []);

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
          onGenerate={handleGenerate}
          tokens={llmData?.tokens || []}
          loading={loading}
        />
      </div>

      <div ref={sectionRefs.embeddings}>
        <EmbeddingsSection inputText={inputText} selectedModel={selectedModel} embeddings={llmData?.embeddings || []} loading={loading} />
      </div>

      <div ref={sectionRefs.attention}>
        <AttentionSection inputText={inputText} selectedModel={selectedModel} attention={llmData?.attention || []} loading={loading} />
      </div>

      <div ref={sectionRefs.prediction}>
        <PredictionSection inputText={inputText} selectedModel={selectedModel} probabilities={llmData?.probabilities || []} loading={loading} />
      </div>

      <div ref={sectionRefs.homographs}>
        <HomographSection inputText={inputText} selectedModel={selectedModel} />
      </div>

      <FloatingChat />
    </div>
  );
}