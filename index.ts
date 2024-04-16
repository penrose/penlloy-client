import { modelInstanceClient } from "./reactive/ModelInstanceClient.js";
import { penroseProgramServer } from "./reactive/PenroseProgramServer.js";

const server = penroseProgramServer();
const client = modelInstanceClient();
