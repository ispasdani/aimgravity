import { GeometryData } from "../geometry";

export function createPSXPistolGeometry(): GeometryData {
  // Low-poly PSX-style pistol (~150 triangles)
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const ids: number[] = [];
  const indices: number[] = [];
  
  // Color palette
  const gunMetal = [0.25, 0.25, 0.28];
  const darkMetal = [0.15, 0.15, 0.18];
  const grip = [0.35, 0.25, 0.15]; 
  const highlight = [0.4, 0.4, 0.45];
  
  let vertexIndex = 0;
  
  const ID_STATIC = 0.0;
  const ID_SLIDE = 1.0;

  function addBox(x: number, y: number, z: number, w: number, h: number, d: number, color: number[], partId: number) {
    const hw = w / 2, hh = h / 2, hd = d / 2;
    const startIndex = vertexIndex;
    
    // Front face
    positions.push(x - hw, y - hh, z + hd);
    positions.push(x + hw, y - hh, z + hd);
    positions.push(x + hw, y + hh, z + hd);
    positions.push(x - hw, y + hh, z + hd);
    for (let i = 0; i < 4; i++) { normals.push(0, 0, 1); colors.push(...color); ids.push(partId); }
    
    // Back face
    positions.push(x + hw, y - hh, z - hd);
    positions.push(x - hw, y - hh, z - hd);
    positions.push(x - hw, y + hh, z - hd);
    positions.push(x + hw, y + hh, z - hd);
    for (let i = 0; i < 4; i++) { normals.push(0, 0, -1); colors.push(...color); ids.push(partId); }
    
    // Top face
    positions.push(x - hw, y + hh, z + hd);
    positions.push(x + hw, y + hh, z + hd);
    positions.push(x + hw, y + hh, z - hd);
    positions.push(x - hw, y + hh, z - hd);
    for (let i = 0; i < 4; i++) { normals.push(0, 1, 0); colors.push(...color); ids.push(partId); }
    
    // Bottom face
    positions.push(x - hw, y - hh, z - hd);
    positions.push(x + hw, y - hh, z - hd);
    positions.push(x + hw, y - hh, z + hd);
    positions.push(x - hw, y - hh, z + hd);
    for (let i = 0; i < 4; i++) { normals.push(0, -1, 0); colors.push(...color); ids.push(partId); }
    
    // Right face
    positions.push(x + hw, y - hh, z + hd);
    positions.push(x + hw, y - hh, z - hd);
    positions.push(x + hw, y + hh, z - hd);
    positions.push(x + hw, y + hh, z + hd);
    for (let i = 0; i < 4; i++) { normals.push(1, 0, 0); colors.push(...color); ids.push(partId); }
    
    // Left face
    positions.push(x - hw, y - hh, z - hd);
    positions.push(x - hw, y - hh, z + hd);
    positions.push(x - hw, y + hh, z + hd);
    positions.push(x - hw, y + hh, z - hd);
    for (let i = 0; i < 4; i++) { normals.push(-1, 0, 0); colors.push(...color); ids.push(partId); }
    
    for (let face = 0; face < 6; face++) {
       const base = startIndex + face * 4;
       indices.push(base, base + 1, base + 2);
       indices.push(base, base + 2, base + 3);
    }
    
    vertexIndex += 24;
  }
  
  // Build the pistol
  // SLIDE (top half)
  addBox(0, 0, 0, 0.04, 0.05, 0.18, gunMetal, ID_SLIDE);
  addBox(0, 0.035, 0.06, 0.03, 0.015, 0.01, darkMetal, ID_SLIDE); // Rear sight
  addBox(0, 0.032, -0.07, 0.015, 0.012, 0.008, darkMetal, ID_SLIDE); // Front sight
  addBox(0, 0.015, 0.055, 0.042, 0.02, 0.025, highlight, ID_SLIDE); // Serrations
  addBox(0, 0.02, 0.085, 0.015, 0.025, 0.015, darkMetal, ID_SLIDE); // Hammer

  // STATIC (frame/barrel)
  addBox(0, 0.005, -0.12, 0.025, 0.03, 0.08, darkMetal, ID_STATIC); // Barrel
  addBox(0, -0.055, 0.04, 0.035, 0.08, 0.05, grip, ID_STATIC); // Grip
  addBox(0, -0.04, -0.01, 0.025, 0.015, 0.04, gunMetal, ID_STATIC); // Guard
  addBox(0, -0.035, 0.0, 0.01, 0.02, 0.01, darkMetal, ID_STATIC); // Trigger
  addBox(0, -0.095, 0.04, 0.03, 0.01, 0.04, darkMetal, ID_STATIC); // Mag base
  
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
    ids: new Float32Array(ids),
    indices: new Uint16Array(indices)
  };
}
