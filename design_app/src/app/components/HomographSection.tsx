import { motion } from "motion/react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

interface HomographSectionProps {
  inputText: string;
  selectedModel: string;
}

// Mock homograph examples demonstrating context understanding
const homographExamples = [
  {
    word: "bat",
    sentence1: "The baseball player swung the bat",
    sentence2: "A bat flew through the dark cave",
    meaning1: "Sports equipment (wooden stick)",
    meaning2: "Flying mammal",
    attention1: ["baseball", "player", "swung"],
    attention2: ["flew", "dark", "cave"],
  },
  {
    word: "bank",
    sentence1: "I deposited money at the bank",
    sentence2: "We sat by the river bank",
    meaning1: "Financial institution",
    meaning2: "Edge of a river",
    attention1: ["deposited", "money"],
    attention2: ["river", "sat"],
  },
  {
    word: "lead",
    sentence1: "She will lead the team to victory",
    sentence2: "The pipe was made of lead",
    meaning1: "To guide or direct (verb)",
    meaning2: "Heavy metal (noun)",
    attention1: ["will", "team", "victory"],
    attention2: ["pipe", "made", "of"],
  },
];

export function HomographSection({ inputText, selectedModel }: HomographSectionProps) {
  const [selectedExample, setSelectedExample] = useState(0);
  const example = homographExamples[selectedExample];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl">Context Understanding: Homographs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            LLMs use attention mechanisms to understand context and disambiguate words with multiple meanings.
            See how the model focuses on different words to determine the correct interpretation.
          </p>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Processing with {selectedModel}
        </div>

        <div className="flex justify-center gap-2">
          {homographExamples.map((ex, index) => (
            <button
              key={index}
              onClick={() => setSelectedExample(index)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedExample === index
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary"
              }`}
            >
              {ex.word}
            </button>
          ))}
        </div>

        <motion.div
          key={selectedExample}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-xl bg-card border border-border space-y-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-chart-1 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="mb-2">Context 1</h3>
                <div className="mb-4">
                  <p className="text-lg mb-2">
                    {example.sentence1.split(" ").map((word, idx) => {
                      const isTarget = word.toLowerCase().includes(example.word.toLowerCase());
                      const isAttention = example.attention1.some((w) =>
                        word.toLowerCase().includes(w.toLowerCase())
                      );
                      return (
                        <span
                          key={idx}
                          className={`${
                            isTarget
                              ? "bg-chart-1 text-white px-2 py-1 rounded"
                              : isAttention
                              ? "bg-chart-1/20 px-2 py-1 rounded"
                              : ""
                          }`}
                        >
                          {word}{" "}
                        </span>
                      );
                    })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm">
                    <strong>Interpreted meaning:</strong> {example.meaning1}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The model pays attention to:{" "}
                    <strong>{example.attention1.join(", ")}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-chart-2 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="mb-2">Context 2</h3>
                <div className="mb-4">
                  <p className="text-lg mb-2">
                    {example.sentence2.split(" ").map((word, idx) => {
                      const isTarget = word.toLowerCase().includes(example.word.toLowerCase());
                      const isAttention = example.attention2.some((w) =>
                        word.toLowerCase().includes(w.toLowerCase())
                      );
                      return (
                        <span
                          key={idx}
                          className={`${
                            isTarget
                              ? "bg-chart-2 text-white px-2 py-1 rounded"
                              : isAttention
                              ? "bg-chart-2/20 px-2 py-1 rounded"
                              : ""
                          }`}
                        >
                          {word}{" "}
                        </span>
                      );
                    })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm">
                    <strong>Interpreted meaning:</strong> {example.meaning2}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The model pays attention to:{" "}
                    <strong>{example.attention2.join(", ")}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-r from-chart-1/10 to-chart-2/10 border border-border">
            <h3 className="mb-2">How It Works</h3>
            <p className="text-sm text-muted-foreground">
              The attention mechanism allows the model to focus on surrounding words that provide context.
              By analyzing which words are most relevant (shown in highlighted backgrounds), the model determines
              the correct meaning of "<strong>{example.word}</strong>" in each sentence. This same process
              happens across millions of parameters and multiple layers in real LLMs.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
