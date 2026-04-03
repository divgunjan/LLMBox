import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PredictionSectionProps {
  inputText: string;
  selectedModel: string;
  probabilities: any[];
  loading?: boolean;
}

// Mock prediction data - in real implementation, this would come from the backend
const generatePredictions = (prompt: string) => {
  const predictions: Record<string, any[]> = {
    "The cat sat on the": [
      { token: "mat", probability: 0.38 },
      { token: "floor", probability: 0.25 },
      { token: "chair", probability: 0.18 },
      { token: "table", probability: 0.12 },
      { token: "bed", probability: 0.07 },
    ],
  };

  // If not found, generate generic predictions based on last word
  const words = prompt.trim().split(/\s+/);
  const lastWord = words[words.length - 1].toLowerCase();

  if (predictions[prompt]) {
    return predictions[prompt];
  }

  // Generic predictions based on common patterns
  if (lastWord === "the") {
    return [
      { token: "house", probability: 0.22 },
      { token: "world", probability: 0.18 },
      { token: "first", probability: 0.15 },
      { token: "best", probability: 0.25 },
      { token: "same", probability: 0.20 },
    ];
  }

  return [
    { token: "and", probability: 0.25 },
    { token: "to", probability: 0.20 },
    { token: "of", probability: 0.18 },
    { token: "in", probability: 0.22 },
    { token: "with", probability: 0.15 },
  ];
};

export function PredictionSection({ inputText, selectedModel, probabilities = [], loading = false }: PredictionSectionProps) {
  const predictions = probabilities.length > 0 
    ? probabilities.map(p => ({ token: p.token, probability: p.prob })) 
    : generatePredictions(inputText);

  const chartColors = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl">Next Token Prediction</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            After processing the input through embeddings and attention layers, the model
            calculates probability distributions for what token should come next.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`p-6 rounded-xl bg-card border border-border transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
        >
          <h3 className="mb-4">Predicted Next Tokens for: "{inputText}"</h3>
          <div className="text-sm text-muted-foreground mb-6">Using {selectedModel}</div>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={predictions}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                type="number"
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <YAxis type="category" dataKey="token" width={100} />
              <Tooltip
                formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="probability" radius={[0, 8, 8, 0]}>
                {predictions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Most Likely Token</p>
            <p className="text-2xl mt-1">{predictions[0]?.token}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(predictions[0]?.probability * 100).toFixed(1)}% probability
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Model Confidence</p>
            <p className="text-2xl mt-1">
              {predictions[0] ? (predictions[0].probability > 0.3 ? "High" : "Medium") : "N/A"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Based on training data patterns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
