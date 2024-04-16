import { WebSocket } from "ws";
import { ReceivedAlloyMessage } from "./AlloyMessage.js";
import { compileModel, translateToDomain } from "../generator/domain.js";
import {
  compileInstance,
  translateToSubstance,
} from "../generator/substance.js";
import * as fs from "fs";
import { broadcast } from "./PenroseProgramServer.js";

export const modelInstanceClient = (port: number = 1549) => {
  const ws: WebSocket = new WebSocket("ws://localhost:" + port);
  ws.onopen = () => {
    console.info("client: Penlloy connection started.");
  };
  ws.onerror = (error) => {
    console.error("client: Encountered error with message " + error.message);
    console.error("client: Exiting now.");
  };
  ws.onclose = () => {
    console.info("client: Alloy disconnected");
  };

  ws.onmessage = (event) => {
    const msgStr = event.data as string;
    const msgJson = JSON.parse(msgStr) as ReceivedAlloyMessage;

    if (msgJson.kind === "connected") {
      console.info("client: connected to Alloy server");
    } else {
      console.info("client: received model and instance");
      const rawModel = msgJson.model;
      const compiledModel = compileModel(rawModel);
      const domain = translateToDomain(compiledModel);
      const rawInstance = msgJson.instance;
      const substance = translateToSubstance(
        compileInstance(rawInstance, compiledModel)
      );

      console.log("client: generated domain and substance");
      broadcast({ domain, substance });
    }
  };

  return ws;
};
