export type ModelExplorationMessage = {
  kind: "ExploreModel";
  operation: "NewInit" | "NewTrace" | "NewFork" | "StepLeft" | "StepRight" | "Next";
};
