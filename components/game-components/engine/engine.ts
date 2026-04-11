import { createMat4, identityMat4, perspectiveMat4, multiplyMat4, rotateXMat4, rotateYMat4, rotateZMat4, translateMat4, scaleMat4, Mat4 } from './math';
import { FLOOR_VS, FLOOR_FS, WALL_VS, WALL_FS, TARGET_VS, TARGET_FS, CROSSHAIR_VS, CROSSHAIR_FS, WEAPON_VS, WEAPON_FS } from './shaders';
import { createSphereGeometry, createPlaneGeometry, createQuadGeometry } from './geometry';
import { generateConcreteTexture, generateMetalTexture } from './textures';
import { createPSXPistolGeometry } from './weapons/psx-pistol';
import { TargetManager } from './targets/target-manager';
import { TracerSystem } from './tracer-system';

export interface EngineSettings {
  fov?: number;
  drillDuration?: number;
  sensitivity?: number;
  targetSize?: number;
  tracersEnabled?: boolean;
}

export interface GameState {
  timeRemaining: number;
  shots: number;
  hits: number;
  accuracy: number;
}

export class Engine {
  canvas: HTMLCanvasElement;
  settings: EngineSettings;
  gl: WebGL2RenderingContext;
  previewMode: boolean = false;

  running: boolean = false;
  frameId: number = 0;
  lastTime: number = 0;
  gameTime: number = 0;
  instanceId: string = Math.random().toString(36).substring(7);
  
  weaponOffset: [number, number, number] = [0.15, -0.4, -0.6];
  weaponRotation: [number, number, number] = [-0.25, 0.15, 0]; // Yaw, Pitch, Roll
  weaponScale: number = 1.1;

  yaw: number = 0;
  pitch: number = 0;
  cameraPos: number[] = [0, 1.7, 0];

  projMatrix: Mat4 = createMat4();
  viewMatrix: Mat4 = createMat4();
  viewProjMatrix: Mat4 = createMat4();
  modelMatrix: Mat4 = createMat4();
  weaponProjMatrix: Mat4 = createMat4();
  weaponModelMatrix: Mat4 = createMat4();

  mouseDeltaX: number = 0;
  mouseDeltaY: number = 0;
  pendingShot: boolean = false;
  pointerLocked: boolean = false;

  shots: number = 0;
  hits: number = 0;
  timeRemaining: number = 30;
  startTime: number = 0;

  recoil: number = 0;
  muzzleFlash: number = 0;

  targetManager: TargetManager;
  tracerSystem!: TracerSystem;

  onStateUpdate: ((state: GameState) => void) | null = null;
  onGameEnd: ((state: GameState) => void) | null = null;
  onPointerLockError: (() => void) | null = null;

  // WebGL Objects
  floorProgram!: WebGLProgram;
  wallProgram!: WebGLProgram;
  targetProgram!: WebGLProgram;
  crosshairProgram!: WebGLProgram;
  weaponProgram!: WebGLProgram;

  floorVAO!: WebGLVertexArrayObject;
  wallVAO!: WebGLVertexArrayObject;
  targetVAO!: WebGLVertexArrayObject;
  crosshairVAO!: WebGLVertexArrayObject;
  weaponVAO!: WebGLVertexArrayObject;

  floorIndexCount: number = 0;
  wallIndexCount: number = 0;
  targetIndexCount: number = 0;
  weaponIndexCount: number = 0;
  weaponIndexType: number = 5123; // Default UNSIGNED_SHORT (5123)

  targetPosBuffer!: WebGLBuffer;
  targetScaleBuffer!: WebGLBuffer;
  targetActiveBuffer!: WebGLBuffer;
  weaponIdBuffer!: WebGLBuffer;
  weaponTexture: WebGLTexture | null = null;

  concreteTexture!: WebGLTexture;
  metalTexture!: WebGLTexture;

  constructor(canvas: HTMLCanvasElement, settings: EngineSettings = {}) {
    this.canvas = canvas;
    this.settings = { ...settings };

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      throw new Error('WebGL2 not supported');
    }

    this.gl = gl;
    this.targetManager = new TargetManager(50);

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleLockChange = this.handleLockChange.bind(this);
    this.handleLockError = this.handleLockError.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.loop = this.loop.bind(this);

