import { GeometryData } from "../geometry";

export function createPSXPistolGeometry(): GeometryData {
  // Low-poly PSX-style pistol (~150 triangles)
  // All positions, normals, and colors for vertex coloring
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  
  // Color palette (PSX style - muted, slightly dithered looking)
  const gunMetal = [0.25, 0.25, 0.28];
  const darkMetal = [0.15, 0.15, 0.18];
  const grip = [0.35, 0.25, 0.15]; // Brown wood/plastic grip
  const highlight = [0.4, 0.4, 0.45];
  
  let vertexIndex = 0;
  
  // Helper to add a box
  function addBox(x: number, y: number, z: number, w: number, h: number, d: number, color: number[]) {
    const hw = w / 2, hh = h / 2, hd = d / 2;
    const startIndex = vertexIndex;
    
    // Front face
    positions.push(x - hw, y - hh, z + hd);
    positions.push(x + hw, y - hh, z + hd);
    positions.push(x + hw, y + hh, z + hd);
    positions.push(x - hw, y + hh, z + hd);
    for (let i = 0; i < 4; i++) { normals.push(0, 0, 1); colors.push(...color); }
    
    // Back face
    positions.push(x + hw, y - hh, z - hd);
    positions.push(x - hw, y - hh, z - hd);
    positions.push(x - hw, y + hh, z - hd);
    positions.push(x + hw, y + hh, z - hd);
    for (let i = 0; i < 4; i++) { normals.push(0, 0, -1); colors.push(...color); }
    
    // Top face
    positions.push(x - hw, y + hh, z + hd);
    positions.push(x + hw, y + hh, z + hd);
    positions.push(x + hw, y + hh, z - hd);
    positions.push(x - hw, y + hh, z - hd);
    for (let i = 0; i < 4; i++) { normals.push(0, 1, 0); colors.push(...color); }
    
    // Bottom face
    positions.push(x - hw, y - hh, z - hd);
    positions.push(x + hw, y - hh, z - hd);
    positions.push(x + hw, y - hh, z + hd);
    positions.push(x - hw, y - hh, z + hd);
    for (let i = 0; i < 4; i++) { normals.push(0, -1, 0); colors.push(...color); }
    
    // Right face
    positions.push(x + hw, y - hh, z + hd);
    positions.push(x + hw, y - hh, z - hd);
    positions.push(x + hw, y + hh, z - hd);
    positions.push(x + hw, y + hh, z + hd);
    for (let i = 0; i < 4; i++) { normals.push(1, 0, 0); colors.push(...color); }
    
    // Left face
    positions.push(x - hw, y - hh, z - hd);
    positions.push(x - hw, y - hh, z + hd);
    positions.push(x - hw, y + hh, z + hd);
    positions.push(x - hw, y + hh, z - hd);
    for (let i = 0; i < 4; i++) { normals.push(-1, 0, 0); colors.push(...color); }
    
    // Add indices for all 6 faces (2 triangles each)
    for (let face = 0; face < 6; face++) {
       const base = startIndex + face * 4;
       indices.push(base, base + 1, base + 2);
       indices.push(base, base + 2, base + 3);
    }
    
    vertexIndex += 24;
  }
  
  // Build the pistol
  // Main body/slide
  addBox(0, 0, 0, 0.04, 0.05, 0.18, gunMetal);
  
  // Barrel (extends forward)
  addBox(0, 0.005, -0.12, 0.025, 0.03, 0.08, darkMetal);
  
  // Grip (angled down)
  addBox(0, -0.055, 0.04, 0.035, 0.08, 0.05, grip);
  
  // Trigger guard
  addBox(0, -0.04, -0.01, 0.025, 0.015, 0.04, gunMetal);
  
  // Trigger
  addBox(0, -0.035, 0.0, 0.01, 0.02, 0.01, darkMetal);
  
  // Rear sight
  addBox(0, 0.035, 0.06, 0.03, 0.015, 0.01, darkMetal);
  
  // Front sight
  addBox(0, 0.032, -0.07, 0.015, 0.012, 0.008, darkMetal);
  
  // Slide serrations (decorative boxes on slide)
  addBox(0, 0.015, 0.055, 0.042, 0.02, 0.025, highlight);
  
  // Hammer
  addBox(0, 0.02, 0.085, 0.015, 0.025, 0.015, darkMetal);
  
  // Magazine base
  addBox(0, -0.095, 0.04, 0.03, 0.01, 0.04, darkMetal);
  
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices)
  };
}
