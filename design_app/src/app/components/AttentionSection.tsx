import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface AttentionSectionProps {
  inputText: string;
  selectedModel: string;
}

export function AttentionSection({ inputText, selectedModel }: AttentionSectionProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Mock attention weights - split input into tokens
    const sentence = inputText.split(/\s+/).slice(0, 6);
    const n = sentence.length;

    // Generate mock attention weights
    const mockAttentionWeights = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => {
        if (i === j) return 0.6 + Math.random() * 0.2;
        const distance = Math.abs(i - j);
        return Math.max(0.05, 0.5 / distance + Math.random() * 0.1);
      })
    );

    const width = 600;
    const height = 600;
    const cellSize = Math.min(80, 480 / n);
    const margin = 60;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Color scale for attention weights
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, 1]);

    // Create heatmap cells
    const g = svg.append("g").attr("transform", `translate(${margin}, ${margin})`);

    // Add cells
    const cells = g
      .selectAll("rect")
      .data(mockAttentionWeights.flatMap((row, i) => row.map((value, j) => ({ i, j, value }))))
      .enter()
      .append("rect")
      .attr("x", (d) => d.j * cellSize)
      .attr("y", (d) => d.i * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", (d) => colorScale(d.value))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("stroke-width", 4);
        tooltip.style("opacity", 1)
          .html(`Attention: ${d.value.toFixed(3)}<br/>From: ${sentence[d.i]}<br/>To: ${sentence[d.j]}`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("stroke-width", 2);
        tooltip.style("opacity", 0);
      });

    cells
      .transition()
      .duration(600)
      .delay((d, i) => i * 20)
      .attr("opacity", 1);

    // Add row labels
    g.selectAll("text.row-label")
      .data(sentence)
      .enter()
      .append("text")
      .attr("class", "row-label text-sm")
      .attr("x", -10)
      .attr("y", (d, i) => i * cellSize + cellSize / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .text((d) => d)
      .attr("opacity", 0)
      .transition()
      .duration(600)
      .delay((d, i) => i * 50)
      .attr("opacity", 1);

    // Add column labels
    g.selectAll("text.col-label")
      .data(sentence)
      .enter()
      .append("text")
      .attr("class", "col-label text-sm")
      .attr("x", (d, i) => i * cellSize + cellSize / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text((d) => d)
      .attr("opacity", 0)
      .transition()
      .duration(600)
      .delay((d, i) => i * 50)
      .attr("opacity", 1);

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "absolute bg-card border border-border rounded-lg px-3 py-2 text-sm pointer-events-none shadow-lg")
      .style("opacity", 0)
      .style("z-index", 1000);

    return () => {
      tooltip.remove();
    };
  }, [inputText, selectedModel]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl">Attention Mechanism</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The attention mechanism allows the model to focus on different parts of the input.
            Each cell shows how much attention one token pays to another.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="mb-4 text-sm text-muted-foreground text-center">
            Analyzing: "{inputText}" using {selectedModel}
          </div>
          <div className="flex justify-center mb-6">
            <svg ref={svgRef} className="w-full max-w-3xl" />
          </div>

          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Darker colors indicate stronger attention weights
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: "#deebf7" }} />
                <span className="text-sm">Low</span>
              </div>
              <div className="w-32 h-6 rounded" style={{ background: "linear-gradient(to right, #deebf7, #08519c)" }} />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: "#08519c" }} />
                <span className="text-sm">High</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted">
          <p className="text-sm">
            <strong>Example:</strong> Words pay high attention to related tokens — helping the model understand sentence structure and meaning through contextual relationships.
          </p>
        </div>
      </div>
    </div>
  );
}
