import { ModelConfig } from "../types/ModelConfig.js";

let currentDomain: string = "";
let currentSubstance: string = "";
let currentConfig: ModelConfig = { isTrace: false };

const setCurrentDomain = (domain: string) => (currentDomain = domain);
const setCurrentSubstance = (substance: string) =>
  (currentSubstance = substance);
const setCurrentConfig = (config: ModelConfig) => (currentConfig = config);

export {
  currentDomain,
  currentSubstance,
  currentConfig,
  setCurrentDomain,
  setCurrentSubstance,
  setCurrentConfig,
};
