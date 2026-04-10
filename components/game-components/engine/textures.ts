export function generateConcreteTexture(size: number): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      
      // Base concrete gray
      let value = 80 + Math.random() * 30;
      
      // Add noise
      const nx = x / size * 8;
      const ny = y / size * 8;
      value += Math.sin(nx * 3.7 + ny * 2.3) * 10;
      value += Math.sin(nx * 7.1 - ny * 4.9) * 5;
      
      // Occasional dark spots
      if (Math.random() < 0.02) {
        value -= 20 + Math.random() * 20;
      }
      
      // Subtle cracks
      const crackX = Math.abs(((x * 0.1) % 1) - 0.5);
      const crackY = Math.abs(((y * 0.1) % 1) - 0.5);
      if (crackX < 0.02 || crackY < 0.02) {
        value -= 15;
      }
      
      value = Math.max(30, Math.min(130, value));
      
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value + 5; // Slight blue tint
      data[i + 3] = 255;
    }
  }
  
  return data;
}

export function generateMetalTexture(size: number): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      
      // Base metal gray with slight blue
      let r = 60 + Math.random() * 20;
      let g = 65 + Math.random() * 20;
      let b = 75 + Math.random() * 25;
      
      // Vertical brushed metal streaks
      const streak = Math.sin(x * 0.5 + Math.random() * 0.5) * 8;
      r += streak;
      g += streak;
      b += streak;
      
      // Rivet pattern
      const rivetX = (x % 64) - 32;
      const rivetY = (y % 64) - 32;
      const rivetDist = Math.sqrt(rivetX * rivetX + rivetY * rivetY);
      if (rivetDist < 4) {
        r += 30;
        g += 30;
        b += 35;
      } else if (rivetDist < 6) {
        r -= 10;
        g -= 10;
        b -= 10;
      }
      
      // Subtle scratches
      if (Math.random() < 0.01) {
        r += 20;
        g += 20;
        b += 25;
      }
      
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
      data[i + 3] = 255;
    }
  }
  
  return data;
}
