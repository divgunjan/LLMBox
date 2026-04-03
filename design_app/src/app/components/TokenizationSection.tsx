import { motion } from "motion/react";

interface TokenizationSectionProps {
  inputText: string;
  onInputChange: (text: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = ["Qwen 2.5 7B", "Phi-4 Mini 3.8B", "Gemma 3 12B"];

export function TokenizationSection({
  inputText,
  onInputChange,
  selectedModel,
  onModelChange,
}: TokenizationSectionProps) {
  // Mock tokenization - different models may tokenize differently
  const tokenize = (text: string, model: string) => {
    if (model === "Qwen 2.5 7B") {
      return text.split(/(\s+|[,.!?;:])/g).filter(t => t.trim());
    } else if (model === "Phi-4 Mini 3.8B") {
      return text.split(/\b/).filter(t => t.trim());
    } else {
      return text.split(" ");
    }
  };

  const tokens = tokenize(inputText, selectedModel);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl">Tokenization: Breaking Down Text</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            LLMs don't process text as whole sentences. First, they break it down into tokens
            — individual units that can be words, parts of words, or punctuation.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="modelSelect">Select LLM Model:</label>
            <div className="flex gap-2">
              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => onModelChange(model)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedModel === model
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary"
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="tokenInput">Enter your text:</label>
            <textarea
              id="tokenInput"
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background resize-none"
              placeholder="Type something..."
              rows={3}
            />
          </div>

          <motion.div
            key={`${inputText}-${selectedModel}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-6 rounded-xl bg-card border border-border"
          >
            <h3 className="mb-4">Tokens (using {selectedModel}):</h3>
            <div className="flex flex-wrap gap-2">
              {tokens.map((token, index) => (
                <motion.div
                  key={`${token}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="px-3 py-2 rounded-lg border border-border"
                  style={{
                    backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 85%)`,
                    color: `hsl(${(index * 137.5) % 360}, 70%, 25%)`,
                  }}
                >
                  <span className="block text-xs opacity-70 mb-1">
                    #{index}
                  </span>
                  <span className="block font-medium">{token}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Total Tokens</p>
              <p className="text-2xl mt-1">{tokens.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Characters</p>
              <p className="text-2xl mt-1">{inputText.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Active Model</p>
              <p className="text-sm mt-1 truncate">{selectedModel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
