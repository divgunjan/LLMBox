import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface EmbeddingsSectionProps {
  inputText: string;
  selectedModel: string;
  embeddings: any[];
  loading?: boolean;
}

// Mock embedding data - in real implementation, this would come from the backend
const mockEmbeddings = [
  { word: "cat", x: 0.2, y: 0.3, category: "animal" },
  { word: "dog", x: 0.25, y: 0.35, category: "animal" },
  { word: "bird", x: 0.18, y: 0.28, category: "animal" },
  { word: "fish", x: 0.22, y: 0.32, category: "animal" },
  { word: "car", x: 0.7, y: 0.6, category: "vehicle" },
  { word: "bus", x: 0.72, y: 0.65, category: "vehicle" },
  { word: "train", x: 0.68, y: 0.58, category: "vehicle" },
  { word: "plane", x: 0.75, y: 0.62, category: "vehicle" },
  { word: "apple", x: 0.4, y: 0.8, category: "food" },
  { word: "banana", x: 0.42, y: 0.82, category: "food" },
  { word: "orange", x: 0.38, y: 0.78, category: "food" },
  { word: "grape", x: 0.43, y: 0.85, category: "food" },
];

const categoryColors: Record<string, string> = {
  animal: "#3b82f6",
  vehicle: "#ef4444",
  food: "#10b981",
};

export function EmbeddingsSection({ inputText, selectedModel, embeddings = [], loading = false }: EmbeddingsSectionProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.append("style").text(`
      text { fill: currentColor; }
      .domain, .tick line { stroke: currentColor; opacity: 0.3; }
    `);

    const activeData = embeddings.length > 0 ? embeddings : mockEmbeddings;

    const xExtent = d3.extent(activeData, (d: any) => d.x) as [number, number];
    const yExtent = d3.extent(activeData, (d: any) => d.y) as [number, number];

    const xPadding = ((xExtent[1] - xExtent[0]) * 0.1) || 0.1;
    const yPadding = ((yExtent[1] - yExtent[0]) * 0.1) || 0.1;

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([height - margin.bottom, margin.top]);

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr("class", "text-muted-foreground");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .attr("class", "text-muted-foreground");

    // Add axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("class", "text-sm")
      .text("Dimension 1");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("class", "text-sm")
      .text("Dimension 2");

    // the logic for activeData has been moved up
    const points = svg
      .selectAll("circle")
      .data(activeData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 0)
      .attr("fill", (d) => d.category ? categoryColors[d.category] : "#8b5cf6")
      .attr("opacity", 0.7)
      .attr("class", "cursor-pointer")
      .on("mouseenter", function () {
        d3.select(this).transition().duration(200).attr("r", 10);
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(200).attr("r", 6);
      });

    points
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr("r", 6);

    // Add labels
    const labels = svg
      .selectAll("text.label")
      .data(activeData)
      .enter()
      .append("text")
      .attr("class", "label text-xs")
      .attr("x", (d) => xScale(d.x) + 10)
      .attr("y", (d) => yScale(d.y) + 4)
      .text((d) => d.word)
      .attr("opacity", 0);

    labels.transition().duration(800).delay((d, i) => i * 50 + 400).attr("opacity", 1);

  }, [inputText, selectedModel, embeddings]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl">Vector Embeddings</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each token is converted into a high-dimensional vector. Similar concepts cluster together in this space,
            allowing the model to understand semantic relationships.
          </p>
        </div>

        <div className={`p-6 rounded-xl bg-card border border-border transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          <div className="mb-4 text-sm text-muted-foreground text-center">
            Analyzing: "{inputText}" using {selectedModel}
          </div>
          <div className="flex justify-center">
            <svg ref={svgRef} className="w-full max-w-4xl" />
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#8b5cf6" }} />
            <span className="text-sm">Tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
}
