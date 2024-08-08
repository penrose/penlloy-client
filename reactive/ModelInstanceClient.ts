import { WebSocket } from "ws";
import { MessageFromAlloy } from "../types/MessageFromAlloy.js";
import { compileModel, translateToDomain } from "../generator/domain.js";
import {
  compileInstance,
  translateToSubstance,
} from "../generator/substance.js";
import * as fs from "fs";
import { broadcastConfig, broadcastPenrose } from "./PenroseProgramServer.js";

let wsToAlloy: WebSocket;

export const modelInstanceClient = (port: number = 1549) => {
  wsToAlloy = new WebSocket("ws://localhost:" + port);
  //move this outside, when called, assign the port

  fs.mkdirSync("./temp_outputs", { recursive: true });

  wsToAlloy.onopen = () => {
    console.log("client: Connection to Alloy has been established.");
  };
  wsToAlloy.onerror = (error) => {
    console.log("client: Encountered error with message " + error.message);
    wsToAlloy.close();
  };
  wsToAlloy.onclose = () => {
    console.log(
      "client: Alloy disconnected. Attempting to re-connect in 1 second."
    );
    setTimeout(() => modelInstanceClient(port), 1000);
  };

  wsToAlloy.onmessage = (event) => {
    const msgStr = event.data as string;
    const msgJson = JSON.parse(msgStr) as MessageFromAlloy;

    if (msgJson.kind === "connected") {
      console.log("client: connected to Alloy server");
    } else if (msgJson.kind === "ModelAndInstance") {
      console.log("client: received model and instance");
      const rawModel = msgJson.model;
      fs.writeFileSync(
        "./temp_outputs/rawmodel.json",
        JSON.stringify(rawModel, undefined, 2)
      );
      console.log("client: wrote raw model into temp file");
      const rawInstance = msgJson.instance;
      fs.writeFileSync(
        "./temp_outputs/rawinstance.json",
        JSON.stringify(rawInstance, undefined, 2)
      );
      console.log("client: wrote raw instance into temp file");

      const compiledModel = compileModel(rawModel);
      const domain = translateToDomain(compiledModel);
      const substance = translateToSubstance(
        compileInstance(rawInstance, compiledModel)
      );

      fs.writeFileSync("./temp_outputs/domain.txt", domain);
      fs.writeFileSync("./temp_outputs/substance.txt", substance);
      console.log(
        "client: wrote generated domain and substance into temp file"
      );

      console.log("client: generated domain and substance");
      broadcastPenrose({ domain, substance });
    } else if (msgJson.kind === "Config") {
      console.log("client: received config");
      broadcastConfig({ isTrace: msgJson.isTrace });
    }
  };

  return wsToAlloy;
};

export { wsToAlloy };
