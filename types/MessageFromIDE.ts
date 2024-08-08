export type ModelExplorationOp =
  | "NewInit"
  | "NewTrace"
  | "NewFork"
  | "StepLeft"
  | "StepRight"
  | "Next";

export type ModelExplorationMessage = {
  kind: "ExploreModel";
  operation: ModelExplorationOp;
};

export type MessageFromIDE = ModelExplorationMessage;
