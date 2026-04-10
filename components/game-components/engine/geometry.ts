export interface GeometryData {
  positions: Float32Array;
  uvs?: Float32Array;
  normals?: Float32Array;
  colors?: Float32Array;
  indices: Uint16Array;
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
