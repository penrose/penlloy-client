import { err } from "@penrose/core/dist/utils/Error";
import { WebSocket, WebSocketServer } from "ws";

let wss: WebSocketServer | null;

let currentDomain: string = "";
let currentSubstance: string = "";



type ExploreModelMessage = {
  kind: "ExploreModel"
  operation:  "Newinit" | "NewTrace" | "NewFork" | "StepLeft" | "StepRight" 
}



export const broadcast = ({
  domain,
  substance,
}: {
  domain: string;
  substance: string;
}) => {
  currentDomain = domain;
  currentSubstance = substance;
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

{/*

  wss.on('message', (message) => {
  try {
    const parsedMessage = JSON.parse(message);
    console.log('Received message:', parsedMessage);
      if (parsedMessage.kind === 'ExploreModel') {
        switch (parsedMessage.operation) {
          case 'NewInit':
            console.log('Handling NewInit operation');
            break;
          case 'NewTrace':
            console.log('Handling NewTrace operation');
            break;
          case 'NewFork':
            console.log('Handling NewFork operation');
            break;
          case 'StepLeft':
            console.log('Handling StepLeft operation');
            break;
          case 'StepRight':
            console.log('Handling StepRight operation');
            break;
          default:
            console.log('Unkown operation given');
        } 
      }
  }



  */}

export const penroseProgramServer = (port: number = 1550) => {
  wss = new WebSocketServer({ port });
  console.log("server: started penrose program server at port " + port);
  wss.on("connection", (ws) => {
    console.log("server: client connected at " + ws.url);
    console.log("server: sending current domain and substance to new client");
    ws.send(
      JSON.stringify({
        kind: "DomainAndSubstance",
        domain: currentDomain,
        substance: currentSubstance,
      })
    );
  });

  const client_ws: WebSocket = new WebSocket("ws://localhost:" + port);





  for (const ws of wss.clients) {
    ws.on("message", (msg) => {
      console.log("message received");
    })
    // ws.onmessage = (msg) => {
    //   console.log("message received")
    //   try {
    //     const parsedMessage = JSON.parse(msg.data as string);
    //     console.log('Recieved message', parsedMessage);
    //     if(parsedMessage.kind === 'ExploreModel') {
    //       switch(parsedMessage.operation) {
    //         case 'NewInit':
    //           console.log('New Init operation');
    //           client_ws.send(parsedMessage);
    //           break;
    //         case 'NewTrace':
    //           console.log('New Trace operation');
    //           client_ws.send(parsedMessage);
    //           break;
    //         case 'NewFork':
    //           console.log('New Fork operation');
    //           client_ws.send(parsedMessage);
    //           break;
    //         case 'StepLeft':
    //           console.log('Step Left operation')
    //           client_ws.send(parsedMessage);
    //           break;
    //         case 'Stepright':
    //           console.log('Step right operation')
    //           client_ws.send(parsedMessage);
    //           break;  
    //       } 
    //     } else {
    //       console.log('Non-ExploreModel operation');
    //     }
    //   } catch(error) {
    //     console.log('Could not parse JSON', error);
    //   }
    // 
    // }
  }
  return wss;
};
