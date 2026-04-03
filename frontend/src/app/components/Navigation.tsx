import { motion } from "motion/react";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: "intro", label: "Introduction" },
  { id: "tokenization", label: "Tokenization" },
  { id: "embeddings", label: "Vector Embeddings" },
  { id: "attention", label: "Attention Mechanism" },
  { id: "prediction", label: "Next Token Prediction" },
  { id: "homographs", label: "Context Understanding" },
];

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl tracking-tight">LLM Architecture Explorer</h1>
          <div className="flex gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`relative px-4 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeSection === section.id && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute inset-0 bg-secondary rounded-lg"
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
