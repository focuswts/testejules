import * as Colyseus from "colyseus.js";
import { GameState } from "@survival/shared";

export const client = new Colyseus.Client("ws://localhost:2567");

export let room: Colyseus.Room<GameState>;

export const connectToServer = async () => {
  try {
    room = await client.joinOrCreate<GameState>("world");
    console.log("Joined room successfully", room.sessionId);
    return room;
  } catch (e) {
    console.error("Join error", e);
    throw e;
  }
};
