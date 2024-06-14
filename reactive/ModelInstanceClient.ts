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
    console.info("client: Connection to Alloy has been established.");
  };
  ws.onerror = (error) => {
    console.log("client: Encountered error with message " + error.message);
    ws.close();
  };
  ws.onclose = () => {
    console.log(
      "client: Alloy disconnected. Attempting to re-connect in 1 second."
    );
    setTimeout(() => modelInstanceClient(port), 1000);
  };

  ws.onmessage = (event) => {
    const msgStr = event.data as string;
    const msgJson = JSON.parse(msgStr) as ReceivedAlloyMessage;

    if (msgJson.kind === "connected") {
      console.info("client: connected to Alloy server");
    } else {
      console.info("client: received model and instance");
      const rawModel = msgJson.model;
      console.log(msgStr);
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
