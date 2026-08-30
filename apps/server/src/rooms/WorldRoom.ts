import { Room, Client } from "colyseus";
import { GameState, Player, MESSAGES, PlayerMoveMessage } from "@survival/shared";

export class WorldRoom extends Room<GameState> {
  maxClients = 16;

  onCreate(options: any) {
    console.log("WorldRoom created!", options);
    this.setState(new GameState());

    this.onMessage(MESSAGES.PLAYER_MOVE, (client, data: PlayerMoveMessage) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.z = data.z;
        player.rotation = data.rotation;
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player();
    player.id = client.sessionId;
    player.x = Math.random() * 10 - 5;
    player.y = 1; // slightly above ground
    player.z = Math.random() * 10 - 5;
    player.rotation = 0;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("Room disposed");
  }
}