    console.log(`[Engine ${this.instanceId}] Initialized`);
    this.init();
  }

  init() {
    const gl = this.gl;

    // Resize
    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    // GL setup
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0.05, 0.05, 0.08, 1.0);

    // Create shaders and programs
    this.floorProgram = this.createProgram(FLOOR_VS, FLOOR_FS)!;
    this.wallProgram = this.createProgram(WALL_VS, WALL_FS)!;
    this.targetProgram = this.createProgram(TARGET_VS, TARGET_FS)!;
    this.crosshairProgram = this.createProgram(CROSSHAIR_VS, CROSSHAIR_FS)!;
    this.weaponProgram = this.createWeaponProgram()!;

    // Create geometry
    this.createFloorGeometry();
    this.createWallGeometry();
    this.createTargetGeometry();
    this.createCrosshairGeometry();
    this.createWeaponGeometry();

    // Create textures
    this.concreteTexture = this.createTexture(generateConcreteTexture(256), 256)!;
    this.metalTexture = this.createTexture(generateMetalTexture(256), 256)!;

    this.tracerSystem = new TracerSystem(this.gl);
    if (this.settings.tracersEnabled !== undefined) {
      this.tracerSystem.enabled = this.settings.tracersEnabled;
    }

    // Initial projection matrix
    this.updateProjection();
  }

  createShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  createProgram(vsSource: string, fsSource: string): any {
    const gl = this.gl;
    const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }

    (program as any).uniforms = {
      viewProj: gl.getUniformLocation(program, 'u_viewProj'),
      model: gl.getUniformLocation(program, 'u_model'),
      texture: gl.getUniformLocation(program, 'u_texture'),
      resolution: gl.getUniformLocation(program, 'u_resolution')
    };

    return program;
  }

  createWeaponProgram(): any {
    const gl = this.gl;
    const vs = this.createShader(gl.VERTEX_SHADER, WEAPON_VS);
    const fs = this.createShader(gl.FRAGMENT_SHADER, WEAPON_FS);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Weapon program link error:', gl.getProgramInfoLog(program));
      return null;
    }

    (program as any).uniforms = {
      model: gl.getUniformLocation(program, 'u_model'),
      projection: gl.getUniformLocation(program, 'u_projection'),
      time: gl.getUniformLocation(program, 'u_time'),
      recoil: gl.getUniformLocation(program, 'u_recoil'),
      muzzleFlash: gl.getUniformLocation(program, 'u_muzzleFlash'),
      useTexture: gl.getUniformLocation(program, 'u_useTexture'),
      texture: gl.getUniformLocation(program, 'u_texture')
    };

    return program;
  }

  createTexture(data: Uint8Array, size: number): WebGLTexture | null {
    const gl = this.gl;
    const texture = gl.createTexture();
    if (!texture) return null;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
  }

  createFloorGeometry() {
    const gl = this.gl;
    const geo = createPlaneGeometry(100);

    this.floorVAO = gl.createVertexArray()!;
    gl.bindVertexArray(this.floorVAO);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geo.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geo.uvs!, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);

    this.floorIndexCount = geo.indices.length;
    gl.bindVertexArray(null);
  }

  createWallGeometry() {
    const gl = this.gl;
    const geo = createQuadGeometry();

    this.wallVAO = gl.createVertexArray()!;
    gl.bindVertexArray(this.wallVAO);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geo.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geo.uvs!, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);

    this.wallIndexCount = geo.indices.length;
    gl.bindVertexArray(null);
  }

  createTargetGeometry() {
    const gl = this.gl;
    const sphere = createSphereGeometry(12);

    this.targetVAO = gl.createVertexArray()!;
    gl.bindVertexArray(this.targetVAO);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    this.targetPosBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.targetPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.targetManager.positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);

    this.targetScaleBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.targetScaleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.targetManager.scales, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1);

    this.targetActiveBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.targetActiveBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.targetManager.active, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(3, 1);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

    this.targetIndexCount = sphere.indices.length;
    gl.bindVertexArray(null);
  }

  createCrosshairGeometry() {
    const gl = this.gl;
    const size = 10;
    const gap = 3;

    const positions = new Float32Array([
      -size, 0, -gap, 0,
      gap, 0, size, 0,
      0, gap, 0, size,
      0, -size, 0, -gap
    ]);

    this.crosshairVAO = gl.createVertexArray()!;
    gl.bindVertexArray(this.crosshairVAO);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
  }

  createWeaponGeometry() {
    const gl = this.gl;
    const weapon = createPSXPistolGeometry();

    this.weaponVAO = gl.createVertexArray()!;
    gl.bindVertexArray(this.weaponVAO);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, weapon.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, weapon.normals!, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, weapon.colors!, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

    // Part IDs (new)
    this.weaponIdBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.weaponIdBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, weapon.ids!, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);

    // UVs (location 4)
    if (weapon.uvs) {
      const uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, weapon.uvs, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(4);
      gl.vertexAttribPointer(4, 2, gl.FLOAT, false, 0, 0);
    }

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, weapon.indices, gl.STATIC_DRAW);

    this.weaponIndexCount = weapon.indices.length;
    gl.bindVertexArray(null);
  }

  updateProjection() {
    const aspect = this.canvas.width / this.canvas.height;
    const fovRad = (this.settings.fov || 90) * Math.PI / 180;
    perspectiveMat4(this.projMatrix, fovRad, aspect, 0.1, 100);

    const weaponFov = 50 * Math.PI / 180;
    perspectiveMat4(this.weaponProjMatrix, weaponFov, aspect, 0.01, 10);
  }

  handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.gl.viewport(0, 0, w, h);
    this.updateProjection();
  }

  handleMouseMove(e: MouseEvent) {
    if (this.pointerLocked) {
      this.mouseDeltaX += e.movementX;
      this.mouseDeltaY += e.movementY;
    }
  }

  handleMouseDown(e: MouseEvent) {
    if (e.button === 0 && this.pointerLocked) {
      this.pendingShot = true;
    }
  }

  handleLockChange() {
    this.pointerLocked = document.pointerLockElement === this.canvas;
  }

  handleLockError() {
    console.warn(`[Engine ${this.instanceId}] Pointer lock denied (likely due to cooldown)`);
    if (this.onPointerLockError) {
      this.onPointerLockError();
    }
  }

  async requestPointerLock() {
    try {
      const promise = this.canvas.requestPointerLock();
      // Handle both legacy (no return) and modern (promise) behavior
      if (promise && typeof (promise as any).catch === 'function') {
        await promise;
      }
    } catch (e) {
      this.handleLockError();
    }
  }

  setupInputListeners() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('pointerlockchange', this.handleLockChange);
    document.addEventListener('pointerlockerror', this.handleLockError);
  }

  removeInputListeners() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('pointerlockchange', this.handleLockChange);
    document.removeEventListener('pointerlockerror', this.handleLockError);
  }

  start() {
    this.setupInputListeners();
    this.requestPointerLock();

    this.shots = 0;
    this.hits = 0;
    this.yaw = 0;
    this.pitch = 0;
    this.timeRemaining = this.settings.drillDuration || 30;
    this.startTime = performance.now();
    this.gameTime = 0;
    this.recoil = 0;
    this.muzzleFlash = 0;

    this.tracerSystem.reset();

    this.targetManager.reset();
    this.targetManager.spawnOptimalTargets(this.settings.targetSize);
    this.updateTargetBuffers();

    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }

    document.exitPointerLock();
    this.removeInputListeners();
  }

  loop() {
    if (!this.running) return;

    const now = performance.now();
    const dt = (now - this.lastTime) * 0.001;
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.frameId = requestAnimationFrame(this.loop);
  }

  update(dt: number) {
    this.gameTime += dt;
    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.endGame();
      return;
    }

    if (this.pointerLocked) {
      const sens = (this.settings.sensitivity || 2) * 0.001;
      this.yaw -= this.mouseDeltaX * sens;
      this.pitch -= this.mouseDeltaY * sens;
      this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));

      this.mouseDeltaX = 0;
      this.mouseDeltaY = 0;
    }

    if (this.pendingShot) {
      this.pendingShot = false;
      this.handleShot();
    }

    this.recoil *= 0.85;
    this.muzzleFlash *= 0.7;

    this.tracerSystem.update(dt);

    if (this.targetManager.activeCount < 3) {
      this.targetManager.spawnOptimalTargets(this.settings.targetSize);
      this.updateTargetBuffers(); // Need to push spawn to GPU
    }

    if (this.onStateUpdate) {
      this.onStateUpdate({
        timeRemaining: this.timeRemaining,
        shots: this.shots,
        hits: this.hits,
        accuracy: this.shots > 0 ? (this.hits / this.shots) * 100 : 0
      });
    }
  }

  handleShot() {
    this.shots++;
    this.recoil = 1.0;
    this.muzzleFlash = 1.0;

    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);

    const dirX = -sinYaw * cosPitch;
    const dirY = sinPitch;
    const dirZ = -cosYaw * cosPitch;

    const hitIndex = this.targetManager.checkHit(this.cameraPos, dirX, dirY, dirZ);

    let endX, endY, endZ;
    let isHit = false;

    if (hitIndex >= 0) {
      this.hits++;
      isHit = true;
      
      endX = this.targetManager.positions[hitIndex * 3];
      endY = this.targetManager.positions[hitIndex * 3 + 1];
      endZ = this.targetManager.positions[hitIndex * 3 + 2];

      this.targetManager.processHit(hitIndex);

      // Update GPU buffer immediately so target disappears
      const gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.targetActiveBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.targetManager.active);
    } else {
      const maxDist = 30;
      endX = this.cameraPos[0] + dirX * maxDist;
      endY = this.cameraPos[1] + dirY * maxDist;
      endZ = this.cameraPos[2] + dirZ * maxDist;

      if (endY < 0) {
        const floorT = -this.cameraPos[1] / dirY;
        endX = this.cameraPos[0] + dirX * floorT;
        endY = 0.01;
        endZ = this.cameraPos[2] + dirZ * floorT;
      }
    }

    this.tracerSystem.addTracer(
      this.cameraPos[0], this.cameraPos[1], this.cameraPos[2],
      endX, endY, endZ,
      isHit
    );
  }

  updateTargetBuffers() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.targetPosBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.targetManager.positions);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.targetScaleBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.targetManager.scales);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.targetActiveBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.targetManager.active);
  }

  endGame() {
    const finalState = {
      timeRemaining: 0,
      shots: this.shots,
      hits: this.hits,
      accuracy: this.shots > 0 ? (this.hits / this.shots) * 100 : 0
    };

    this.stop();
    if (this.onGameEnd) {
      this.onGameEnd(finalState);
    }
  }

  render() {
    const gl = this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    identityMat4(this.viewMatrix);
    rotateXMat4(this.viewMatrix, this.viewMatrix, -this.pitch);
    rotateYMat4(this.viewMatrix, this.viewMatrix, -this.yaw);
    translateMat4(this.viewMatrix, this.viewMatrix, [
      -this.cameraPos[0],
      -this.cameraPos[1],
      -this.cameraPos[2]
    ]);

    multiplyMat4(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

    gl.useProgram(this.floorProgram);
    gl.uniformMatrix4fv((this.floorProgram as any).uniforms.viewProj, false, this.viewProjMatrix);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.concreteTexture);
    gl.uniform1i((this.floorProgram as any).uniforms.texture, 0);
    gl.bindVertexArray(this.floorVAO);
    gl.drawElements(gl.TRIANGLES, this.floorIndexCount, gl.UNSIGNED_SHORT, 0);

    gl.useProgram(this.wallProgram);
    gl.uniformMatrix4fv((this.wallProgram as any).uniforms.viewProj, false, this.viewProjMatrix);

    identityMat4(this.modelMatrix);
    translateMat4(this.modelMatrix, this.modelMatrix, [0, 5, -20]);
    this.modelMatrix[0] = 15;
    this.modelMatrix[5] = 5;

    gl.uniformMatrix4fv((this.wallProgram as any).uniforms.model, false, this.modelMatrix);
    gl.bindTexture(gl.TEXTURE_2D, this.metalTexture);
    gl.uniform1i((this.wallProgram as any).uniforms.texture, 0);
    gl.bindVertexArray(this.wallVAO);
    gl.drawElements(gl.TRIANGLES, this.wallIndexCount, gl.UNSIGNED_SHORT, 0);

    if (!this.previewMode) {
      gl.useProgram(this.targetProgram);
      gl.uniformMatrix4fv((this.targetProgram as any).uniforms.viewProj, false, this.viewProjMatrix);
      gl.bindVertexArray(this.targetVAO);
      gl.drawElementsInstanced(gl.TRIANGLES, this.targetIndexCount, gl.UNSIGNED_SHORT, 0, this.targetManager.maxTargets);
    }

    this.tracerSystem.render(this.viewProjMatrix);

    gl.clear(gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.weaponProgram);

    identityMat4(this.weaponModelMatrix);
    
    // 1. POSITION - Screen relative
    translateMat4(this.weaponModelMatrix, this.weaponModelMatrix, this.weaponOffset);

    // 2. ROTATION - Local tilt
    rotateYMat4(this.weaponModelMatrix, this.weaponModelMatrix, this.weaponRotation[0]);
    rotateXMat4(this.weaponModelMatrix, this.weaponModelMatrix, this.weaponRotation[1]);
    if (this.weaponRotation[2] !== 0) {
      rotateZMat4(this.weaponModelMatrix, this.weaponModelMatrix, this.weaponRotation[2]);
    }

    // 3. SCALE
    const s = this.weaponScale;
    scaleMat4(this.weaponModelMatrix, this.weaponModelMatrix, [s, s, s]);

    gl.uniformMatrix4fv((this.weaponProgram as any).uniforms.model, false, this.weaponModelMatrix);
    gl.uniformMatrix4fv((this.weaponProgram as any).uniforms.projection, false, this.weaponProjMatrix);
    gl.uniform1f((this.weaponProgram as any).uniforms.time, this.gameTime);
    gl.uniform1f((this.weaponProgram as any).uniforms.recoil, this.recoil);
    gl.uniform1f((this.weaponProgram as any).uniforms.muzzleFlash, this.muzzleFlash);
    gl.uniform1i((this.weaponProgram as any).uniforms.useTexture, this.weaponTexture ? 1 : 0);

    if (this.weaponTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.weaponTexture);
      gl.uniform1i((this.weaponProgram as any).uniforms.texture, 0);
    }

    // DEBUG: Disable culling for weapon to fix "invisible" model issues
    gl.disable(gl.CULL_FACE);

    gl.bindVertexArray(this.weaponVAO);
    gl.drawElements(gl.TRIANGLES, this.weaponIndexCount, this.weaponIndexType, 0);

    gl.enable(gl.CULL_FACE);

    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.crosshairProgram);
    gl.uniform2f((this.crosshairProgram as any).uniforms.resolution, this.canvas.width / 2, this.canvas.height / 2);
    gl.bindVertexArray(this.crosshairVAO);
    gl.drawArrays(gl.LINES, 0, 8);
    gl.enable(gl.DEPTH_TEST);
  }

  setStateUpdateCallback(cb: (state: GameState) => void) {
    this.onStateUpdate = cb;
  }

  setGameEndCallback(cb: (state: GameState) => void) {
    this.onGameEnd = cb;
  }

  setPointerLockErrorCallback(cb: () => void) {
    this.onPointerLockError = cb;
  }

  private weaponBuffers: WebGLBuffer[] = [];

  setWeaponGeometry(geometry: any) {
    const gl = this.gl;
    console.log(`[Engine ${this.instanceId}] Setting weapon geometry: ${geometry.positions.length / 3} vertices`);
    this.createWeaponPreview(geometry);
  }

  // Refactored helper to create weapon buffers from geometry
  private createWeaponPreview(weapon: any) {
    const gl = this.gl;

    // Cleanup old weapon resources
    if (this.weaponVAO) gl.deleteVertexArray(this.weaponVAO);
    this.weaponBuffers.forEach(b => gl.deleteBuffer(b));
    this.weaponBuffers = [];

    this.weaponVAO = gl.createVertexArray()!;
    gl.bindVertexArray(this.weaponVAO);

    const createAndBindBuffer = (data: BufferSource, location: number, size: number) => {
      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
      this.weaponBuffers.push(buffer);
      return buffer;
    };

    createAndBindBuffer(weapon.positions, 0, 3);
    createAndBindBuffer(weapon.normals!, 1, 3);
    createAndBindBuffer(weapon.colors!, 2, 3);

    // Part IDs (Location 3)
    const idData = weapon.ids || new Float32Array(weapon.positions.length / 3).fill(0);
    createAndBindBuffer(idData, 3, 1);

    // UVs (Location 4)
    if (weapon.uvs) {
      createAndBindBuffer(weapon.uvs, 4, 2);
    } else {
      gl.disableVertexAttribArray(4);
    }

    this.weaponIndexCount = weapon.indices.length;
    this.weaponIndexType = weapon.indexType || 5123;

    const indexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, weapon.indices, gl.STATIC_DRAW);
    this.weaponBuffers.push(indexBuffer);

    // Texture handling
    if (weapon.texture) {
      if (this.weaponTexture) gl.deleteTexture(this.weaponTexture);
      this.weaponTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.weaponTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, weapon.texture);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    gl.bindVertexArray(null);
  }

  updateSettings(settings: EngineSettings) {
    this.settings = { ...this.settings, ...settings };
    if (this.settings.tracersEnabled !== undefined && this.tracerSystem) {
      this.tracerSystem.enabled = this.settings.tracersEnabled;
    }
    this.updateProjection();
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);

    const gl = this.gl;
    gl.deleteProgram(this.floorProgram);
    gl.deleteProgram(this.wallProgram);
    gl.deleteProgram(this.targetProgram);
    gl.deleteProgram(this.crosshairProgram);
    gl.deleteProgram(this.weaponProgram);
    gl.deleteTexture(this.concreteTexture);
    gl.deleteTexture(this.metalTexture);
    if (this.weaponTexture) gl.deleteTexture(this.weaponTexture);
  }
}
