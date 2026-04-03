import { motion } from "motion/react";

const sections = [
  { id: "intro", label: "Intro" },
  { id: "tokenization", label: "Tokenization" },
  { id: "embeddings", label: "Embeddings" },
  { id: "attention", label: "Attention" },
  { id: "prediction", label: "Prediction" },
  { id: "homographs", label: "Context" },
];

interface ScrollNavigationProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export function ScrollNavigation({ activeSection, onSectionClick }: ScrollNavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">LLMBox</h1>

          <div className="flex gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className="relative px-4 py-2 text-sm transition-colors hover:text-primary"
              >
                {activeSection === section.id && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
