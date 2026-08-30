import { Scene, Vector3, Mesh, ArcRotateCamera, KeyboardEventTypes } from "@babylonjs/core";
import { MESSAGES } from "@survival/shared";
import { room } from "../network/client";

export class LocalPlayerController {
  private mesh: Mesh;
  private scene: Scene;
  private camera: ArcRotateCamera;

  // Input state
  private inputMap: { [key: string]: boolean } = {};

  private speed = 5;
  private turnSpeed = 3;

  constructor(mesh: Mesh, scene: Scene, camera: ArcRotateCamera) {
    this.mesh = mesh;
    this.scene = scene;
    this.camera = camera;

    // Third person camera target
    this.camera.setTarget(this.mesh);

    this.scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          this.inputMap[kbInfo.event.key.toLowerCase()] = true;
          break;
        case KeyboardEventTypes.KEYUP:
          this.inputMap[kbInfo.event.key.toLowerCase()] = false;
          break;
      }
    });

    this.scene.onBeforeRenderObservable.add(() => {
      this.update();
    });
  }

  private update() {
    let moved = false;
    const dt = this.scene.getEngine().getDeltaTime() / 1000;

    // Movement relative to camera
    const forward = this.camera.getForwardRay().direction;
    forward.y = 0;
    forward.normalize();

    const right = Vector3.Cross(this.scene.activeCamera!.upVector, forward);
    right.normalize();

    const moveDirection = Vector3.Zero();

    if (this.inputMap["w"]) {
      moveDirection.addInPlace(forward);
      moved = true;
    }
    if (this.inputMap["s"]) {
      moveDirection.subtractInPlace(forward);
      moved = true;
    }
    if (this.inputMap["a"]) {
      moveDirection.subtractInPlace(right);
      moved = true;
    }
    if (this.inputMap["d"]) {
      moveDirection.addInPlace(right);
      moved = true;
    }

    if (moved) {
      if (moveDirection.lengthSquared() > 0.0001) {
        moveDirection.normalize();
      }

      // Move mesh
      this.mesh.position.addInPlace(moveDirection.scale(this.speed * dt));

      // Rotate mesh to face movement direction
      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);

      // Simple smoothing (LERP would be better, but this is ok for MVP)
      let diff = targetRotation - this.mesh.rotation.y;
      // normalize diff to -PI to PI
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      this.mesh.rotation.y += diff * this.turnSpeed * dt;

      // Send to server
      if (room) {
        room.send(MESSAGES.PLAYER_MOVE, {
          x: this.mesh.position.x,
          y: this.mesh.position.y,
          z: this.mesh.position.z,
          rotation: this.mesh.rotation.y
        });
      }
    }
  }
}
