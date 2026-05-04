export interface GeometryData {
  positions: Float32Array;
  uvs?: Float32Array;
  normals?: Float32Array;
  colors?: Float32Array;
  ids?: Float32Array;
  indices: Uint16Array | Uint32Array;
  indexType?: number; // gl.UNSIGNED_SHORT or gl.UNSIGNED_INT
  texture?: ImageBitmap | HTMLImageElement;
}

export function createBoxGeometry(width: number, height: number, depth: number): GeometryData {
  const w = width / 2;
  const h = height / 2;
  const d = depth / 2;

  // 8 vertices of a box
  // 24 vertices to have correct normals (4 per face)
  // For simplicity, we just need positions and indices if we don't care about lighting the target
  // But let's provide standard 24 vertex positions
  const positions = new Float32Array([
    // Front face
    -w, -h,  d,   w, -h,  d,   w,  h,  d,  -w,  h,  d,
    // Back face
    -w, -h, -d,  -w,  h, -d,   w,  h, -d,   w, -h, -d,
    // Top face
    -w,  h, -d,  -w,  h,  d,   w,  h,  d,   w,  h, -d,
    // Bottom face
    -w, -h, -d,   w, -h, -d,   w, -h,  d,  -w, -h,  d,
    // Right face
     w, -h, -d,   w,  h, -d,   w,  h,  d,   w, -h,  d,
    // Left face
    -w, -h, -d,  -w, -h,  d,  -w,  h,  d,  -w,  h, -d,
  ]);

  const indices = new Uint16Array([
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ]);

  return { positions, indices };
}

export function createSphereGeometry(segments: number): GeometryData {
  const positions: number[] = [];
  const rings = segments;
  const sectors = segments * 2;
  
  for (let r = 0; r <= rings; r++) {
    const theta = (r / rings) * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    for (let s = 0; s <= sectors; s++) {
      const phi = (s / sectors) * Math.PI * 2;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      
      positions.push(cosPhi * sinTheta, cosTheta, sinPhi * sinTheta);
    }
  }
  
  const indices: number[] = [];
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < sectors; s++) {
      const first = r * (sectors + 1) + s;
      const second = first + sectors + 1;
      
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }
  
  return {
    positions: new Float32Array(positions),
    indices: new Uint16Array(indices)
  };
}

export function createPlaneGeometry(size: number): GeometryData {
  const h = size / 2;
  return {
    positions: new Float32Array([
      -h, 0, -h,  h, 0, -h,  h, 0, h,  -h, 0, h
    ]),
    uvs: new Float32Array([
      0, 0,  1, 0,  1, 1,  0, 1
    ]),
    indices: new Uint16Array([0, 2, 1, 0, 3, 2])
  };
}

export function createQuadGeometry(): GeometryData {
  return {
    positions: new Float32Array([
      -1, -1, 0,  1, -1, 0,  1, 1, 0,  -1, 1, 0
    ]),
    uvs: new Float32Array([
      0, 0,  1, 0,  1, 1,  0, 1
    ]),
    indices: new Uint16Array([0, 1, 2, 0, 2, 3])
  };
}
