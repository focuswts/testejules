import { Engine, Scene, Vector3, HemisphericLight, ArcRotateCamera } from "@babylonjs/core";
import { connectToServer } from "./network/client";
import { PlayerEntity } from "./entities/player";
import { LocalPlayerController } from "./entities/localPlayerController";
import { ChunkManager } from "./world/ChunkManager";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

const createScene = async () => {
  const scene = new Scene(engine);

  // Camera
  const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 15, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.wheelPrecision = 50;
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 50;

  // Light
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  // Multiplayer State
  const playerEntities = new Map<string, PlayerEntity>();
  let localController: LocalPlayerController | null = null;
  let chunkManager: ChunkManager | null = null;

  try {
    const gameRoom = await connectToServer();

    // Listen for new players
    gameRoom.state.players.onAdd((player, sessionId) => {
      console.log("Player joined:", sessionId);
      const isLocal = sessionId === gameRoom.sessionId;
      const entity = new PlayerEntity(sessionId, scene, isLocal);

      // Set initial position
      entity.mesh.position.set(player.x, player.y, player.z);
      entity.mesh.rotation.y = player.rotation;

      playerEntities.set(sessionId, entity);

      if (isLocal) {
        localController = new LocalPlayerController(entity.mesh, scene, camera);
        chunkManager = new ChunkManager(scene, gameRoom.state.worldSeed);
        chunkManager.update(entity.mesh.position);
      }

      // Listen for player updates (Server reconciliation)
      player.onChange(() => {
        if (!isLocal) {
          // Only update remote players directly from state in MVP
          entity.updateFromServer(player);
        } else {
          // For local player, server state could be used to correct position if divergence is too high
          // Ignoring for simple MVP (Client prediction without correction)
        }
      });
    });

    // Listen for players leaving
    gameRoom.state.players.onRemove((player, sessionId) => {
      console.log("Player left:", sessionId);
      const entity = playerEntities.get(sessionId);
      if (entity) {
        entity.destroy();
        playerEntities.delete(sessionId);
      }
    });
  } catch (e) {
    console.error("Failed to connect to server", e);
    // Fallback if server connection fails
    chunkManager = new ChunkManager(scene, "offline_fallback_seed");
    chunkManager.update(Vector3.Zero());
  }

  return { scene, getLocalController: () => localController, getChunkManager: () => chunkManager };
};

createScene().then(({ scene, getLocalController, getChunkManager }) => {
  engine.runRenderLoop(() => {
    const localController = getLocalController();
    const chunkManager = getChunkManager();

    if (localController && chunkManager) {
      chunkManager.update(localController.getMesh().position);
    }

    scene.render();
  });
});

window.addEventListener("resize", () => {
  engine.resize();
});
