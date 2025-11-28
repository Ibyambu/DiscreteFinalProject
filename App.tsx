import React, { useState, useMemo } from "react";
import { calculateFanSpeed } from "./services/fuzzyLogic";
import SurfacePlot from "./components/SurfacePlot";
import ControlPanel from "./components/ControlPanel";
import Gauge from "./components/Gauge";
import { Cpu, Info } from "lucide-react";

const App: React.FC = () => {
  const [temperature, setTemperature] = useState<number>(24);
  const [occupancy, setOccupancy] = useState<number>(5);

  // Recalculate fuzzy logic whenever inputs change
  const simulationResult = useMemo(() => {
    return calculateFanSpeed(temperature, occupancy);
  }, [temperature, occupancy]);

  const currentState = {
    temperature,
    occupancy,
    fanSpeed: simulationResult.speed,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
            <Cpu
              size={36}
              className="text-cyan-400"
            />
            SR TEMPERATURE CONTROLLER
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base max-w-2xl">
            Adjust inputs to see how the fuzzy engine determines optimal fan
            speed.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & Rules (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Output Gauge (Mobile: Top, Desktop: In column) */}
          <div className="bg-slate-800/80 p-10 rounded-2xl border border-slate-700 shadow-lg flex flex-col items-center justify-center backdrop-blur-sm">
            <h2 className="text-slate-400 text-sm uppercase tracking-widest font-semibold mb-4">
              Calculated Output
            </h2>
            <Gauge
              value={simulationResult.speed}
              label="Power"
            />
            <div className="mt-4 text-center">
              <p className="text-slate-500 text-xs">Defuzzification Method</p>
              <p className="text-cyan-400 font-mono text-sm">
                Centroid (Center of Gravity)
              </p>
            </div>
          </div>

          <ControlPanel
            temperature={temperature}
            setTemperature={setTemperature}
            occupancy={occupancy}
            setOccupancy={setOccupancy}
            activeRules={simulationResult.activeRules}
          />
        </div>

        {/* Right Column: 3D Visualization (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-grow min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-xl font-semibold text-slate-200">
                Control Surface Topology
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <Info size={14} />
                <span>
                  Shows Fan Speed (Z) for all Temp (X) & Occupancy (Y)
                </span>
              </div>
            </div>
            <SurfacePlot currentState={currentState} />
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
              <h4 className="text-orange-400 font-semibold mb-1">
                Temperature Input
              </h4>
              <p className="text-xs text-slate-400">
                Mapped to 3 fuzzy sets: Cold, Comfortable, Hot. Uses trapezoidal
                edges and triangular center.
              </p>
            </div>
            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
              <h4 className="text-blue-400 font-semibold mb-1">
                Occupancy Input
              </h4>
              <p className="text-xs text-slate-400">
                Impacts cooling load. High occupancy triggers higher fan speeds
                even at moderate temperatures.
              </p>
            </div>
            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
              <h4 className="text-emerald-400 font-semibold mb-1">
                Smooth Transitions
              </h4>
              <p className="text-xs text-slate-400">
                Fuzzy logic prevents abrupt switching between speeds, providing
                analog-like control from discrete rules.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
