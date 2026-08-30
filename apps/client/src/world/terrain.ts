import { Scene, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";

export function createTerrain(scene: Scene) {
  const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);

  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseColor = new Color3(0.2, 0.5, 0.2); // Simple green for now
  groundMaterial.specularColor = new Color3(0, 0, 0); // No shine

  ground.material = groundMaterial;

  return ground;
}
