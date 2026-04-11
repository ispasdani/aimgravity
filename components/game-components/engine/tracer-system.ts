import { TRACER_VS, TRACER_FS, IMPACT_VS, IMPACT_FS } from './shaders';

export interface TracerData {
  startX: number;
  startY: number;
  startZ: number;
  endX: number;
  endY: number;
  endZ: number;
  alpha: number;
  isHit: boolean;
}

export class TracerSystem {
  gl: WebGL2RenderingContext;

  tracerProgram!: WebGLProgram;
  impactProgram!: WebGLProgram;

  tracerVAO!: WebGLVertexArrayObject;
  tracerPosBuffer!: WebGLBuffer;
  tracerAlphaBuffer!: WebGLBuffer;

  impactVAO!: WebGLVertexArrayObject;
  impactPosBuffer!: WebGLBuffer;
  impactAlphaBuffer!: WebGLBuffer;
  impactScaleBuffer!: WebGLBuffer;

  maxTracers: number = 20;
  tracerData: TracerData[] = [];

  maxImpacts: number = 50;
  impactPositions: Float32Array;
  impactAlphas: Float32Array;
  impactScales: Float32Array;
  impactIsHit: Float32Array;
  impactIndex: number = 0;
  impactIndexCount: number = 0;

  enabled: boolean = true;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.impactPositions = new Float32Array(this.maxImpacts * 3);
    this.impactAlphas = new Float32Array(this.maxImpacts);
    this.impactScales = new Float32Array(this.maxImpacts);
    this.impactIsHit = new Float32Array(this.maxImpacts);

