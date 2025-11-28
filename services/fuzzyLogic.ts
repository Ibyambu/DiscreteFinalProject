import { FuzzySet, RuleResult } from "../types";

// --- Membership Functions ---

// Triangular Membership Function
const trimf = (x: number, a: number, b: number, c: number): number => {
  return Math.max(0, Math.min((x - a) / (b - a), (c - x) / (c - b)));
};

// Trapezoidal Membership Function
const trapmf = (
  x: number,
  a: number,
  b: number,
  c: number,
  d: number
): number => {
  return Math.max(0, Math.min((x - a) / (b - a), 1, (d - x) / (d - c)));
};

// --- Input Membership Definitions ---

export const getTempMembership = (temp: number) => {
  const low = trapmf(temp, -10, 10, 18, 22); // Cold: Trapezoid starts broad at low temps
  const medium = trimf(temp, 20, 24, 28); // Comfortable: Triangle centered around 24
  const high = trapmf(temp, 26, 30, 50, 50); // Hot: Trapezoid starting from high 20s

  return {
    [FuzzySet.Low]: low,
    [FuzzySet.Medium]: medium,
    [FuzzySet.High]: high,
  };
};

export const getOccupancyMembership = (people: number) => {
  // Low Occupancy (0-5 people)
  const low = trapmf(people, -1, 0, 3, 6);
  // Medium Occupancy (4-12 people)
  const medium = trimf(people, 4, 8, 12);
  // High Occupancy (10+ people)
  const high = trapmf(people, 10, 14, 25, 25);

  return {
    [FuzzySet.Low]: low,
    [FuzzySet.Medium]: medium,
    [FuzzySet.High]: high,
  };
};

// --- Output Membership Definitions (Fan Speed 0-100%) ---

const getOutputMembership = (speed: number) => {
  // Low Speed
  const low = trapmf(speed, -10, 0, 30, 50);
  // Medium Speed
  const medium = trimf(speed, 30, 50, 70);
  // High Speed
  const high = trapmf(speed, 50, 80, 110, 110);

  return {
    [FuzzySet.Low]: low,
    [FuzzySet.Medium]: medium,
    [FuzzySet.High]: high,
  };
};

// --- Inference Engine ---

export const evaluateRules = (
  tempM: { [key in FuzzySet]: number },
  occM: { [key in FuzzySet]: number }
): RuleResult[] => {
  const rules: RuleResult[] = [];

  // Rule 1: If Temp Low AND Occ Low -> Fan Low
  rules.push({
    ruleName: "Cold & Empty",
    firingStrength: Math.min(tempM.Low, occM.Low),
    outputSet: FuzzySet.Low,
  });

  // Rule 2: If Temp Low AND Occ Medium -> Fan Low
  rules.push({
    ruleName: "Cold & Some People",
    firingStrength: Math.min(tempM.Low, occM.Medium),
    outputSet: FuzzySet.Low,
  });

  // Rule 3: If Temp Low AND Occ High -> Fan Medium (Body heat compensation)
  rules.push({
    ruleName: "Cold & Crowded",
    firingStrength: Math.min(tempM.Low, occM.High),
    outputSet: FuzzySet.Medium,
  });

  // Rule 4: If Temp Medium AND Occ Low -> Fan Low
  rules.push({
    ruleName: "Comfort & Empty",
    firingStrength: Math.min(tempM.Medium, occM.Low),
    outputSet: FuzzySet.Low,
  });

  // Rule 5: If Temp Medium AND Occ Medium -> Fan Medium
  rules.push({
    ruleName: "Comfort & Some People",
    firingStrength: Math.min(tempM.Medium, occM.Medium),
    outputSet: FuzzySet.Medium,
  });

  // Rule 6: If Temp Medium AND Occ High -> Fan High
  rules.push({
    ruleName: "Comfort & Crowded",
    firingStrength: Math.min(tempM.Medium, occM.High),
    outputSet: FuzzySet.High,
  });

  // Rule 7: If Temp High AND Occ Low -> Fan Medium
  rules.push({
    ruleName: "Hot & Empty",
    firingStrength: Math.min(tempM.High, occM.Low),
    outputSet: FuzzySet.Medium,
  });

  // Rule 8: If Temp High AND Occ Medium -> Fan High
  rules.push({
    ruleName: "Hot & Some People",
    firingStrength: Math.min(tempM.High, occM.Medium),
    outputSet: FuzzySet.High,
  });

  // Rule 9: If Temp High AND Occ High -> Fan High
  rules.push({
    ruleName: "Hot & Crowded",
    firingStrength: Math.min(tempM.High, occM.High),
    outputSet: FuzzySet.High,
  });

  return rules;
};

// --- Defuzzification (Centroid Method) ---

export const calculateFanSpeed = (
  temperature: number,
  occupancy: number
): { speed: number; activeRules: RuleResult[] } => {
  const tempM = getTempMembership(temperature);
  const occM = getOccupancyMembership(occupancy);

  const rules = evaluateRules(tempM, occM);

  // Aggregate output membership function
  // We iterate through the output domain (0 to 100) and find the max firing strength for that point
  // based on the consequent of the rules.

  let numerator = 0;
  let denominator = 0;
  const step = 1; // Integration step size

  // Optimization: Pre-calculate max firing strength for each output set
  const maxFiringBySet = {
    [FuzzySet.Low]: 0,
    [FuzzySet.Medium]: 0,
    [FuzzySet.High]: 0,
  };

  rules.forEach((r) => {
    if (r.firingStrength > maxFiringBySet[r.outputSet]) {
      maxFiringBySet[r.outputSet] = r.firingStrength;
    }
  });

  for (let x = 0; x <= 100; x += step) {
    const outputM = getOutputMembership(x);

    // Mamdani Inference: Clip the output membership by the firing strength
    const valLow = Math.min(outputM.Low, maxFiringBySet.Low);
    const valMed = Math.min(outputM.Medium, maxFiringBySet.Medium);
    const valHigh = Math.min(outputM.High, maxFiringBySet.High);

    // Union (Max) of all clipped sets
    const aggregateMembership = Math.max(valLow, valMed, valHigh);

    numerator += x * aggregateMembership;
    denominator += aggregateMembership;
  }

  const speed = denominator === 0 ? 0 : numerator / denominator;

  return {
    speed,
    activeRules: rules.filter((r) => r.firingStrength > 0.01), // Only return relevant rules
  };
};

// --- Data Generation for 3D Plot ---

export const generateSurfaceData = () => {
  const xData: number[] = []; // Temperature
  const yData: number[] = []; // Occupancy
  const zData: number[][] = []; // Fan Speed Matrix

  const tempStart = 10,
    tempEnd = 40,
    tempStep = 1;
  const occStart = 0,
    occEnd = 20,
    occStep = 1;

  for (let t = tempStart; t <= tempEnd; t += tempStep) {
    xData.push(t);
  }

  for (let o = occStart; o <= occEnd; o += occStep) {
    yData.push(o);
  }

  // NOTE: Plotly expects Z to be [y][x] or [row][col]
  // We need to iterate Y first (rows) then X (cols)
  for (let o = occStart; o <= occEnd; o += occStep) {
    const row: number[] = [];
    for (let t = tempStart; t <= tempEnd; t += tempStep) {
      const result = calculateFanSpeed(t, o);
      row.push(result.speed);
    }
    zData.push(row);
  }

  return { x: xData, y: yData, z: zData };
};
