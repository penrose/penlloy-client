import { RawInstance } from "./RawAlloyInstance.js";
import { RawModel } from "./RawAlloyModel.js";

export type MessageFromAlloy =
  | ConnectedMessage
  | ModelAndInstanceMessage
  | ConfigMessage;

export type ConnectedMessage = {
  kind: "connected";
};

export type ModelAndInstanceMessage = {
  kind: "ModelAndInstance";
  model: RawModel;
  instance: RawInstance;
};

export type ConfigMessage = {
  kind: "Config";
  isTrace: boolean;
};
