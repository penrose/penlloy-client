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

  fs.mkdirSync("./temp_outputs", { recursive: true });

  ws.onopen = () => {
    console.log("client: Connection to Alloy has been established.");
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
      console.log("client: connected to Alloy server");
    } else {
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
      broadcast({ domain, substance });
    }
  };

  return ws;
};
