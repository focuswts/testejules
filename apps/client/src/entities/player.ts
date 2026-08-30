import { Scene, MeshBuilder, StandardMaterial, Color3, Vector3, Mesh } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { Player } from "@survival/shared";

// Create GUI texture once for all name tags
let advancedTexture: AdvancedDynamicTexture;

export class PlayerEntity {
  public mesh: Mesh;
  public id: string;
  public nameTag: TextBlock;

  constructor(id: string, scene: Scene, isLocal: boolean = false) {
    this.id = id;

    if (!advancedTexture) {
      advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    }

    // Simple capsule/box for player
    this.mesh = MeshBuilder.CreateBox("player_" + id, { width: 1, height: 2, depth: 1 }, scene);
    this.mesh.position.y = 1; // Half height

    const mat = new StandardMaterial("playerMat_" + id, scene);
    mat.diffuseColor = isLocal ? new Color3(0, 0, 1) : new Color3(1, 0, 0); // Blue for local, Red for others
    this.mesh.material = mat;

    // "Nose" to indicate direction
    const nose = MeshBuilder.CreateBox("nose_" + id, { width: 0.2, height: 0.2, depth: 0.5 }, scene);
    nose.position = new Vector3(0, 0.5, 0.5);
    nose.parent = this.mesh;

    const noseMat = new StandardMaterial("noseMat_" + id, scene);
    noseMat.diffuseColor = new Color3(1, 1, 0); // Yellow nose
    nose.material = noseMat;

    // Name tag
    this.nameTag = new TextBlock();
    this.nameTag.text = id.substring(0, 6);
    this.nameTag.color = "white";
    this.nameTag.fontSize = 16;
    this.nameTag.outlineWidth = 2;
    this.nameTag.outlineColor = "black";
    this.nameTag.linkOffsetY = -60;
    advancedTexture.addControl(this.nameTag);
    this.nameTag.linkWithMesh(this.mesh);
  }

  updateFromServer(state: Player) {
    // Interpolation should happen here in a real game, jumping for MVP
    this.mesh.position.x = state.x;
    this.mesh.position.y = state.y;
    this.mesh.position.z = state.z;
    this.mesh.rotation.y = state.rotation;
  }

  destroy() {
    this.nameTag.dispose();
    this.mesh.dispose();
  }
}
