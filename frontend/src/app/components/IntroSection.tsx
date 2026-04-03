import { motion } from "motion/react";
import { Sun, Moon } from "lucide-react";

interface IntroSectionProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const logos = [
  { name: "DeepSeek", color: "#3b82f6", image: "https://avatars.githubusercontent.com/u/148330874?s=200&v=4" },
  { name: "Ollama", color: "#10b981", image: "https://avatars.githubusercontent.com/u/133802377?s=200&v=4" },
  { name: "Qwen", color: "#8b5cf6", image: "https://avatars.githubusercontent.com/u/143535608?s=200&v=4" },
  { name: "HuggingFace", color: "#f59e0b", image: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg" },
];

export function IntroSection({ theme, onToggleTheme }: IntroSectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 relative">
      <button
        onClick={onToggleTheme}
        className="fixed top-20 right-6 z-40 p-3 rounded-full bg-card border border-border hover:bg-muted transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      <div className="max-w-5xl w-full">
        <div className="flex items-center justify-between gap-8 mb-16">
          <div className="flex-1 space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-6xl tracking-tight"
            >
              LLMBox
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl text-muted-foreground"
            >
              Demystifying the Black Box in LLM Architectures
            </motion.p>
          </div>

          <div className="flex gap-4 flex-wrap justify-end">
            {logos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="relative group cursor-pointer"
              >
                <div
                  className="w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all bg-muted/20 overflow-hidden backdrop-blur-sm"
                  style={{
                    borderColor: logo.color,
                    boxShadow: `0 0 20px ${logo.color}40`
                  }}
                >
                  <img src={logo.image} alt={logo.name} className="w-10 h-10 object-contain drop-shadow-md rounded-full bg-white select-none pointer-events-none" />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap">
                  {logo.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-card border border-border rounded-2xl p-8 space-y-6"
        >
          <h2 className="text-2xl">What You'll Discover</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-primary font-semibold">🔤 Tokenization</div>
              <p className="text-sm text-muted-foreground">
                Watch text break into tokens — the building blocks LLMs actually read
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-primary font-semibold">📊 Vector Embeddings</div>
              <p className="text-sm text-muted-foreground">
                See words as coordinates in meaning-space, where similar concepts cluster together
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-primary font-semibold">🎯 Attention Mechanism</div>
              <p className="text-sm text-muted-foreground">
                Visualize how models decide which words to focus on for context
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-primary font-semibold">🎲 Next Token Prediction</div>
              <p className="text-sm text-muted-foreground">
                Explore probability distributions that determine what comes next
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-sm">Scroll down to begin the journey</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mt-4"
          >
            ↓
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}