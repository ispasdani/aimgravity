export class TargetManager {
  public maxTargets: number;
  public positions: Float32Array;
  public scales: Float32Array;
  public active: Float32Array;
  public activeCount: number = 0;

  // --- Moving Spheres ---
  /** Per-target XYZ velocity (world units / second) */
  public velocities: Float32Array;
  /** Per-target XYZ waypoint the sphere is heading toward */
  public waypoints: Float32Array;

  // --- Flick Mode ---
  /** World position of the previous flick target (used to enforce min-angle constraint) */
  public lastFlickPos: [number, number, number] = [0, 1.7, -8];
  /** performance.now() timestamp when the current flick target was spawned */
  public flickSpawnTime: number = 0;

  // Arena bounds for moving spheres
  private readonly ARENA_X = 8;
  private readonly ARENA_Y_MIN = 0.5;
  private readonly ARENA_Y_MAX = 4.5;
  private readonly ARENA_Z_MIN = -16;
  private readonly ARENA_Z_MAX = -6;

  constructor(maxTargets: number = 50) {
    this.maxTargets = maxTargets;
    this.positions = new Float32Array(this.maxTargets * 3);
    this.scales = new Float32Array(this.maxTargets);
    this.active = new Float32Array(this.maxTargets);
    this.velocities = new Float32Array(this.maxTargets * 3);
    this.waypoints = new Float32Array(this.maxTargets * 3);
  }

  reset() {
    for (let i = 0; i < this.maxTargets; i++) {
      this.active[i] = 0;
    }
    this.activeCount = 0;
  }

  // ─────────────────────────────────────────────
  // Static Spheres (classic mode)
  // ─────────────────────────────────────────────

  spawnOptimalTargets(targetSizeSetting: number = 0.5) {
    const targetSize = targetSizeSetting * 1.5;
    
    for (let i = 0; i < this.maxTargets && this.activeCount < 5; i++) {
      if (this.active[i] > 0.5) continue;
      
      this.positions[i * 3]     = (Math.random() - 0.5) * 16;
      this.positions[i * 3 + 1] = 0.5 + Math.random() * 4;
      this.positions[i * 3 + 2] = -6 - Math.random() * 10;
      
      this.scales[i] = targetSize;
      this.active[i] = 1;
      this.activeCount++;
    }
  }

  // ─────────────────────────────────────────────
  // Moving Spheres
  // ─────────────────────────────────────────────

  private randomWaypoint(): [number, number, number] {
    return [
      (Math.random() - 0.5) * this.ARENA_X * 2,
      this.ARENA_Y_MIN + Math.random() * (this.ARENA_Y_MAX - this.ARENA_Y_MIN),
      this.ARENA_Z_MIN + Math.random() * (this.ARENA_Z_MAX - this.ARENA_Z_MIN)
    ];
  }

  spawnMovingSpheres(targetSizeSetting: number = 0.5, speed: number = 2.5) {
    const targetSize = targetSizeSetting * 1.5;
    const count = 5;

    for (let i = 0; i < this.maxTargets && this.activeCount < count; i++) {
      if (this.active[i] > 0.5) continue;

      // Start position
      const sx = (Math.random() - 0.5) * this.ARENA_X * 2;
      const sy = this.ARENA_Y_MIN + Math.random() * (this.ARENA_Y_MAX - this.ARENA_Y_MIN);
      const sz = this.ARENA_Z_MIN + Math.random() * (this.ARENA_Z_MAX - this.ARENA_Z_MIN);
      this.positions[i * 3]     = sx;
      this.positions[i * 3 + 1] = sy;
      this.positions[i * 3 + 2] = sz;

      // Random waypoint
      const [wx, wy, wz] = this.randomWaypoint();
      this.waypoints[i * 3]     = wx;
      this.waypoints[i * 3 + 1] = wy;
      this.waypoints[i * 3 + 2] = wz;

      // Velocity toward waypoint normalised to speed
      const dx = wx - sx, dy = wy - sy, dz = wz - sz;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      this.velocities[i * 3]     = (dx / len) * speed;
      this.velocities[i * 3 + 1] = (dy / len) * speed;
      this.velocities[i * 3 + 2] = (dz / len) * speed;

      this.scales[i] = targetSize;
      this.active[i] = 1;
      this.activeCount++;
    }
  }

  /** Call every frame for Moving Spheres mode. Returns true if any position changed (caller should push to GPU). */
  updateMovingSpheres(dt: number, speed: number = 2.5): boolean {
    let dirty = false;

    for (let i = 0; i < this.maxTargets; i++) {
      if (this.active[i] < 0.5) continue;

      const px = this.positions[i * 3];
      const py = this.positions[i * 3 + 1];
      const pz = this.positions[i * 3 + 2];

      const wx = this.waypoints[i * 3];
      const wy = this.waypoints[i * 3 + 1];
      const wz = this.waypoints[i * 3 + 2];

      const toWx = wx - px, toWy = wy - py, toWz = wz - pz;
      const distToWaypoint = Math.sqrt(toWx * toWx + toWy * toWy + toWz * toWz);

      if (distToWaypoint < 0.3) {
        // Reached waypoint — pick a new one and recalculate velocity
        const [nwx, nwy, nwz] = this.randomWaypoint();
        this.waypoints[i * 3]     = nwx;
        this.waypoints[i * 3 + 1] = nwy;
        this.waypoints[i * 3 + 2] = nwz;

        const ddx = nwx - px, ddy = nwy - py, ddz = nwz - pz;
        const len = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz) || 1;
        this.velocities[i * 3]     = (ddx / len) * speed;
        this.velocities[i * 3 + 1] = (ddy / len) * speed;
        this.velocities[i * 3 + 2] = (ddz / len) * speed;
      }

      // Integrate
      let nx = px + this.velocities[i * 3]     * dt;
      let ny = py + this.velocities[i * 3 + 1] * dt;
      let nz = pz + this.velocities[i * 3 + 2] * dt;

      // Clamp & bounce off arena walls
      if (nx < -this.ARENA_X || nx > this.ARENA_X) {
        this.velocities[i * 3] *= -1;
        nx = Math.max(-this.ARENA_X, Math.min(this.ARENA_X, nx));
      }
      if (ny < this.ARENA_Y_MIN || ny > this.ARENA_Y_MAX) {
        this.velocities[i * 3 + 1] *= -1;
        ny = Math.max(this.ARENA_Y_MIN, Math.min(this.ARENA_Y_MAX, ny));
      }
      if (nz < this.ARENA_Z_MIN || nz > this.ARENA_Z_MAX) {
        this.velocities[i * 3 + 2] *= -1;
        nz = Math.max(this.ARENA_Z_MIN, Math.min(this.ARENA_Z_MAX, nz));
      }

      this.positions[i * 3]     = nx;
      this.positions[i * 3 + 1] = ny;
      this.positions[i * 3 + 2] = nz;
      dirty = true;
    }

    return dirty;
  }

  // ─────────────────────────────────────────────
  // Flick Mode
  // ─────────────────────────────────────────────

  /**
   * Spawns exactly one sphere at a position that is at least `minAngleDeg` degrees
   * of angular separation from `prevPos` as seen from `cameraPos`.
   */
  spawnFlickTarget(
    cameraPos: number[],
    targetSizeSetting: number = 0.5,
    minAngleDeg: number = 45
  ) {
    const targetSize = targetSizeSetting * 1.5;
    const minAngleRad = minAngleDeg * (Math.PI / 180);

    // Direction to previous flick target from camera
    const [lpx, lpy, lpz] = this.lastFlickPos;
    const ldx = lpx - cameraPos[0];
    const ldy = lpy - cameraPos[1];
    const ldz = lpz - cameraPos[2];
    const lLen = Math.sqrt(ldx * ldx + ldy * ldy + ldz * ldz) || 1;
    const prevDirX = ldx / lLen;
    const prevDirY = ldy / lLen;
    const prevDirZ = ldz / lLen;

    let px = 0, py = 0, pz = 0;
    let attempts = 0;

    do {
      px = (Math.random() - 0.5) * 16;
      py = 0.5 + Math.random() * 4;
      pz = -6 - Math.random() * 10;

      // Direction to candidate from camera
      const dx = px - cameraPos[0];
      const dy = py - cameraPos[1];
      const dz = pz - cameraPos[2];
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

      const dot = (dx / len) * prevDirX + (dy / len) * prevDirY + (dz / len) * prevDirZ;
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
      if (angle >= minAngleRad) break;
      attempts++;
    } while (attempts < 100);

    // Find a free slot
    for (let i = 0; i < this.maxTargets; i++) {
      if (this.active[i] > 0.5) continue;
      this.positions[i * 3]     = px;
      this.positions[i * 3 + 1] = py;
      this.positions[i * 3 + 2] = pz;
      this.scales[i] = targetSize;
      this.active[i] = 1;
      this.activeCount++;
      break;
    }

    this.lastFlickPos = [px, py, pz];
    this.flickSpawnTime = performance.now();
  }

  // ─────────────────────────────────────────────
  // Shared hit detection
  // ─────────────────────────────────────────────

  /**
   * Raycasts over targets and returns the index of the hit target if successful, otherwise -1.
   */
  checkHit(cameraPos: number[], dirX: number, dirY: number, dirZ: number): number {
    let hitIndex = -1;
    let closestT = Infinity;
    
    for (let i = 0; i < this.maxTargets; i++) {
      if (this.active[i] < 0.5) continue;
      
      const tx = this.positions[i * 3];
      const ty = this.positions[i * 3 + 1];
      const tz = this.positions[i * 3 + 2];
      const radius = this.scales[i];
      
      const dx = tx - cameraPos[0];
      const dy = ty - cameraPos[1];
      const dz = tz - cameraPos[2];
      
      const t = dx * dirX + dy * dirY + dz * dirZ;
      if (t < 0) continue;
      
      const closestX = cameraPos[0] + dirX * t;
      const closestY = cameraPos[1] + dirY * t;
      const closestZ = cameraPos[2] + dirZ * t;
      
      const ddx = closestX - tx;
      const ddy = closestY - ty;
      const ddz = closestZ - tz;
      const distSq = ddx * ddx + ddy * ddy + ddz * ddz;
      
      if (distSq <= radius * radius && t < closestT) {
        closestT = t;
        hitIndex = i;
      }
    }
    
    return hitIndex;
  }

  processHit(hitIndex: number) {
    if (hitIndex >= 0 && hitIndex < this.maxTargets) {
      if (this.active[hitIndex] > 0.5) {
        this.active[hitIndex] = 0;
        this.activeCount--;
      }
    }
  }
}