    this.init();
  }

  private init() {
    this.tracerProgram = this.createProgram(TRACER_VS, TRACER_FS, {
      viewProj: 'u_viewProj',
      color: 'u_color',
    });

    this.impactProgram = this.createProgram(IMPACT_VS, IMPACT_FS, {
      viewProj: 'u_viewProj',
      hitColor: 'u_hitColor',
      missColor: 'u_missColor',
      isHit: 'u_isHit',
    });

    this.createTracerGeometry();
    this.createImpactGeometry();
  }

  private createShader(type: number, source: string): WebGLShader | null {
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

  private createProgram(vsSource: string, fsSource: string, uniformsDict: Record<string, string>): any {
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

    const uniforms: any = {};
    for (const [key, name] of Object.entries(uniformsDict)) {
      uniforms[key] = gl.getUniformLocation(program, name);
    }
    (program as any).uniforms = uniforms;

    return program;
  }

  private createTracerGeometry() {
    const gl = this.gl;
    this.tracerVAO = gl.createVertexArray()!;
    gl.bindVertexArray(this.tracerVAO);

    this.tracerPosBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tracerPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.maxTracers * 2 * 3 * 4, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    this.tracerAlphaBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tracerAlphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.maxTracers * 2 * 4, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
  }

  private createImpactGeometry() {
    const gl = this.gl;

    // Build tiny sphere generator locally to avoid complex dependency imports
    const positions = [];
    const indices = [];
    const segments = 6;
    for (let r = 0; r <= segments; r++) {
      const theta = (r / segments) * Math.PI;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      for (let s = 0; s <= segments * 2; s++) {
        const phi = (s / (segments * 2)) * Math.PI * 2;
        positions.push(Math.cos(phi) * sinTheta, cosTheta, Math.sin(phi) * sinTheta);
      }
    }
    for (let r = 0; r < segments; r++) {
      for (let s = 0; s < segments * 2; s++) {
        const first = r * (segments * 2 + 1) + s;
        const second = first + segments * 2 + 1;
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }
    const spherePos = new Float32Array(positions);
    const sphereInd = new Uint16Array(indices);
    this.impactIndexCount = sphereInd.length;

    this.impactVAO = gl.createVertexArray()!;
    gl.bindVertexArray(this.impactVAO);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, spherePos, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    this.impactPosBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.impactPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.impactPositions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);

    this.impactAlphaBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.impactAlphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.impactAlphas, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1);

    this.impactScaleBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.impactScaleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.impactScales, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(3, 1);

    const indexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphereInd, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
  }

  public reset() {
    this.tracerData = [];
    for (let i = 0; i < this.maxImpacts; i++) {
      this.impactAlphas[i] = 0;
    }
  }

  public addTracer(startX: number, startY: number, startZ: number, endX: number, endY: number, endZ: number, isHit: boolean) {
    if (!this.enabled) return;

    if (this.tracerData.length < this.maxTracers) {
      this.tracerData.push({ startX, startY, startZ, endX, endY, endZ, alpha: 1.0, isHit });
    }

    const idx = this.impactIndex % this.maxImpacts;
    this.impactPositions[idx * 3] = endX;
    this.impactPositions[idx * 3 + 1] = endY;
    this.impactPositions[idx * 3 + 2] = endZ;
    this.impactAlphas[idx] = 1.0;
    this.impactScales[idx] = isHit ? 0.15 : 0.08;
    this.impactIsHit[idx] = isHit ? 1.0 : 0.0;
    this.impactIndex++;
  }

  public update(dt: number) {
    if (!this.enabled) return;

    for (let i = this.tracerData.length - 1; i >= 0; i--) {
      this.tracerData[i].alpha -= dt * 3.0; // fade out quickly
      if (this.tracerData[i].alpha <= 0) {
        this.tracerData.splice(i, 1);
      }
    }

    for (let i = 0; i < this.maxImpacts; i++) {
      if (this.impactAlphas[i] > 0) {
        this.impactAlphas[i] -= dt * 0.5; // slower fade for impacts
        if (this.impactAlphas[i] < 0) this.impactAlphas[i] = 0;
      }
    }
  }

  public render(viewProjMatrix: Float32Array) {
    if (!this.enabled) return;

    const gl = this.gl;

    // Render Tracers
    if (this.tracerData.length > 0) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);

      const posData = new Float32Array(this.tracerData.length * 6);
      const alphaData = new Float32Array(this.tracerData.length * 2);

      for (let i = 0; i < this.tracerData.length; i++) {
        const t = this.tracerData[i];
        posData[i * 6] = t.startX;
        posData[i * 6 + 1] = t.startY;
        posData[i * 6 + 2] = t.startZ;
        posData[i * 6 + 3] = t.endX;
        posData[i * 6 + 4] = t.endY;
        posData[i * 6 + 5] = t.endZ;
        alphaData[i * 2] = t.alpha * 0.3; 
        alphaData[i * 2 + 1] = t.alpha;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, this.tracerPosBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, posData);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.tracerAlphaBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, alphaData);

      gl.useProgram(this.tracerProgram);
      gl.uniformMatrix4fv((this.tracerProgram as any).uniforms.viewProj, false, viewProjMatrix);
      gl.uniform3f((this.tracerProgram as any).uniforms.color, 1.0, 0.9, 0.3); // Yellow Tracer

      gl.bindVertexArray(this.tracerVAO);
      gl.drawArrays(gl.LINES, 0, this.tracerData.length * 2);

      gl.depthMask(true);
      gl.disable(gl.BLEND);
    }

    // Render Impacts
    let hasImpacts = false;
    for (let i = 0; i < this.maxImpacts; i++) {
      if (this.impactAlphas[i] > 0) {
        hasImpacts = true;
        break;
      }
    }

    if (hasImpacts) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.impactPosBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.impactPositions);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.impactAlphaBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.impactAlphas);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.impactScaleBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.impactScales);

      gl.useProgram(this.impactProgram);
      gl.uniformMatrix4fv((this.impactProgram as any).uniforms.viewProj, false, viewProjMatrix);
      gl.uniform3f((this.impactProgram as any).uniforms.hitColor, 0.0, 1.0, 0.5); // Green Hit
      gl.uniform3f((this.impactProgram as any).uniforms.missColor, 1.0, 0.3, 0.2); // Red Miss

      gl.bindVertexArray(this.impactVAO);
      gl.drawElementsInstanced(gl.TRIANGLES, this.impactIndexCount, gl.UNSIGNED_SHORT, 0, this.maxImpacts);

      gl.disable(gl.BLEND);
    }
  }
}
