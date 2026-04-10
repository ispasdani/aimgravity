export class TargetManager {
  public maxTargets: number;
  public positions: Float32Array;
  public scales: Float32Array;
  public active: Float32Array;
  public activeCount: number = 0;

  constructor(maxTargets: number = 50) {
    this.maxTargets = maxTargets;
    this.positions = new Float32Array(this.maxTargets * 3);
    this.scales = new Float32Array(this.maxTargets);
    this.active = new Float32Array(this.maxTargets);
  }

  reset() {
    for (let i = 0; i < this.maxTargets; i++) {
      this.active[i] = 0;
    }
    this.activeCount = 0;
  }

  spawnOptimalTargets(targetSizeSetting: number = 0.5) {
    const targetSize = targetSizeSetting * 1.5;
    
    for (let i = 0; i < this.maxTargets && this.activeCount < 5; i++) {
      if (this.active[i] > 0.5) continue;
      
      // Random position in front of player
      this.positions[i * 3] = (Math.random() - 0.5) * 16;
      this.positions[i * 3 + 1] = 0.5 + Math.random() * 4;
      this.positions[i * 3 + 2] = -6 - Math.random() * 10;
      
      this.scales[i] = targetSize;
      this.active[i] = 1;
      this.activeCount++;
    }
  }

  /**
   * Raycasts over targets and returns the index of the hit target if successful, otherwise -1.
   */
  checkHit(cameraPos: number[], dirX: number, dirY: number, dirZ: number): number {
    let hitIndex = -1;
    let closestT = Infinity;
    
    // Check each target - find closest hit
    for (let i = 0; i < this.maxTargets; i++) {
      if (this.active[i] < 0.5) continue;
      
      const tx = this.positions[i * 3];
      const ty = this.positions[i * 3 + 1];
      const tz = this.positions[i * 3 + 2];
      const radius = this.scales[i];
      
      // Vector from camera to target center
      const dx = tx - cameraPos[0];
      const dy = ty - cameraPos[1];
      const dz = tz - cameraPos[2];
      
      // Project target center onto ray
      const t = dx * dirX + dy * dirY + dz * dirZ;
      
      if (t < 0) continue; // Target is behind camera
      
      // Find closest point on ray to target center
      const closestX = cameraPos[0] + dirX * t;
      const closestY = cameraPos[1] + dirY * t;
      const closestZ = cameraPos[2] + dirZ * t;
      
      // Distance from closest point to target center
      const distX = closestX - tx;
      const distY = closestY - ty;
      const distZ = closestZ - tz;
      const distSq = distX * distX + distY * distY + distZ * distZ;
      
      // Check if within sphere radius
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
