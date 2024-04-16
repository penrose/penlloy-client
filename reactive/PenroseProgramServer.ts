import { WebSocket, WebSocketServer } from "ws";

let wss: WebSocketServer | null;

export const broadcast = ({
  domain,
  substance,
}: {
  domain: string;
  substance: string;
}) => {
  if (wss !== null) {
    console.log("server: broadcasting domain and substance to clients");
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            kind: "DomainAndSubstance",
            domain,
            substance,
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

export const penroseProgramServer = (port: number = 1550) => {
  wss = new WebSocketServer({ port });
  console.log("server: started penrose program server at port " + port);
  wss.on("connection", (ws) => {
    console.log("server: client connected at " + ws.url);
  });
  return wss;
};
