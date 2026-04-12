import { BODY_PARTS } from '../damage-system';
import { identityMat4, scaleMat4, translateMat4, Mat4, createMat4 } from '../math';

export function createMannequinGeometry() {
  const positions: number[] = [];
  const normals: number[] = [];
  const bodyParts: number[] = [];
  
  function addBox(cx: number, cy: number, cz: number, w: number, h: number, d: number, part: number) {
    const hw = w/2, hh = h/2, hd = d/2;
    
    const faces = [
      { verts: [[cx-hw,cy-hh,cz+hd],[cx+hw,cy-hh,cz+hd],[cx+hw,cy+hh,cz+hd],[cx-hw,cy+hh,cz+hd]], norm: [0,0,1] },
      { verts: [[cx+hw,cy-hh,cz-hd],[cx-hw,cy-hh,cz-hd],[cx-hw,cy+hh,cz-hd],[cx+hw,cy+hh,cz-hd]], norm: [0,0,-1] },
      { verts: [[cx-hw,cy+hh,cz+hd],[cx+hw,cy+hh,cz+hd],[cx+hw,cy+hh,cz-hd],[cx-hw,cy+hh,cz-hd]], norm: [0,1,0] },
      { verts: [[cx-hw,cy-hh,cz-hd],[cx+hw,cy-hh,cz-hd],[cx+hw,cy-hh,cz+hd],[cx-hw,cy-hh,cz+hd]], norm: [0,-1,0] },
      { verts: [[cx+hw,cy-hh,cz+hd],[cx+hw,cy-hh,cz-hd],[cx+hw,cy+hh,cz-hd],[cx+hw,cy+hh,cz+hd]], norm: [1,0,0] },
      { verts: [[cx-hw,cy-hh,cz-hd],[cx-hw,cy-hh,cz+hd],[cx-hw,cy+hh,cz+hd],[cx-hw,cy+hh,cz-hd]], norm: [-1,0,0] }
    ];
    
    for (const face of faces) {
      const v = face.verts;
      const triVerts = [v[0], v[1], v[2], v[0], v[2], v[3]];
      
      for (const vert of triVerts) {
        positions.push(...vert);
        normals.push(...face.norm);
        bodyParts.push(part);
      }
    }
  }
  
  function addSphere(cx: number, cy: number, cz: number, radius: number, segments: number, part: number) {
    const rings = segments;
    const sectors = segments * 2;
    
    for (let r = 0; r < rings; r++) {
      const theta1 = (r / rings) * Math.PI;
      const theta2 = ((r + 1) / rings) * Math.PI;
      
      for (let s = 0; s < sectors; s++) {
        const phi1 = (s / sectors) * Math.PI * 2;
        const phi2 = ((s + 1) / sectors) * Math.PI * 2;
        
        const v1 = [
          cx + radius * Math.sin(theta1) * Math.cos(phi1),
          cy + radius * Math.cos(theta1),
          cz + radius * Math.sin(theta1) * Math.sin(phi1)
        ];
        const v2 = [
          cx + radius * Math.sin(theta1) * Math.cos(phi2),
          cy + radius * Math.cos(theta1),
          cz + radius * Math.sin(theta1) * Math.sin(phi2)
        ];
        const v3 = [
          cx + radius * Math.sin(theta2) * Math.cos(phi2),
          cy + radius * Math.cos(theta2),
          cz + radius * Math.sin(theta2) * Math.sin(phi2)
        ];
        const v4 = [
          cx + radius * Math.sin(theta2) * Math.cos(phi1),
          cy + radius * Math.cos(theta2),
          cz + radius * Math.sin(theta2) * Math.sin(phi1)
        ];
        
        const n1 = [Math.sin(theta1)*Math.cos(phi1), Math.cos(theta1), Math.sin(theta1)*Math.sin(phi1)];
        const n2 = [Math.sin(theta1)*Math.cos(phi2), Math.cos(theta1), Math.sin(theta1)*Math.sin(phi2)];
        const n3 = [Math.sin(theta2)*Math.cos(phi2), Math.cos(theta2), Math.sin(theta2)*Math.sin(phi2)];
        const n4 = [Math.sin(theta2)*Math.cos(phi1), Math.cos(theta2), Math.sin(theta2)*Math.sin(phi1)];
        
        positions.push(...v1, ...v2, ...v3, ...v1, ...v3, ...v4);
        normals.push(...n1, ...n2, ...n3, ...n1, ...n3, ...n4);
        bodyParts.push(part, part, part, part, part, part);
      }
    }
  }
  
  // Head (sphere)
  addSphere(0, 0.85, 0, 0.12, 8, BODY_PARTS.HEAD);
  
  // Neck
  addBox(0, 0.6775, 0, 0.1, 0.105, 0.1, BODY_PARTS.HEAD);
  
  // Torso
  addBox(0, 0.35, 0, 0.38, 0.55, 0.2, BODY_PARTS.TORSO);
  
  // Arms
  addBox(-0.25, 0.4, 0, 0.12, 0.5, 0.12, BODY_PARTS.ARMS);
  addBox(0.25, 0.4, 0, 0.12, 0.5, 0.12, BODY_PARTS.ARMS);
  
  // Legs
  addBox(-0.1, -0.25, 0, 0.14, 0.65, 0.14, BODY_PARTS.LEGS);
  addBox(0.1, -0.25, 0, 0.14, 0.65, 0.14, BODY_PARTS.LEGS);
  
  const numVerts = positions.length / 3;
  const indices = [];
  for (let i = 0; i < numVerts; i++) {
    indices.push(i);
  }
  
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    bodyParts: new Float32Array(bodyParts),
    indices: new Uint16Array(indices)
  };
}

