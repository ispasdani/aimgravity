import { GeometryData } from "../geometry";

export async function loadGLB(url: string): Promise<GeometryData> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  
  const header = new DataView(arrayBuffer, 0, 12);
  const magic = header.getUint32(0, true);
  if (magic !== 0x46546C67) throw new Error("Invalid GLB magic");

  // Chunk 0: JSON
  const chunk0Header = new DataView(arrayBuffer, 12, 8);
  const jsonLength = chunk0Header.getUint32(0, true);
  const jsonChunk = new Uint8Array(arrayBuffer, 20, jsonLength);
  const json = JSON.parse(new TextDecoder().decode(jsonChunk));

  // Chunk 1: BIN
  const binOffset = 20 + jsonLength;
  const chunk1Header = new DataView(arrayBuffer, binOffset, 8);
  const binLength = chunk1Header.getUint32(0, true);
  const binBuffer = arrayBuffer.slice(binOffset + 8, binOffset + 8 + binLength);

  const mesh = json.meshes[0];
  const primitive = mesh.primitives[0];
  const attributes = primitive.attributes;

  function getBufferData(accessorIndex: number) {
    const accessor = json.accessors[accessorIndex];
    const bufferView = json.bufferViews[accessor.bufferView];
    const offset = (accessor.byteOffset || 0) + (bufferView.byteOffset || 0);
    const byteLength = accessor.count * (accessor.type === "SCALAR" ? 1 : accessor.type === "VEC2" ? 2 : accessor.type === "VEC3" ? 3 : 4) * 
                       (accessor.componentType === 5126 ? 4 : 2); // Assume 4 for float, 2 for short
    
    // Use slice to ensure alignment for TypedArray constructor
    const chunk = binBuffer.slice(offset, offset + byteLength);
    
    if (accessor.componentType === 5126) return new Float32Array(chunk);
    if (accessor.componentType === 5123) return new Uint16Array(chunk);
    if (accessor.componentType === 5121) return new Uint8Array(chunk);
    return new Float32Array(chunk);
  }

  let positions = getBufferData(attributes.POSITION) as Float32Array;
  const normals = getBufferData(attributes.NORMAL) as Float32Array;
  const uvs = attributes.TEXCOORD_0 !== undefined ? getBufferData(attributes.TEXCOORD_0) as Float32Array : undefined;
  const indices = getBufferData(primitive.indices) as Uint16Array;

  // --- Normalization Logic ---
  // Calculate bounding box
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  
  for (let i = 0; i < positions.length; i += 3) {
    minX = Math.min(minX, positions[i]);
    minY = Math.min(minY, positions[i+1]);
    minZ = Math.min(minZ, positions[i+2]);
    maxX = Math.max(maxX, positions[i]);
    maxY = Math.max(maxY, positions[i+1]);
    maxZ = Math.max(maxZ, positions[i+2]);
  }
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  
  const sizeX = maxX - minX;
  const sizeY = maxY - minY;
  const sizeZ = maxZ - minZ;
  const maxDim = Math.max(sizeX, sizeY, sizeZ);
  
  // Target size (e.g. 0.2 units long for a pistol)
  const scale = 0.2 / maxDim;
  
  // Apply centering and scaling
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (positions[i] - centerX) * scale;
    positions[i+1] = (positions[i+1] - centerY) * scale;
    positions[i+2] = (positions[i+2] - centerZ) * scale;
  }

  const colors = new Float32Array(positions.length);
  colors.fill(1.0); // Pure white default for texturing

  const ids = new Float32Array(positions.length / 3);
  ids.fill(0.0); // Default to static part for all vertices

  return {
    positions,
    normals,
    indices,
    uvs,
    colors,
    ids
  };
}
