export enum BODY_PARTS {
  HEAD = 0,
  TORSO = 1,
  ARMS = 2,
  LEGS = 3
}

export interface WeaponDamageStats {
  baseDamage: number;
  headMultiplier: number;
  torsoMultiplier: number;
  armsMultiplier: number;
  legsMultiplier: number;
}

export const CS2_WEAPON_STATS: Record<string, WeaponDamageStats> = {
  'AK-47': {
    baseDamage: 36,
    headMultiplier: 4.0,   // 144
    torsoMultiplier: 1.0,  // 36
    armsMultiplier: 0.75,  // 27
    legsMultiplier: 0.75   // 27
  },
  'P2000': {
    baseDamage: 35,
    headMultiplier: 4.0,   // 140
    torsoMultiplier: 1.0,  // 35
    armsMultiplier: 0.75,  // 26
    legsMultiplier: 0.75   // 26
  },
  'GLOCK': {
    baseDamage: 30,
    headMultiplier: 4.0,   // 120
    torsoMultiplier: 1.0,  // 30
    armsMultiplier: 0.75,  // 22
    legsMultiplier: 0.75   // 22
  }
};

export interface HitEvent {
  hitPos: { x: number, y: number, z: number };
  bodyPart: BODY_PARTS;
  damage: number;
  targetId: number;
  timestamp: number;
}

/**
 * Calculate damage based on the weapon and body part hit.
 */
export function calculateDamage(weaponName: string, bodyPart: BODY_PARTS): number {
  const stats = CS2_WEAPON_STATS[weaponName] || CS2_WEAPON_STATS['GLOCK'];
  let multiplier = 1.0;
  
  switch (bodyPart) {
    case BODY_PARTS.HEAD:
      multiplier = stats.headMultiplier;
      break;
    case BODY_PARTS.TORSO:
      multiplier = stats.torsoMultiplier;
      break;
    case BODY_PARTS.ARMS:
      multiplier = stats.armsMultiplier;
      break;
    case BODY_PARTS.LEGS:
      multiplier = stats.legsMultiplier;
      break;
  }
  
  return Math.round(stats.baseDamage * multiplier);
}
