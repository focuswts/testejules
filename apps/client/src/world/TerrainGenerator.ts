import { Scene, MeshBuilder, StandardMaterial, Color3, Vector3, Mesh, VertexData } from "@babylonjs/core";
import { createNoise2D } from "simplex-noise";
import { GAME_CONSTANTS } from "@survival/shared";
import alea from "alea"; // A PRNG that works well with simplex-noise

export class TerrainGenerator {
  private noise2D: ReturnType<typeof createNoise2D>;
  private scene: Scene;
  private seed: string;

  private materials: {
    ground: StandardMaterial;
    trunk: StandardMaterial;
    leaves: StandardMaterial;
  };

  constructor(scene: Scene, seed: string) {
    this.scene = scene;
    this.seed = seed;

    // Initialize deterministic random and noise function
    const prng = alea(this.seed);
    this.noise2D = createNoise2D(prng);

    // Setup materials
    this.materials = {
      ground: new StandardMaterial("chunkGroundMat", scene),
      trunk: new StandardMaterial("treeTrunkMat", scene),
      leaves: new StandardMaterial("treeLeavesMat", scene)
    };

    this.materials.ground.diffuseColor = new Color3(0.2, 0.5, 0.2); // Green
    this.materials.ground.specularColor = new Color3(0, 0, 0); // No shine

    this.materials.trunk.diffuseColor = new Color3(0.4, 0.2, 0.1); // Brown
    this.materials.trunk.specularColor = new Color3(0, 0, 0);

    this.materials.leaves.diffuseColor = new Color3(0.1, 0.6, 0.1); // Darker Green
    this.materials.leaves.specularColor = new Color3(0, 0, 0);
  }

  public generateChunk(chunkX: number, chunkZ: number): Mesh {
    const size = GAME_CONSTANTS.CHUNK_SIZE;
    const subdivisions = size / 4; // Lower resolution for performance

    // Base position for this chunk
    const offsetX = chunkX * size;
    const offsetZ = chunkZ * size;

    const chunkMesh = MeshBuilder.CreateGround(
      `chunk_${chunkX}_${chunkZ}`,
      {
        width: size,
        height: size,
        subdivisions: subdivisions,
        updatable: true
      },
      this.scene
    );

    chunkMesh.position.x = offsetX + size / 2;
    chunkMesh.position.z = offsetZ + size / 2;
    chunkMesh.material = this.materials.ground;

    // Apply procedural height to vertices
    const vertexData = VertexData.ExtractFromMesh(chunkMesh);
    const positions = vertexData.positions;

    if (positions) {
      for (let i = 0; i < positions.length; i += 3) {
        // Vertex local position
        const vx = positions[i];
        const vz = positions[i + 2];

        // Global position
        const globalX = chunkMesh.position.x + vx;
        const globalZ = chunkMesh.position.z + vz;

        // Calculate height using noise
        // Scale down global coords so noise is smooth
        const noiseScale = 0.05;
        const heightMultiplier = 5.0;
        const n = this.noise2D(globalX * noiseScale, globalZ * noiseScale);

        // Map noise [-1, 1] to [0, heightMultiplier]
        positions[i + 1] = ((n + 1) / 2) * heightMultiplier;
      }

      vertexData.applyToMesh(chunkMesh);

      // Recalculate normals for correct lighting
      chunkMesh.createNormals(false);
    }

    // Generate POIs (Trees)
    this.generateTrees(chunkMesh, chunkX, chunkZ);

    return chunkMesh;
  }

  private generateTrees(parentChunk: Mesh, chunkX: number, chunkZ: number) {
    const prng = alea(`${this.seed}_${chunkX}_${chunkZ}`);

    // Random number of trees per chunk (0 to 5)
    const treeCount = Math.floor(prng() * 6);

    const size = GAME_CONSTANTS.CHUNK_SIZE;
    const offsetX = chunkX * size;
    const offsetZ = chunkZ * size;

    for (let i = 0; i < treeCount; i++) {
      // Local position within chunk (0 to size)
      const localX = prng() * size;
      const localZ = prng() * size;

      const globalX = offsetX + localX;
      const globalZ = offsetZ + localZ;

      // Calculate terrain height at this exact point using noise
      const noiseScale = 0.05;
      const heightMultiplier = 5.0;
      const n = this.noise2D(globalX * noiseScale, globalZ * noiseScale);
      const groundHeight = ((n + 1) / 2) * heightMultiplier;

      // Tree trunk
      const trunk = MeshBuilder.CreateCylinder(
        `tree_trunk_${i}`,
        {
          height: 2,
          diameter: 0.5
        },
        this.scene
      );
      trunk.position = new Vector3(localX - size / 2, groundHeight + 1, localZ - size / 2);
      trunk.material = this.materials.trunk;
      trunk.parent = parentChunk;

      // Tree leaves
      const leaves = MeshBuilder.CreateSphere(
        `tree_leaves_${i}`,
        {
          diameter: 3
        },
        this.scene
      );
      leaves.position = new Vector3(0, 1.5, 0); // Relative to trunk
      leaves.material = this.materials.leaves;
      leaves.parent = trunk;
    }
  }
}
