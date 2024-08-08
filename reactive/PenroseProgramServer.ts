import { err } from "@penrose/core/dist/utils/Error";
import { WebSocket, WebSocketServer } from "ws";
import { wsToAlloy } from "./ModelInstanceClient.js";
import {
  MessageFromIDE,
  ModelExplorationMessage,
} from "../types/MessageFromIDE.js";
import { ModelConfig } from "../types/ModelConfig.js";
import {
  currentConfig,
  currentDomain,
  currentSubstance,
  setCurrentConfig,
  setCurrentDomain,
  setCurrentSubstance,
} from "./CachedState.js";

let wss: WebSocketServer | null;

export const broadcastPenrose = ({
  domain,
  substance,
}: {
  domain: string;
  substance: string;
}) => {
  setCurrentDomain(domain);
  setCurrentSubstance(substance);
  if (wss !== null) {
    console.log("server: broadcasting domain and substance to clients");
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            kind: "DomainAndSubstance",
            domain: currentDomain,
            substance: currentSubstance,
          })
        );
      }
    });
    console.log("server: broadcasted domain and substance to clients");
  } else {
    console.error(
      "server: broadcast failed because wss has not been initialized"
    );
  }
};

export const broadcastConfig = (config: ModelConfig) => {
  setCurrentConfig(config);
  if (wss !== null) {
    console.log("server: broadcasting config to clients");
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            kind: "Config",
            isTrace: currentConfig.isTrace,
          })
        );
      }
    });
    console.log("server: broadcasted config to clients");
  } else {
    console.error(
      "server: broadcast failed because wss has not been initialized"
    );
  }
};

export const penroseProgramServer = (port: number = 1550) => {
  wss = new WebSocketServer({ port });
  console.log("server: started penrose program server at port " + port);

  // Whenever a new client starts a connection
  wss.on("connection", (ws) => {
    console.log("server: client connected at " + ws.url);

    // Send the Domain and Substance we have cached
    console.log("server: sending current domain and substance to new client");
    ws.send(
      JSON.stringify({
        kind: "DomainAndSubstance",
        domain: currentDomain,
        substance: currentSubstance,
      })
    );

    // Send the Config we have cached
    console.log("server: sending current config to new client");
    ws.send(
      JSON.stringify({
        kind: "Config",
        isTrace: currentConfig.isTrace,
      })
    );

    // And start listening for messages from that client
    ws.on("message", (msg) => {
      console.log("server: received message from IDE: " + msg.toString());
      const parsedMessage = JSON.parse(msg.toString()) as MessageFromIDE;

      // The message shall be forwarded to Alloy
      wsToAlloy.send(JSON.stringify(parsedMessage));
    });
  });
  return wss;
};
