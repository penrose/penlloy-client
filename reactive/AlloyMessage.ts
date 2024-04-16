import { RawInstance } from "../types/RawAlloyInstance.js";
import { RawModel } from "../types/RawAlloyModel.js";

export type ReceivedAlloyMessage = ConnectedMessage | ModelAndInstanceMessage;

export type ConnectedMessage = {
  kind: "connected";
};

export type ModelAndInstanceMessage = {
  kind: "ModelAndInstance";
  model: RawModel;
  instance: RawInstance;
};
