import React from "react";
import { RuleResult, FuzzySet } from "../types";
import { Thermometer, Users, Wind, Activity } from "lucide-react";

interface ControlPanelProps {
  temperature: number;
  setTemperature: (val: number) => void;
  occupancy: number;
  setOccupancy: (val: number) => void;
  activeRules: RuleResult[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  temperature,
  setTemperature,
  occupancy,
  setOccupancy,
  activeRules,
}) => {
  return (
    <div className="space-y-8">
      {/* Inputs */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-cyan-400">
          <Activity size={20} />
          System Inputs
        </h2>

        {/* Temperature Slider */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <label className="flex items-center gap-2 text-slate-300">
              <Thermometer
                size={18}
                className="text-orange-400"
              />{" "}
              Temperature
            </label>
            <span className="text-orange-400 font-mono font-bold">
              {temperature}°C
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="40"
            step="0.5"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>10°C (Cold)</span>
            <span>40°C (Hot)</span>
          </div>
        </div>

        {/* Occupancy Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="flex items-center gap-2 text-slate-300">
              <Users
                size={18}
                className="text-blue-400"
              />{" "}
              Occupancy
            </label>
            <span className="text-blue-400 font-mono font-bold">
              {occupancy} ppl
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={occupancy}
            onChange={(e) => setOccupancy(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Empty</span>
            <span>Crowded (20)</span>
          </div>
        </div>
      </div>

      {/* Rules Visualization */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-400">
          <Wind size={20} />
          Fuzzy Inference Engine
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-slate-500 border-b border-slate-700 pb-2 mb-2">
            <span>Active Rule</span>
            <span>Firing Strength (Weight)</span>
          </div>
          {activeRules.length === 0 ? (
            <div className="text-slate-500 text-sm italic">
              No significant rules firing.
            </div>
          ) : (
            activeRules.map((rule, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-slate-200">
                  {rule.ruleName}{" "}
                  <span className="text-slate-500">→ {rule.outputSet}</span>
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${rule.firingStrength * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-mono text-emerald-400 w-10 text-right">
                    {rule.firingStrength.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
