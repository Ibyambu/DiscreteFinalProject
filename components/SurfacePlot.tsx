import React, { useEffect, useRef, useMemo } from "react";
import { generateSurfaceData } from "../services/fuzzyLogic";
import { SimulationState } from "../types";

declare global {
  interface Window {
    Plotly: any;
  }
}

interface SurfacePlotProps {
  currentState: SimulationState;
}

const SurfacePlot: React.FC<SurfacePlotProps> = ({ currentState }) => {
  const plotDivRef = useRef<HTMLDivElement>(null);

  // Memorize the surface calculation so we don't re-compute the whole grid on every slider move
  const surfaceData = useMemo(() => generateSurfaceData(), []);

  useEffect(() => {
    if (!window.Plotly || !plotDivRef.current) return;

    const data = [
      {
        z: surfaceData.z,
        x: surfaceData.x,
        y: surfaceData.y,
        type: "surface",
        contours: {
          z: {
            show: true,
            usecolormap: true,
            highlightcolor: "#42f542",
            project: { z: true },
          },
        },
        colorscale: "Viridis",
        showscale: false,
        opacity: 0.9,
      },
      // Add a marker for the current state
      {
        x: [currentState.temperature],
        y: [currentState.occupancy],
        z: [currentState.fanSpeed],
        mode: "markers",
        type: "scatter3d",
        marker: {
          color: "red",
          size: 8,
          symbol: "circle",
          line: {
            color: "white",
            width: 2,
          },
        },
        name: "Current State",
      },
    ];

    const layout = {
      title: {
        text: "Fuzzy Control Surface",
        font: { color: "#e2e8f0", size: 16 },
      },
      autosize: true,
      margin: { l: 0, r: 0, b: 0, t: 40 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      scene: {
        xaxis: { title: "Temp (°C)", color: "#94a3b8" },
        yaxis: { title: "Occupancy", color: "#94a3b8" },
        zaxis: { title: "Fan Speed (%)", color: "#94a3b8" },
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.5 },
        },
      },
      showlegend: false,
    };

    const config = { responsive: true, displayModeBar: false };

    window.Plotly.newPlot(plotDivRef.current, data, layout, config);

    return () => {
      if (plotDivRef.current) {
        window.Plotly.purge(plotDivRef.current);
      }
    };
  }, [surfaceData, currentState]);

  return (
    <div className="w-full h-96 md:h-full bg-slate-800/50 rounded-xl border border-slate-700 shadow-xl overflow-hidden relative">
      <div
        ref={plotDivRef}
        className="w-full h-full"
      />
      <div className="absolute bottom-2 right-2 text-xs text-slate-500 pointer-events-none">
        Interactive 3D View
      </div>
    </div>
  );
};

export default SurfacePlot;
