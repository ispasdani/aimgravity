export const FLOOR_VS = `#version 300 es
precision highp float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec2 a_uv;

uniform mat4 u_viewProj;

out vec2 v_uv;
out vec3 v_worldPos;

void main() {
  v_uv = a_uv * 10.0; // tile the texture
  v_worldPos = a_position;
  gl_Position = u_viewProj * vec4(a_position, 1.0);
}
`;

export const FLOOR_FS = `#version 300 es
precision highp float;

in vec2 v_uv;
in vec3 v_worldPos;

uniform sampler2D u_texture;

out vec4 fragColor;

void main() {
  vec3 color = texture(u_texture, v_uv).rgb;
  
  // Distance fog
  float dist = length(v_worldPos.xz);
  float fog = 1.0 - smoothstep(20.0, 50.0, dist);
  color = mix(vec3(0.05, 0.05, 0.08), color, fog);
  
  fragColor = vec4(color, 1.0);
}
`;

export const WALL_VS = `#version 300 es
precision highp float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec2 a_uv;

uniform mat4 u_viewProj;
uniform mat4 u_model;

out vec2 v_uv;

void main() {
  v_uv = a_uv * 3.0;
  gl_Position = u_viewProj * u_model * vec4(a_position, 1.0);
}
`;

export const WALL_FS = `#version 300 es
precision highp float;

in vec2 v_uv;

uniform sampler2D u_texture;

out vec4 fragColor;

void main() {
  vec3 color = texture(u_texture, v_uv).rgb;
  fragColor = vec4(color, 1.0);
}
`;

export const TARGET_VS = `#version 300 es
precision highp float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_instancePos;
layout(location = 2) in float a_instanceScale;
layout(location = 3) in float a_instanceActive;

uniform mat4 u_viewProj;

out float v_active;
out vec3 v_normal;

void main() {
  v_active = a_instanceActive;
  v_normal = normalize(a_position);
  
  vec3 worldPos = a_position * a_instanceScale + a_instancePos;
  gl_Position = u_viewProj * vec4(worldPos, 1.0);
}
`;

export const TARGET_FS = `#version 300 es
precision highp float;

in float v_active;
in vec3 v_normal;

out vec4 fragColor;

void main() {
  if (v_active < 0.5) discard;
  
  // Bright red/orange target with rim lighting
  vec3 baseColor = vec3(1.0, 0.2, 0.1);
  float rim = 1.0 - abs(dot(v_normal, vec3(0.0, 0.0, 1.0)));
  rim = pow(rim, 2.0);
  vec3 color = baseColor + rim * 0.5;
  
  fragColor = vec4(color, 1.0);
}
`;

export const CROSSHAIR_VS = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;

uniform vec2 u_resolution;

void main() {
  vec2 pos = a_position / u_resolution * 2.0;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

export const CROSSHAIR_FS = `#version 300 es
precision highp float;

out vec4 fragColor;

void main() {
  fragColor = vec4(0.0, 1.0, 0.8, 1.0);
}
`;

export const WEAPON_VS = `#version 300 es
precision highp float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec3 a_color;
layout(location = 3) in float a_partId;

uniform mat4 u_model;
uniform mat4 u_projection;
uniform float u_time;
uniform float u_recoil;

out vec3 v_normal;
out vec3 v_color;
out vec3 v_worldPos;

void main() {
  vec3 pos = a_position;
  
  // Slide animation (ID 1.0)
  // Slide moves back (positive Z in model space) during recoil
  if (a_partId > 0.5) {
    pos.z += u_recoil * 0.08;
  }
  
  // Apply model transform
  vec4 worldPos = u_model * vec4(pos, 1.0);
  
  // Apply snappy frame recoil
  // Pitch up and move back
  float recoilFactor = pow(u_recoil, 1.5);
  worldPos.z += recoilFactor * 0.04;
  worldPos.y += recoilFactor * 0.02;
  
  // Slight rotation around X axis for kickback
  float angle = recoilFactor * 0.1;
  float c = cos(angle);
  float s = sin(angle);
  // Simple rotation around model origin for better pivot
  float ry = worldPos.y;
  float rz = worldPos.z;
  worldPos.y = ry * c - rz * s;
  worldPos.z = ry * s + rz * c;
  
  // Idle sway
  float swayX = sin(u_time * 2.0) * 0.002;
  float swayY = sin(u_time * 1.5) * 0.001;
  worldPos.x += swayX;
  worldPos.y += swayY;
  
  v_worldPos = worldPos.xyz;
  v_normal = mat3(u_model) * a_normal;
  v_color = a_color;
  
  gl_Position = u_projection * worldPos;
}
`;

export const WEAPON_FS = `#version 300 es
precision highp float;

in vec3 v_normal;
in vec3 v_color;
in vec3 v_worldPos;

uniform float u_muzzleFlash;

out vec4 fragColor;

void main() {
  // PSX-style flat shading with harsh lighting
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
  vec3 normal = normalize(v_normal);
  
  float diff = max(dot(normal, lightDir), 0.0);
  float ambient = 0.3;
  
  // Quantize lighting for PSX effect
  diff = floor(diff * 4.0) / 4.0;
  
  vec3 color = v_color * (ambient + diff * 0.7);
  
  // Add muzzle flash glow
  color += vec3(1.0, 0.6, 0.2) * u_muzzleFlash * 0.5;
  
  fragColor = vec4(color, 1.0);
}
`;
