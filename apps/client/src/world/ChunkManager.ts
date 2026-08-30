import { Scene, Mesh, Vector3 } from "@babylonjs/core";
import { TerrainGenerator } from "./TerrainGenerator";
import { GAME_CONSTANTS } from "@survival/shared";

export class ChunkManager {
  private scene: Scene;
  private terrainGenerator: TerrainGenerator;
  private loadedChunks: Map<string, Mesh> = new Map();
  private renderDistance: number = 2; // Radius in chunks

  constructor(scene: Scene, seed: string) {
    this.scene = scene;
    this.terrainGenerator = new TerrainGenerator(scene, seed);
  }

  public update(playerPos: Vector3) {
    const size = GAME_CONSTANTS.CHUNK_SIZE;

    // Determine current chunk coordinates
    const currentChunkX = Math.floor(playerPos.x / size);
    const currentChunkZ = Math.floor(playerPos.z / size);

    const requiredChunks = new Set<string>();

    // Determine which chunks should be loaded
    for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
      for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
        // Simple square distance for now
        const chunkX = currentChunkX + x;
        const chunkZ = currentChunkZ + z;
        const chunkKey = `${chunkX}_${chunkZ}`;
        requiredChunks.add(chunkKey);

        if (!this.loadedChunks.has(chunkKey)) {
          const chunkMesh = this.terrainGenerator.generateChunk(chunkX, chunkZ);
          this.loadedChunks.set(chunkKey, chunkMesh);
        }
      }
    }

    // Unload chunks that are out of bounds
    for (const [key, mesh] of this.loadedChunks.entries()) {
      if (!requiredChunks.has(key)) {
        mesh.dispose();
        this.loadedChunks.delete(key);
      }
    }
  }
}
