import React from "react";

interface GaugeProps {
  value: number; // 0 to 100
  label: string;
}

const Gauge: React.FC<GaugeProps> = ({ value, label }) => {
  // Internal coordinate system for SVG (viewBox)
  const size = 300;
  const strokeWidth = 15;
  const center = size / 2;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Visible arc configuration: 270 degrees (75% of circle)
  // We hide the bottom 90 degrees (25%)
  const visibleFraction = 0.75;
  const hiddenFraction = 1 - visibleFraction;

  // Background Track Offset: fixed to hide bottom gap
  const trackOffset = circumference * hiddenFraction;

  // Progress Arc Offset:
  // Max visible length = circumference * 0.75
  // Current length = (value / 100) * Max visible length
  // StrokeDashoffset = circumference - Current length
  const progressOffset =
    circumference - (value / 100) * (circumference * visibleFraction);

  // Dynamic color based on value ranges
  const getColor = (value: number) => {
    if (value < 30) return "#3b82f6"; // Blue-500
    if (value < 60) return "#22c55e"; // Green-500
    if (value < 85) return "#eab308"; // Yellow-500
    return "#ef4444"; // Red-500
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[220px] aspect-square">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full transform rotate-[135deg]"
        style={{ overflow: "visible" }}
      >
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={trackOffset}
          strokeLinecap="round"
        />

        {/* Value Progress Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Text Overlay - Positioned absolutely to center text within the SVG ring */}
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none z-10">
        {/* Percentage Text: Large, Bold, Centered */}
        <span className="text-5xl font-bold text-white tracking-tight drop-shadow-lg tabular-nums leading-none">
          {Math.round(value)}%
        </span>

        {/* Label Text: Smaller, positioned below with spacing */}
        <span className="mt-3 text-sm font-bold text-slate-500 uppercase tracking-widest">
          {label}
        </span>
      </div>
    </div>
  );
};

export default Gauge;
