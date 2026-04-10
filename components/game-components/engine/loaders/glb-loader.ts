import { GeometryData } from "../geometry";

export async function loadGLB(url: string, externalTextureUrl?: string): Promise<GeometryData> {
  console.log(`[GLB Loader] Fetching ${url}...`);
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  
  const header = new DataView(arrayBuffer, 0, 12);
  const magic = header.getUint32(0, true);
  if (magic !== 0x46546C67) throw new Error("Invalid GLB magic");

  const chunk0Header = new DataView(arrayBuffer, 12, 8);
  const jsonLength = chunk0Header.getUint32(0, true);
  const jsonChunk = new Uint8Array(arrayBuffer, 20, jsonLength);
  const json = JSON.parse(new TextDecoder().decode(jsonChunk));

  const binOffset = 20 + jsonLength;
  const chunk1Header = new DataView(arrayBuffer, binOffset, 8);
  const binLength = chunk1Header.getUint32(0, true);
  const binBuffer = arrayBuffer.slice(binOffset + 8, binOffset + 8 + binLength);

  console.log(`[GLB Loader] JSON parsed. Total Meshes: ${json.meshes?.length}`);

  const allPositions: number[] = [];
  const allNormals: number[] = [];
  const allUVs: number[] = [];
  const allIndices: number[] = [];
  let vertexOffset = 0;
  let finalIndexType = 5123; // Default to SHORT

  function getBufferData(accessorIndex: number) {
    if (accessorIndex === undefined) return undefined;
    const accessor = json.accessors[accessorIndex];
    const bufferView = json.bufferViews[accessor.bufferView];
    const offset = (accessor.byteOffset || 0) + (bufferView.byteOffset || 0);
    
    let componentSize = 2;
    if (accessor.componentType === 5126 || accessor.componentType === 5125) componentSize = 4;
    else if (accessor.componentType === 5121) componentSize = 1;
    
    const typeCount = accessor.type === "SCALAR" ? 1 : accessor.type === "VEC2" ? 2 : accessor.type === "VEC3" ? 3 : 4;
    const byteLength = accessor.count * typeCount * componentSize;
    const chunk = binBuffer.slice(offset, offset + byteLength);
    
    if (accessor.componentType === 5126) return new Float32Array(chunk);
    if (accessor.componentType === 5125) return new Uint32Array(chunk);
    if (accessor.componentType === 5123) return new Uint16Array(chunk);
    if (accessor.componentType === 5121) return new Uint8Array(chunk);
    return new Float32Array(chunk);
  }

  // Find all nodes with a mesh instance, or default to all meshes if no nodes exist
  const nodesWithMesh = json.nodes ? json.nodes.filter((n: any) => n.mesh !== undefined) : [];
  const instances = nodesWithMesh.length > 0 ? nodesWithMesh : json.meshes.map((m: any, i: number) => ({ mesh: i }));

  // Iterate over all instanced meshes and apply their Transforms (TRS)
  for (const node of instances) {
    const mesh = json.meshes[node.mesh];
    
    // Extract Transform
    let tx = 0, ty = 0, tz = 0;
    if (node.translation) { tx = node.translation[0]; ty = node.translation[1]; tz = node.translation[2]; }
    
    let qx = 0, qy = 0, qz = 0, qw = 1;
    if (node.rotation) { qx = node.rotation[0]; qy = node.rotation[1]; qz = node.rotation[2]; qw = node.rotation[3]; }
    
    let sx = 1, sy = 1, sz = 1;
    if (node.scale) { sx = node.scale[0]; sy = node.scale[1]; sz = node.scale[2]; }

    for (const primitive of mesh.primitives) {
      if (!primitive.attributes) continue;
      
      const positions = getBufferData(primitive.attributes.POSITION) as Float32Array;
      const normals = getBufferData(primitive.attributes.NORMAL) as Float32Array;
      const uvs = primitive.attributes.TEXCOORD_0 !== undefined ? getBufferData(primitive.attributes.TEXCOORD_0) as Float32Array : undefined;
      
      const indicesAccessor = json.accessors[primitive.indices];
      const indices = getBufferData(primitive.indices) as Uint8Array | Uint16Array | Uint32Array;
      
      if (indicesAccessor.componentType > finalIndexType) {
        finalIndexType = indicesAccessor.componentType;
      }

      // Collect data and apply transform
      for (let i = 0; i < positions.length; i += 3) {
        // scale
        let px = positions[i] * sx, py = positions[i+1] * sy, pz = positions[i+2] * sz;
        
        // rotate (quaternion)
        let ix = qw * px + qy * pz - qz * py;
        let iy = qw * py + qz * px - qx * pz;
        let iz = qw * pz + qx * py - qy * px;
        let iw = -qx * px - qy * py - qz * pz;
        
        let rx = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        let ry = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        let rz = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        
        // translate
        allPositions.push(rx + tx, ry + ty, rz + tz);
      }
      
      if (normals) {
        for (let i = 0; i < normals.length; i += 3) {
          let px = normals[i], py = normals[i+1], pz = normals[i+2];
          let ix = qw * px + qy * pz - qz * py;
          let iy = qw * py + qz * px - qx * pz;
          let iz = qw * pz + qx * py - qy * px;
          let iw = -qx * px - qy * py - qz * pz;
          
          let rx = ix * qw + iw * -qx + iy * -qz - iz * -qy;
          let ry = iy * qw + iw * -qy + iz * -qx - ix * -qz;
          let rz = iz * qw + iw * -qz + ix * -qy - iy * -qx;
          allNormals.push(rx, ry, rz);
        }
      }
      
      if (uvs) for (let i = 0; i < uvs.length; i++) allUVs.push(uvs[i]);
      
      for (let i = 0; i < indices.length; i++) {
        allIndices.push(indices[i] + vertexOffset);
      }
      
      vertexOffset += positions.length / 3;
    }
  }

  let positions = new Float32Array(allPositions);
  const normals = new Float32Array(allNormals);
  const uvs = allUVs.length > 0 ? new Float32Array(allUVs) : undefined;
  // Convert indices to appropriate typed array based on final type
  const indices = finalIndexType === 5125 
    ? new Uint32Array(allIndices) 
    : finalIndexType === 5121 ? new Uint8Array(allIndices) as any : new Uint16Array(allIndices);

  // --- Normalization Logic ---
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
  const maxDim = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
  const scale = 0.2 / maxDim;
  
  console.log(`[GLB Loader] Merged Model. Total Vertices: ${vertexOffset}, Applying scale: ${scale.toFixed(4)}`);

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (positions[i] - centerX) * scale;
    positions[i+1] = (positions[i+1] - centerY) * scale;
    positions[i+2] = (positions[i+2] - centerZ) * scale;
  }

  const colors = new Float32Array(positions.length).fill(1.0);
  const ids = new Float32Array(positions.length / 3).fill(0.0);

  // --- Texture Extraction ---
  let textureImage: ImageBitmap | HTMLImageElement | undefined = undefined;
  
  if (externalTextureUrl) {
    const img = new Image();
    img.src = externalTextureUrl;
    await new Promise((resolve) => img.onload = resolve);
    textureImage = img;
  } else {
    try {
      const material = json.materials?.[0];
      const textureIndex = material?.pbrMetallicRoughness?.baseColorTexture?.index;
      if (textureIndex !== undefined) {
        const sourceIndex = json.textures[textureIndex].source;
        const image = json.images[sourceIndex];
        const bufferView = json.bufferViews[image.bufferView];
        const imageBuffer = binBuffer.slice(bufferView.byteOffset || 0, (bufferView.byteOffset || 0) + bufferView.byteLength);
        textureImage = await createImageBitmap(new Blob([imageBuffer], { type: image.mimeType || "image/png" }));
      }
    } catch (err) {}
  }

  return { positions, normals, indices, indexType: finalIndexType, uvs, colors, ids, texture: textureImage };
}
