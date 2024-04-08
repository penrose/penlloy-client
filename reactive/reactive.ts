import { WebSocket } from "ws";
import { ReceivedMessage } from "./message.js";
import { compileModel, translateToDomain } from "../generator/domain.js";
import {
  compileInstance,
  translateToSubstance,
} from "../generator/substance.js";
import * as fs from "fs";

const ws: WebSocket = new WebSocket("ws://localhost:1549");
ws.onopen = () => {
  console.info("Penlloy connection started.");
};
ws.onerror = (error) => {
  console.error("Encountered error with message " + error.message);
  console.error("Exiting now.");
};
ws.onclose = () => {
  console.info("Alloy disconnected");
};

ws.onmessage = (event) => {
  const msgStr = event.data as string;
  const msgJson = JSON.parse(msgStr) as ReceivedMessage;

  if (msgJson.kind === "connected") {
    console.info("connected to Alloy server");
  } else {
    const rawModel = msgJson.model;
    const compiledModel = compileModel(rawModel);
    const domain = translateToDomain(compiledModel);
    fs.writeFileSync("domain.domain", domain);
    const rawInstance = msgJson.instance;
    const substance = translateToSubstance(
      compileInstance(rawInstance, compiledModel)
    );
    fs.writeFileSync("substance.substance", substance);
    console.log("Generated substance: \n" + substance);
  }
};
