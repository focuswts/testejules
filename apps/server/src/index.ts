import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import http from "http";
import express from "express";
import cors from "cors";
import { WorldRoom } from "./rooms/WorldRoom";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server
  })
});

gameServer.define("world", WorldRoom);

const PORT = Number(process.env.PORT || 2567);
gameServer.listen(PORT).then(() => {
  console.log(`Server is running on port ${PORT}`);
});