export type HitboxDefinition = 
  | { type: 'sphere', part: BODY_PARTS, x: number, y: number, z: number, radius: number }
  | { type: 'box', part: BODY_PARTS, x: number, y: number, z: number, hw: number, hh: number, hd: number };

export function getMannequinHitboxes(targetX: number, targetY: number, targetZ: number, scale: number): HitboxDefinition[] {
  return [
    { 
      part: BODY_PARTS.HEAD, 
      type: 'sphere',
      x: targetX, 
      y: targetY + 0.85 * scale, 
      z: targetZ,
      radius: 0.12 * scale
    },
    { 
      part: BODY_PARTS.HEAD, 
      type: 'box',
      x: targetX, 
      y: targetY + 0.6775 * scale, 
      z: targetZ,
      hw: 0.05 * scale,
      hh: 0.0525 * scale,
      hd: 0.05 * scale
    },
    { 
      part: BODY_PARTS.TORSO, 
      type: 'box',
      x: targetX, 
      y: targetY + 0.35 * scale, 
      z: targetZ,
      hw: 0.19 * scale,
      hh: 0.275 * scale,
      hd: 0.1 * scale
    },
    { 
      part: BODY_PARTS.ARMS, 
      type: 'box',
      x: targetX - 0.25 * scale, 
      y: targetY + 0.4 * scale, 
      z: targetZ,
      hw: 0.06 * scale,
      hh: 0.25 * scale,
      hd: 0.06 * scale
    },
    { 
      part: BODY_PARTS.ARMS, 
      type: 'box',
      x: targetX + 0.25 * scale, 
      y: targetY + 0.4 * scale, 
      z: targetZ,
      hw: 0.06 * scale,
      hh: 0.25 * scale,
      hd: 0.06 * scale
    },
    { 
      part: BODY_PARTS.LEGS, 
      type: 'box',
      x: targetX - 0.1 * scale, 
      y: targetY - 0.25 * scale, 
      z: targetZ,
      hw: 0.07 * scale,
      hh: 0.325 * scale,
      hd: 0.07 * scale
    },
    { 
      part: BODY_PARTS.LEGS, 
      type: 'box',
      x: targetX + 0.1 * scale, 
      y: targetY - 0.25 * scale, 
      z: targetZ,
      hw: 0.07 * scale,
      hh: 0.325 * scale,
      hd: 0.07 * scale
    }
  ];
}

export class MannequinManager {
  public maxTargets: number;
  
  public active: Float32Array;
  public positions: Float32Array;
  public scales: Float32Array;
  public health: Float32Array;
  public damageFlash: Float32Array;
  public modelMatrices: Mat4[];
  
  public activeCount: number = 0;

  constructor(maxTargets: number = 10) {
    this.maxTargets = maxTargets;
    
    this.active = new Float32Array(this.maxTargets);
    this.positions = new Float32Array(this.maxTargets * 3);
    this.scales = new Float32Array(this.maxTargets);
    this.health = new Float32Array(this.maxTargets);
    this.damageFlash = new Float32Array(this.maxTargets);
    this.modelMatrices = Array.from({ length: this.maxTargets }, () => createMat4());
  }

  reset() {
    for (let i = 0; i < this.maxTargets; i++) {
      this.active[i] = 0;
      this.damageFlash[i] = 0;
    }
    this.activeCount = 0;
  }

  spawnMannequin(targetSizeSetting: number = 1.0) {
    const scale = targetSizeSetting * 1.5;
    
    for (let i = 0; i < this.maxTargets && this.activeCount < 5; i++) {
      if (this.active[i] > 0.5) continue;
      
      const x = (Math.random() - 0.5) * 16;
      const y = 0.5 + Math.random() * 2;
      const z = -6 - Math.random() * 10;
      
      this.active[i] = 1;
      this.positions[i * 3] = x;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = z;
      
      this.scales[i] = scale;
      this.health[i] = 100; // base 100 HP
      this.damageFlash[i] = 0;
      
      const mat = this.modelMatrices[i];
      identityMat4(mat);
      translateMat4(mat, mat, [x, y, z]);
      scaleMat4(mat, mat, [scale, scale, scale]);
      
      this.activeCount++;
      break; 
    }
  }

  update(dt: number) {
    for (let i = 0; i < this.maxTargets; i++) {
      if (this.active[i] > 0.5 && this.damageFlash[i] > 0) {
        this.damageFlash[i] -= dt * 5;
        if (this.damageFlash[i] < 0) this.damageFlash[i] = 0;
      }
    }
    
    if (this.activeCount < 3) {
      this.spawnMannequin(1.0);
    }
  }
}
