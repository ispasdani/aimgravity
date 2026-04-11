export type CrouchMode = 'hold' | 'toggle';

export class MovementSystem {
  moveForward: boolean = false;
  moveBackward: boolean = false;
  moveLeft: boolean = false;
  moveRight: boolean = false;
  
  isJumping: boolean = false;
  isCrouching: boolean = false;
  
  moveSpeed: number = 7.0;
  crouchSpeed: number = 3.5;
  jumpVelocity: number = 6.0;
  gravity: number = 18.0;
  
  velocityY: number = 0;
  isGrounded: boolean = true;
  
  baseHeight: number = 1.7;
  crouchHeight: number = 1.0;
  currentCameraHeight: number = 1.7;
  
  pointerLocked: boolean = false;
  crouchMode: CrouchMode = 'hold';

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  attach() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  detach() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.resetState();
  }

  resetState() {
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isJumping = false;
    this.isCrouching = false;
    this.velocityY = 0;
    this.isGrounded = true;
    this.currentCameraHeight = this.baseHeight;
  }

  handleKeyDown(e: KeyboardEvent) {
    if (!this.pointerLocked) return;

    switch (e.code) {
      case 'KeyW': this.moveForward = true; break;
      case 'KeyS': this.moveBackward = true; break;
      case 'KeyA': this.moveLeft = true; break;
      case 'KeyD': this.moveRight = true; break;
      case 'Space': 
        if (this.isGrounded) {
          this.velocityY = this.jumpVelocity;
          this.isGrounded = false;
        }
        break;
      case 'ControlLeft':
      case 'ControlRight':
        if (this.crouchMode === 'toggle') {
          this.isCrouching = !this.isCrouching;
        } else {
          this.isCrouching = true;
        }
        break;
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    if (!this.pointerLocked) return;

    switch (e.code) {
      case 'KeyW': this.moveForward = false; break;
      case 'KeyS': this.moveBackward = false; break;
      case 'KeyA': this.moveLeft = false; break;
      case 'KeyD': this.moveRight = false; break;
      case 'ControlLeft':
      case 'ControlRight':
        if (this.crouchMode === 'hold') {
          this.isCrouching = false;
        }
        break;
    }
  }

  update(dt: number, cameraPos: number[], yaw: number) {
    if (!this.pointerLocked) return;

    // Movement speeds
    const targetHeight = this.isCrouching ? this.crouchHeight : this.baseHeight;
    const currentSpeed = this.isCrouching ? this.crouchSpeed : this.moveSpeed;

    // Interpolate crouch height for visual smoothness
    this.currentCameraHeight += (targetHeight - this.currentCameraHeight) * 15.0 * dt;

    // Jumping & Gravity
    this.velocityY -= this.gravity * dt;
    // Ground is relative to 0 being feet level. cameraPos[1] represents eye level.
    // Calculate feet position
    let feetY = cameraPos[1] - this.currentCameraHeight;
    feetY += this.velocityY * dt;

    if (feetY <= 0) {
      feetY = 0;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    cameraPos[1] = feetY + this.currentCameraHeight;

    // Horizontal Movement using Yaw projected to horizontal plane
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);

    // Forward direction (negative Z in camera space)
    const forwardX = -sinYaw;
    const forwardZ = -cosYaw;

    // Right direction
    const rightX = cosYaw;
    const rightZ = -sinYaw;

    let moveX = 0;
    let moveZ = 0;

    if (this.moveForward) { moveX += forwardX; moveZ += forwardZ; }
    if (this.moveBackward) { moveX -= forwardX; moveZ -= forwardZ; }
    if (this.moveLeft) { moveX -= rightX; moveZ -= rightZ; }
    if (this.moveRight) { moveX += rightX; moveZ += rightZ; }

    const moveLen = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (moveLen > 0) {
      moveX /= moveLen;
      moveZ /= moveLen;

      cameraPos[0] += moveX * currentSpeed * dt;
      cameraPos[2] += moveZ * currentSpeed * dt;

      // Restrict movement to an 18x18 arena
      const bound = 18;
      cameraPos[0] = Math.max(-bound, Math.min(bound, cameraPos[0]));
      cameraPos[2] = Math.max(-bound, Math.min(bound, cameraPos[2]));
    }
  }
}
