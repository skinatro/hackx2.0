'use client'
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export type WaveTileColor =
  | 'purple'
  | 'violet'
  | 'ember'
  | 'orange'
  | 'maroon'
  | 'black'
  | 'white'
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'brown';

export type WaveTileTexture =
  | 'jaali'
  | 'ikat'
  | 'bandhani'
  | 'blockprint'
  | 'chikankari';

const WAVE_TILE_COLOR_HEX: Record<WaveTileColor, string> = {
  purple: '#1A0B2E',
  violet: '#4B1D6E',
  ember: '#FF6B35',
  orange: '#FF9F1C',
  maroon: '#3D0C11',
  black: '#000000',
  white: '#FFFFFF',
  red: '#E53935',       // cherry red
  blue: '#1E88E5',      // vivid blue
  green: '#43A047',     // medium green
  yellow: '#FDD835',    // bright yellow
  brown: '#8D6E63',     // warm brown
};

type Point3D = {
  x: number;
  y: number;
  z: number;
};

type Point2D = {
  x: number;
  y: number;
};

type Cube = {
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
  cx: number;
  cy: number;
  width: number;
  height: number;
  angle: number;
  startAngle: number;
  targetAngle: number;
  animationStart: number;
  animationDuration: number;
  highlightUntil: number;
  depthBias: number;
  content?: ReactNode;
  color?: { r: number, g: number, b: number } | null;
  onClick?: () => void;
  nextLayout?: CubeDefinition[];
  frontFacePath?: Path2D;
  // Position transition animation
  startCx: number;
  startCy: number;
  startWidth: number;
  startHeight: number;
  targetCx: number;
  targetCy: number;
  targetWidth: number;
  targetHeight: number;
  posAnimStart: number;
  posAnimDuration: number;
};

type CubeDefinition = {
  row: number;      // starting row position
  col: number;      // starting column position
  rowSpan: number;  // height in cells (1 = single cell)
  colSpan: number;  // width in cells (1 = single cell)
  content?: ReactNode; // React content to display on this cube face
  color?: WaveTileColor;   // optional theme color for the cube
  texture?: WaveTileTexture; // optional Indian texture preset for this cube
  onClick?: () => void; // Optional click handler - called when this cube is clicked
  nextLayout?: CubeDefinition[]; // When clicked, smoothly transitions to this new layout
};

type ContentOverlay = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: ReactNode;
  opacity: number;
};

type WaveTilesProps = {
  className?: string;
  cubeLayout?: CubeDefinition[];
  globalColor?: string; // Optional default color for all cubes
  defaultDark?: boolean; // Start in dark mode (dark cubes, dark bg)
};

export function WaveTiles({ className = "", cubeLayout, globalColor, defaultDark = false }: WaveTilesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [contentOverlays, setContentOverlays] = useState<ContentOverlay[]>([]);
  const overlaysRef = useRef<ContentOverlay[]>([]);
  const latestCubeLayoutRef = useRef<CubeDefinition[] | undefined>(cubeLayout);
  const transitionLayoutRef = useRef<((nextLayout: CubeDefinition[] | undefined) => void) | null>(null);
  const hasSeenInitialLayoutRef = useRef(false);
  // Exposed so the patchLayout effect can mutate cubes without a full rebuild
  const patchCubesRef = useRef<((patches: Record<string, { color?: WaveTileColor; texture?: WaveTileTexture; content?: ReactNode }>) => void) | null>(null);

  latestCubeLayoutRef.current = cubeLayout;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasEl: HTMLCanvasElement = canvas;
    const drawingContext: CanvasRenderingContext2D = ctx;

    const baseCells = 24;
    const perspective = 3000;  // Larger value = less perspective distortion (better for large cuboids)
    const viewYaw = 0;
    const viewPitch = 0;
    const maxCursorYaw = Math.PI / 6;
    const maxCursorPitch = Math.PI / 8;
    const maxVisibleCubes = 900;
    const minCubeSize = 16;
    const lightDir = normalize({ x: -0.35, y: -0.45, z: 1 });
    const GRID_GAP_SIZE = 0;
    const CUSTOM_CUBE_GAP_SIZE = GRID_GAP_SIZE;

    let size = 0;
    let rows = 0;
    let cols = 0;
    let cubes: Cube[] = [];
    let raf = 0;
    let lastTime = 0;
    let bgCurrent = defaultDark ? 40 : 215;
    let bgTarget = defaultDark ? 40 : 215;
    let isLightMode = !defaultDark;
    let isPaused = false;
    let cursorX = 0;
    let cursorY = 0;
    let viewportWidth = 0;
    let viewportHeight = 0;
    let devicePixelRatio = 1;
    let lastOverlayCommit = 0;
    let committedOverlayCount = 0;
    let hasPlayedIntro = false;
    let introActive = true;
    let introStartTime = 0;
    let introOverlayRevealAt = 0;
    let introEndTime = 0;

    // Throttle React state updates for overlays while still recalculating overlay geometry every frame.
    // This keeps the canvas animation smooth by reducing React work under heavy motion.
    const OVERLAY_COMMIT_INTERVAL_MS = 66;

    // First-load construction tuning.
    // Developers: tweak these values to adjust how "assembled" the landing animation feels.
    const INTRO_CELL_MIN_OPACITY = 0.18;
    const INTRO_CELL_POP_SCALE = 0.72;
    const INTRO_CELL_POP_DURATION = 420;
    const INTRO_CELL_STAGGER = 14;
    const INTRO_OVERLAY_DELAY = 180;
    const INTRO_OVERLAY_FADE_DURATION = 360;

    // Layout transition state
    type TransitionPhase = 'idle' | 'decombining' | 'recombining';
    let transitionPhase: TransitionPhase = 'idle';
    let pendingLayout: CubeDefinition[] | null = null;
    let phaseEndTime = 0;
    let transitionOriginRow = 0;
    let transitionOriginCol = 0;

    // Layout morph timings — only changed tiles animate; identical tiles stay still.
    // A "flip" is a 180° Y-rotation. Phase 1 flips old tiles out; phase 2 flips new tiles in.
    // Together they form a seamless full-rotation coin-flip effect per changed tile.
    const LAYOUT_FLIP_STAGGER = 22;        // ms delay per Manhattan-distance unit from click
    const LAYOUT_FLIP_OUT_DURATION = 260;  // ms for the half-spin out
    const LAYOUT_FLIP_IN_DURATION = 300;  // ms for the half-spin in

    function normalize(point: Point3D): Point3D {
      const length = Math.hypot(point.x, point.y, point.z) || 1;

      return {
        x: point.x / length,
        y: point.y / length,
        z: point.z / length,
      };
    }

    function cross(a: Point3D, b: Point3D): Point3D {
      return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
      };
    }

    function subtract(a: Point3D, b: Point3D): Point3D {
      return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z,
      };
    }

    function dot(a: Point3D, b: Point3D): number {
      return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    function grayscale(value: number): string {
      const channel = Math.max(0, Math.min(255, Math.round(value)));
      return `rgb(${channel}, ${channel}, ${channel})`;
    }

    function getShadedColor(baseColor: { r: number, g: number, b: number } | null | undefined, brightness: number): string {
      if (!baseColor) return grayscale(brightness);

      const factor = brightness / 255;
      const r = Math.min(255, Math.max(0, Math.round(adjustedBase.r * factor)));
      const g = Math.min(255, Math.max(0, Math.round(adjustedBase.g * factor)));
      const b = Math.min(255, Math.max(0, Math.round(adjustedBase.b * factor)));
      return `rgb(${r}, ${g}, ${b})`;
    }

    function getTextureStrokeColor(
      baseColor: { r: number, g: number, b: number } | null | undefined,
      brightness: number,
      modeMix: number,
    ): string {
      const adjustedBase = getModeAdjustedColor(baseColor, modeMix);

      if (!adjustedBase) {
        return brightness > (120 + 80 * modeMix)
          ? `rgba(0,0,0,${mix(0.18, 0.08, modeMix).toFixed(3)})`
          : `rgba(255,255,255,${mix(0.04, 0.44, modeMix).toFixed(3)})`;
      }

      const isLightFace = brightness > (120 + 80 * modeMix);
      const target = isLightFace ? 14 : 245;
      const blend = isLightFace ? mix(0.55, 0.42, modeMix) : mix(0.35, 0.62, modeMix);
      const r = Math.round(mix(adjustedBase.r, target, blend));
      const g = Math.round(mix(adjustedBase.g, target, blend));
      const b = Math.round(mix(adjustedBase.b, target, blend));
      const alpha = isLightFace ? mix(0.28, 0.2, modeMix) : mix(0.2, 0.5, modeMix);

      return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
    }

    function interpolate2D(a: Point2D, b: Point2D, t: number): Point2D {
      return {
        x: mix(a.x, b.x, t),
        y: mix(a.y, b.y, t),
      };
    }

    function mapUvToQuad(pts: Point2D[], u: number, v: number): Point2D {
      const p0 = pts[0];
      const p1 = pts[1];
      const p2 = pts[2];
      const p3 = pts[3];
      const oneMinusU = 1 - u;
      const oneMinusV = 1 - v;

      return {
        x: p0.x * oneMinusU * oneMinusV + p1.x * u * oneMinusV + p2.x * u * v + p3.x * oneMinusU * v,
        y: p0.y * oneMinusU * oneMinusV + p1.y * u * oneMinusV + p2.y * u * v + p3.y * oneMinusU * v,
      };
    }

    function drawWarpedCurve(
      pts: Point2D[],
      cubeX: number,
      cubeY: number,
      uvAt: (t: number) => { u: number; v: number },
      steps: number,
    ) {
      const start = uvAt(0);
      const startPoint = mapUvToQuad(pts, clamp(start.u, 0, 1), clamp(start.v, 0, 1));

      drawingContext.beginPath();
      drawingContext.moveTo(cubeX + startPoint.x, cubeY + startPoint.y);

      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const uv = uvAt(t);
        const p = mapUvToQuad(pts, clamp(uv.u, 0, 1), clamp(uv.v, 0, 1));
        drawingContext.lineTo(cubeX + p.x, cubeY + p.y);
      }

      drawingContext.stroke();
    }

    function drawBaseTextureGrid(pts: Point2D[], cubeX: number, cubeY: number, divisions: number) {
      // Base woven grid
      for (let i = 1; i < divisions; i++) {
        const t = i / divisions;

        const left = interpolate2D(pts[0], pts[3], t);
        const right = interpolate2D(pts[1], pts[2], t);
        drawingContext.beginPath();
        drawingContext.moveTo(cubeX + left.x, cubeY + left.y);
        drawingContext.lineTo(cubeX + right.x, cubeY + right.y);
        drawingContext.stroke();

        const top = interpolate2D(pts[0], pts[1], t);
        const bottom = interpolate2D(pts[3], pts[2], t);
        drawingContext.beginPath();
        drawingContext.moveTo(cubeX + top.x, cubeY + top.y);
        drawingContext.lineTo(cubeX + bottom.x, cubeY + bottom.y);
        drawingContext.stroke();
      }
    }

    function drawJaaliOverlay(pts: Point2D[], cubeX: number, cubeY: number, divisions: number) {
      // Jaali-inspired diagonal weave pass (subtle secondary motif)
      const weaveBands = Math.max(2, Math.floor(divisions / 2));
      const curveSteps = 10;

      drawingContext.save();
      drawingContext.globalAlpha *= 0.72;
      drawingContext.lineWidth = Math.max(0.35, drawingContext.lineWidth * 0.78);

      for (let i = -weaveBands; i <= weaveBands; i++) {
        const offset = i / (weaveBands + 1);

        // Family A (↘)
        drawWarpedCurve(
          pts,
          cubeX,
          cubeY,
          (t) => ({ u: t, v: t + offset }),
          curveSteps,
        );

        // Family B (↙)
        drawWarpedCurve(
          pts,
          cubeX,
          cubeY,
          (t) => ({ u: t, v: 1 - t + offset }),
          curveSteps,
        );
      }

      drawingContext.restore();
    }

    function drawIkatOverlay(pts: Point2D[], cubeX: number, cubeY: number, divisions: number) {
      const bands = Math.max(3, Math.floor(divisions / 2));
      const curveSteps = 12;
      const amplitude = 0.055;

      drawingContext.save();
      drawingContext.globalAlpha *= 0.64;
      drawingContext.lineWidth = Math.max(0.35, drawingContext.lineWidth * 0.82);

      for (let i = 1; i <= bands; i++) {
        const baseV = i / (bands + 1);
        drawWarpedCurve(
          pts,
          cubeX,
          cubeY,
          (t) => ({
            u: t,
            v: baseV + Math.sin(t * Math.PI * 2 + baseV * Math.PI * 3) * amplitude,
          }),
          curveSteps,
        );

        const baseU = i / (bands + 1);
        drawWarpedCurve(
          pts,
          cubeX,
          cubeY,
          (t) => ({
            u: baseU + Math.sin(t * Math.PI * 2 + baseU * Math.PI * 2.5) * amplitude,
            v: t,
          }),
          curveSteps,
        );
      }

      drawingContext.restore();
    }

    function drawBandhaniOverlay(pts: Point2D[], cubeX: number, cubeY: number, divisions: number) {
      const dotRows = Math.max(4, Math.floor(divisions / 2));

      drawingContext.save();
      drawingContext.globalAlpha *= 0.68;
      drawingContext.fillStyle = drawingContext.strokeStyle;

      for (let r = 1; r < dotRows; r++) {
        for (let c = 1; c < dotRows; c++) {
          if ((r + c) % 2 !== 0) continue;
          const u = c / dotRows;
          const v = r / dotRows;
          const p = mapUvToQuad(pts, u, v);
          const radius = Math.max(0.4, ((pts[1].x - pts[0].x + pts[2].y - pts[1].y) / 2) / (dotRows * 10));
          drawingContext.beginPath();
          drawingContext.arc(cubeX + p.x, cubeY + p.y, Math.abs(radius), 0, Math.PI * 2);
          drawingContext.fill();
        }
      }

      drawingContext.restore();
    }

    function drawBlockprintOverlay(pts: Point2D[], cubeX: number, cubeY: number, divisions: number) {
      const motifs = Math.max(3, Math.floor(divisions / 2));
      const cell = 1 / motifs;
      const motifRadius = cell * 0.22;

      drawingContext.save();
      drawingContext.globalAlpha *= 0.62;
      drawingContext.lineWidth = Math.max(0.35, drawingContext.lineWidth * 0.84);

      for (let r = 1; r < motifs; r++) {
        for (let c = 1; c < motifs; c++) {
          const u = c * cell;
          const v = r * cell;
          const pTop = mapUvToQuad(pts, u, v - motifRadius);
          const pRight = mapUvToQuad(pts, u + motifRadius, v);
          const pBottom = mapUvToQuad(pts, u, v + motifRadius);
          const pLeft = mapUvToQuad(pts, u - motifRadius, v);

          drawingContext.beginPath();
          drawingContext.moveTo(cubeX + pTop.x, cubeY + pTop.y);
          drawingContext.lineTo(cubeX + pRight.x, cubeY + pRight.y);
          drawingContext.lineTo(cubeX + pBottom.x, cubeY + pBottom.y);
          drawingContext.lineTo(cubeX + pLeft.x, cubeY + pLeft.y);
          drawingContext.closePath();
          drawingContext.stroke();
        }
      }

      drawingContext.restore();
    }

    function drawChikankariOverlay(pts: Point2D[], cubeX: number, cubeY: number, divisions: number) {
      const stitches = Math.max(4, Math.floor(divisions / 2));
      const arm = 0.14 / stitches;

      drawingContext.save();
      drawingContext.globalAlpha *= 0.66;
      drawingContext.lineWidth = Math.max(0.35, drawingContext.lineWidth * 0.8);

      for (let r = 1; r < stitches; r++) {
        for (let c = 1; c < stitches; c++) {
          if ((r + c) % 2 !== 0) continue;
          const u = c / stitches;
          const v = r / stitches;

          const a = mapUvToQuad(pts, u - arm, v - arm);
          const b = mapUvToQuad(pts, u + arm, v + arm);
          drawingContext.beginPath();
          drawingContext.moveTo(cubeX + a.x, cubeY + a.y);
          drawingContext.lineTo(cubeX + b.x, cubeY + b.y);
          drawingContext.stroke();

          const c1 = mapUvToQuad(pts, u + arm, v - arm);
          const d = mapUvToQuad(pts, u - arm, v + arm);
          drawingContext.beginPath();
          drawingContext.moveTo(cubeX + c1.x, cubeY + c1.y);
          drawingContext.lineTo(cubeX + d.x, cubeY + d.y);
          drawingContext.stroke();
        }
      }

      drawingContext.restore();
    }

    function drawFaceTexture(
      pts: Point2D[],
      cubeX: number,
      cubeY: number,
      divisions: number,
      texture: WaveTileTexture,
    ) {
      drawBaseTextureGrid(pts, cubeX, cubeY, divisions);

      switch (texture) {
        case 'ikat':
          drawIkatOverlay(pts, cubeX, cubeY, divisions);
          return;
        case 'bandhani':
          drawBandhaniOverlay(pts, cubeX, cubeY, divisions);
          return;
        case 'blockprint':
          drawBlockprintOverlay(pts, cubeX, cubeY, divisions);
          return;
        case 'chikankari':
          drawChikankariOverlay(pts, cubeX, cubeY, divisions);
          return;
        case 'jaali':
        default:
          drawJaaliOverlay(pts, cubeX, cubeY, divisions);
      }
    }

    function easeInOut(t: number): number {
      return t * t * (3 - 2 * t);
    }

    function clamp(value: number, min: number, max: number): number {
      return Math.max(min, Math.min(max, value));
    }

    function mix(from: number, to: number, amount: number): number {
      return from + (to - from) * amount;
    }

    function hexToRgb(hex: string | undefined): { r: number, g: number, b: number } | null {
      if (!hex) return null;
      hex = hex.replace(/^#/, '');
      if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
      if (hex.length !== 6) return null;
      const num = parseInt(hex, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    function rotateY(point: Point3D, angle: number): Point3D {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      return {
        x: point.x * cos + point.z * sin,
        y: point.y,
        z: -point.x * sin + point.z * cos,
      };
    }

    function rotateX(point: Point3D, angle: number): Point3D {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      return {
        x: point.x,
        y: point.y * cos - point.z * sin,
        z: point.y * sin + point.z * cos,
      };
    }

    function project(point: Point3D): Point2D {
      const depth = perspective / (perspective + point.z);
      return {
        x: point.x * depth,
        y: point.y * depth,
      };
    }

    function drawCube(
      cube: Cube,
      cursorYaw: number,
      cursorPitch: number,
      modeMix: number,
      cubeOpacity = 1,
      contentOpacityMultiplier = 1,
    ): { overlay: ContentOverlay | null; frontFacePath: Path2D | null } {
      const halfWidth = ((cube.width - 1) / 2) / Math.SQRT2;
      const halfHeight = ((cube.height - 1) / 2) / Math.SQRT2;
      // Depth equals one cell size (so 1×1 cubes are perfect cubes)
      const halfDepth = ((size - 1) / 2) / Math.SQRT2;

      const points: Point3D[] = [
        { x: -halfWidth, y: -halfHeight, z: -halfDepth },
        { x: halfWidth, y: -halfHeight, z: -halfDepth },
        { x: halfWidth, y: halfHeight, z: -halfDepth },
        { x: -halfWidth, y: halfHeight, z: -halfDepth },
        { x: -halfWidth, y: -halfHeight, z: halfDepth },
        { x: halfWidth, y: -halfHeight, z: halfDepth },
        { x: halfWidth, y: halfHeight, z: halfDepth },
        { x: -halfWidth, y: halfHeight, z: halfDepth },
      ];

      const transformed = points.map((point) => {
        const rotated = rotateX(
          rotateY(point, viewYaw + cube.angle + cursorYaw),
          viewPitch + cursorPitch,
        );
        return {
          x: rotated.x,
          y: rotated.y,
          z: rotated.z + cube.depthBias,
        };
      });
      const projected = transformed.map(project);
      const highlight = cube.highlightUntil > performance.now() ? 20 : 0;
      const cubeCenter: Point3D = { x: 0, y: 0, z: cube.depthBias };

      const ambient = mix(0.14, 0.14, modeMix);
      const diffuse = 1 - ambient;
      // Only colored custom cubes get the neon brightness boost in dark mode (modeMix=0).
      // Plain background tiles keep their natural darkness.
      const minBrightness = cube.color ? mix(185, 6, modeMix) : 6;

      const faces = [
        { idx: [0, 1, 2, 3], lightBase: 255 - 42, darkBase: 42, isBack: true },  // back
        { idx: [4, 5, 6, 7], lightBase: 255 - 8, darkBase: 8, isBack: false, isFront: true }, // front
        { idx: [0, 1, 5, 4], lightBase: 255 - 18, darkBase: 18, isBack: false }, // bottom
        { idx: [2, 3, 7, 6], lightBase: 255 - 12, darkBase: 12, isBack: false }, // top
        { idx: [1, 2, 6, 5], lightBase: 255 - 24, darkBase: 24, isBack: false }, // right
        { idx: [0, 3, 7, 4], lightBase: 255 - 10, darkBase: 10, isBack: false }, // left
      ].map((face) => ({
        ...face,
        base: mix(face.darkBase, face.lightBase, modeMix),
        center: {
          x: face.idx.reduce((sum, index) => sum + transformed[index].x, 0) / face.idx.length,
          y: face.idx.reduce((sum, index) => sum + transformed[index].y, 0) / face.idx.length,
          z: face.idx.reduce((sum, index) => sum + transformed[index].z, 0) / face.idx.length,
        },
        depth: face.idx.reduce((sum, index) => sum + transformed[index].z, 0) / face.idx.length,
        normal: normalize(
          cross(
            subtract(transformed[face.idx[1]], transformed[face.idx[0]]),
            subtract(transformed[face.idx[2]], transformed[face.idx[0]]),
          ),
        ),
      }));

      faces.sort((a, b) => a.depth - b.depth);

      let contentOverlay: ContentOverlay | null = null;
      let frontFacePath: Path2D | null = null;

      for (const face of faces) {
        const outward = subtract(face.center, cubeCenter);
        const orientedNormal = dot(face.normal, outward) < 0
          ? { x: -face.normal.x, y: -face.normal.y, z: -face.normal.z }
          : face.normal;

        if (orientedNormal.z <= 0) continue;

        const pts = face.idx.map((i) => projected[i]);

        const tracePath = () => {
          drawingContext.beginPath();
          drawingContext.moveTo(cube.cx + pts[0].x, cube.cy + pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            drawingContext.lineTo(cube.cx + pts[i].x, cube.cy + pts[i].y);
          }
          drawingContext.closePath();
        };

        const light = Math.max(0, dot(orientedNormal, lightDir));
        const brightness = Math.round(Math.max(minBrightness, face.isBack
          ? face.base
          : face.base * (ambient + light * diffuse) + highlight));

        drawingContext.save();
        drawingContext.globalAlpha = cubeOpacity;

        tracePath();
        drawingContext.fillStyle = getShadedColor(cube.color, brightness, modeMix);
        drawingContext.fill();

        drawingContext.save();
        tracePath();
        drawingContext.clip();
        const avgSize = (cube.width + cube.height) / 2;
        const divisions = Math.max(3, Math.round(avgSize / 7));
        drawingContext.lineWidth = 0.5;
        drawingContext.strokeStyle = getTextureStrokeColor(cube.color, brightness, modeMix);
        drawFaceTexture(pts, cube.cx, cube.cy, divisions, cube.texture || 'jaali');
        drawingContext.restore();

        tracePath();
        drawingContext.strokeStyle = (modeMix > 0.5 ? brightness > 230 : brightness < 30)
          ? `rgba(0,0,0,${mix(0.35, 0.15, modeMix).toFixed(3)})`
          : `rgba(255,255,255,${mix(0.45, 0.75, modeMix).toFixed(3)})`;
        drawingContext.lineWidth = 1;
        drawingContext.stroke();
        drawingContext.restore();

        // Store front OR back face path for click detection (needed for both light & dark mode)
        if ((face.isFront || face.isBack) && orientedNormal.z > 0.3) {
          const path = new Path2D();
          path.moveTo(cube.cx + pts[0].x, cube.cy + pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            path.lineTo(cube.cx + pts[i].x, cube.cy + pts[i].y);
          }
          path.closePath();
          frontFacePath = path;
        }

        // Calculate content overlay for the front OR back face if this cube has content
        if (cube.content && (face.isFront || face.isBack) && orientedNormal.z > 0.3) {
          const absolutePts = pts.map(p => ({ x: cube.cx + p.x, y: cube.cy + p.y }));
          const minX = Math.min(...absolutePts.map(p => p.x));
          const maxX = Math.max(...absolutePts.map(p => p.x));
          const minY = Math.min(...absolutePts.map(p => p.y));
          const maxY = Math.max(...absolutePts.map(p => p.y));

          contentOverlay = {
            id: `${cube.row}-${cube.col}`,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            content: cube.content,
            opacity: Math.min(1, orientedNormal.z * 1.5) * contentOpacityMultiplier,
          };
        }
      }

      return { overlay: contentOverlay, frontFacePath };
    }

    function buildGrid() {
      cubes = [];

      const parsedGlobalColor = colorToRgb(globalColor);
      const parsedGlobalTexture: WaveTileTexture = globalTexture || 'jaali';
      // Preserve the current mode when rebuilding (e.g. after resize).
      // In light mode all cubes are light except the trigger cube, and vice versa in dark mode.
      const defaultAngle = isLightMode ? 0 : Math.PI;
      const triggerAngle = isLightMode ? Math.PI : 0;

      // Track which grid cells are covered by custom cubes
      const coveredCells = new Set<string>();

      if (cubeLayout && cubeLayout.length > 0) {
        cubeLayout.forEach(def => {
          // Mark all cells covered by this custom cube
          for (let r = def.row; r < def.row + def.rowSpan; r++) {
            for (let c = def.col; c < def.col + def.colSpan; c++) {
              coveredCells.add(`${r},${c}`);
            }
          }
        });
      }

      // Create the default 1×1 grid, excluding covered cells
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Skip this cell if it's covered by a custom cube
          if (coveredCells.has(`${row},${col}`)) continue;

          const _cx1 = col * size + size / 2;
          const _cy1 = row * size + size / 2;
          cubes.push({
            row,
            col,
            rowSpan: 1,
            colSpan: 1,
            cx: _cx1,
            cy: _cy1,
            width: size - GRID_GAP_SIZE,
            height: size - GRID_GAP_SIZE,
            angle: defaultAngle,
            startAngle: defaultAngle,
            targetAngle: defaultAngle,
            animationStart: 0,
            animationDuration: 0,
            highlightUntil: 0,
            depthBias: (row / Math.max(1, rows - 1) - 0.5) * 10 + (col / Math.max(1, cols - 1) - 0.5) * 10,
            color: parsedGlobalColor,
            texture: parsedGlobalTexture,
            frontFacePath: undefined,
            startCx: _cx1, startCy: _cy1, startWidth: size - GRID_GAP_SIZE, startHeight: size - GRID_GAP_SIZE,
            targetCx: _cx1, targetCy: _cy1, targetWidth: size - GRID_GAP_SIZE, targetHeight: size - GRID_GAP_SIZE,
            posAnimStart: 0, posAnimDuration: 0,
          });
        }
      }

      // Add custom cubes
      if (layout && layout.length > 0) {
        layout.forEach((def) => {
          const cubeWidth = def.colSpan * size - CUSTOM_CUBE_GAP_SIZE;
          const cubeHeight = def.rowSpan * size - CUSTOM_CUBE_GAP_SIZE;
          const centerX = def.col * size + def.colSpan * size / 2;
          const centerY = def.row * size + def.rowSpan * size / 2;

          cubes.push({
            row: def.row,
            col: def.col,
            rowSpan: def.rowSpan,
            colSpan: def.colSpan,
            cx: centerX,
            cy: centerY,
            width: cubeWidth,
            height: cubeHeight,
            angle: defaultAngle,
            startAngle: defaultAngle,
            targetAngle: defaultAngle,
            animationStart: 0,
            animationDuration: 0,
            highlightUntil: 0,
            depthBias: (def.row / Math.max(1, rows - 1) - 0.5) * 10 + (def.col / Math.max(1, cols - 1) - 0.5) * 10,
            content: def.content,
            color: def.color ? colorToRgb(def.color) : parsedGlobalColor,
            texture: def.texture || parsedGlobalTexture,
            onClick: def.onClick,
            nextLayout: def.nextLayout,
            frontFacePath: undefined,
            startCx: centerX, startCy: centerY, startWidth: cubeWidth, startHeight: cubeHeight, targetCx: centerX, targetCy: centerY, targetWidth: cubeWidth, targetHeight: cubeHeight,
            posAnimStart: 0, posAnimDuration: 0,
          });
        });
      }

      // Find the top-right cube (trigger)
      // It's the cube at row 0 with the highest right edge
      let triggerCube: Cube | null = null;
      let maxRight = -1;

      for (const cube of cubes) {
        // Only consider cubes touching row 0
        if (cube.row === 0) {
          const rightEdge = cube.col + cube.colSpan;
          if (rightEdge > maxRight) {
            maxRight = rightEdge;
            triggerCube = cube;
          }
        }
      }

      // Keep trigger cube opposite to the rest, matching current mode.
      if (triggerCube) {
        triggerCube.angle = triggerAngle;
        triggerCube.startAngle = triggerAngle;
        triggerCube.targetAngle = triggerAngle;
      }
    }

    function resizeCanvas() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      viewportWidth = width;
      viewportHeight = height;
      cursorX = width / 2;
      cursorY = height / 2;

      // HiDPI/Retina support: render at physical pixels while keeping math in CSS pixels.
      devicePixelRatio = Math.max(1, window.devicePixelRatio || 1);
      canvasEl.width = Math.floor(width * devicePixelRatio);
      canvasEl.height = Math.floor(height * devicePixelRatio);
      canvasEl.style.width = `${width}px`;
      canvasEl.style.height = `${height}px`;
      drawingContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      size = Math.max(minCubeSize, Math.floor(Math.min(width, height) / baseCells));

      while (Math.ceil(width / size) * Math.ceil(height / size) > maxVisibleCubes) {
        size += 1;
      }

      cols = Math.max(1, Math.ceil(width / size));
      rows = Math.max(1, Math.ceil(height / size));

      buildGrid();

      // Play construction intro only once on first load; resizing keeps the current static mode.
      if (!hasPlayedIntro) {
        startIntroAnimation();
      }
    }

    // ── LAYOUT TRANSITION HELPERS ─────────────────────────────────────────

    // Layout morph timings — only changed tiles animate; identical tiles stay still.
    // The animation shrinks old differing tiles to 0, then grows new differing tiles from 0.
    const LAYOUT_SHRINK_STAGGER = 22;        // ms delay per Manhattan-distance unit from click
    const LAYOUT_SHRINK_DURATION = 260;      // ms for the tile to shrink away
    const LAYOUT_GROW_DURATION = 300;       // ms for the new tile to grow in

    /**
     * Returns true when a cube will look different after transitioning to `newLayout`.
     * Unchanged cubes (same row/col/rowSpan/colSpan) are skipped entirely — they stay
     * perfectly still while the changing tiles transition.
     */
    function cubeWillChange(cube: Cube, newLayout: CubeDefinition[]): boolean {
      // Exact structural match → nothing to animate
      if (newLayout.some(d =>
        d.row === cube.row && d.col === cube.col &&
        d.rowSpan === cube.rowSpan && d.colSpan === cube.colSpan
      )) return false;

      // Multi-cell tiles that don't match always change
      if (cube.rowSpan > 1 || cube.colSpan > 1) return true;

      // 1×1 background cell: changes only if it gets absorbed into a new merged tile
      return newLayout.some(d =>
        cube.row >= d.row && cube.row < d.row + d.rowSpan &&
        cube.col >= d.col && cube.col < d.col + d.colSpan
      );
    }

    /** Called when a cube with `nextLayout` is clicked.
     *  Only tiles that differ between old and new layout shrink away. */
    function startLayoutTransition(newLayout: CubeDefinition[], sourceCube: Cube) {
      if (transitionPhase !== 'idle') return; // Ignore clicks while transitioning
      transitionPhase = 'decombining';
      pendingLayout = newLayout;
      const now = performance.now();
      transitionOriginRow = sourceCube.row + sourceCube.rowSpan / 2;
      transitionOriginCol = sourceCube.col + sourceCube.colSpan / 2;

      let maxDistance = 0;

      for (const cube of cubes) {
        // Unchanged cubes: skip all animation
        if (!cubeWillChange(cube, newLayout)) continue;

        const cubeRow = cube.row + cube.rowSpan / 2;
        const cubeCol = cube.col + cube.colSpan / 2;
        const distance = Math.abs(cubeRow - transitionOriginRow) + Math.abs(cubeCol - transitionOriginCol);
        maxDistance = Math.max(maxDistance, distance);

        // Shrink the tile down to almost zero safely
        cube.startCx = cube.cx;
        cube.startCy = cube.cy;
        cube.startWidth = cube.width;
        cube.startHeight = cube.height;
        cube.targetCx = cube.cx;
        cube.targetCy = cube.cy;
        cube.targetWidth = 2; // don't go exactly to 0 to avoid negative geometry flips
        cube.targetHeight = 2;
        cube.posAnimStart = now + distance * LAYOUT_SHRINK_STAGGER;
        cube.posAnimDuration = LAYOUT_SHRINK_DURATION;
      }

      phaseEndTime = now + maxDistance * LAYOUT_SHRINK_STAGGER + LAYOUT_SHRINK_DURATION + 20;
    }

    function colorsEqual(
      a: { r: number, g: number, b: number } | null | undefined,
      b: { r: number, g: number, b: number } | null | undefined,
    ): boolean {
      const left = a ?? null;
      const right = b ?? null;
      if (!left && !right) return true;
      if (!left || !right) return false;
      return left.r === right.r && left.g === right.g && left.b === right.b;
    }

    function sameStructure(def: CubeDefinition, cube: Cube): boolean {
      return (
        def.row === cube.row &&
        def.col === cube.col &&
        def.rowSpan === cube.rowSpan &&
        def.colSpan === cube.colSpan
      );
    }

    function sameVisual(def: CubeDefinition, cube: Cube): boolean {
      return (
        colorsEqual(def.color ? colorToRgb(def.color) : null, cube.color) &&
        (def.texture || 'jaali') === (cube.texture || 'jaali') &&
        def.content === cube.content
      );
    }

    /** Swap to the target layout. Unchanged tiles are transferred as-is (no animation).
     *  New/changed tiles grow in from scale 0. 
     *  Importantly, newly exposed 1x1 background cells revert to default grey color! */
    function applyNewLayoutCubes() {
      if (!pendingLayout) return;
      const now = performance.now();
      const parsedGlobalColor = colorToRgb(globalColor);
      const parsedGlobalTexture: WaveTileTexture = globalTexture || 'jaali';
      const defaultAngle = isLightMode ? 0 : Math.PI;
      const nextLayout = pendingLayout;

      // Map every cell in the old layout to its cube so we can inherit properties.
      const previousByCell = new Map<string, Cube>();
      for (const existingCube of cubes) {
        for (let r = existingCube.row; r < existingCube.row + existingCube.rowSpan; r++) {
          for (let c = existingCube.col; c < existingCube.col + existingCube.colSpan; c++) {
            previousByCell.set(`${r},${c}`, existingCube);
          }
        }
      }

      // Cells occupied by custom definitions in the new layout
      const coveredCells = new Set<string>();
      nextLayout.forEach(def => {
        for (let r = def.row; r < def.row + def.rowSpan; r++) {
          for (let c = def.col; c < def.col + def.colSpan; c++) {
            coveredCells.add(`${r},${c}`);
          }
        }
      });

      const newCubes: Cube[] = [];
      let maxDistance = 0;

      // ── Background 1×1 cells ─────────────────────────────────────────────
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (coveredCells.has(`${row},${col}`)) continue;

          const previous = previousByCell.get(`${row},${col}`);
          const centerX = col * size + size / 2;
          const centerY = row * size + size / 2;

          // Unchanged 1×1 cells are lifted straight from the old array, skipping all animation.
          if (previous && previous.rowSpan === 1 && previous.colSpan === 1 &&
            !nextLayout.some(d =>
              row >= d.row && row < d.row + d.rowSpan &&
              col >= d.col && col < d.col + d.colSpan
            )) {
            newCubes.push({ ...previous });
            continue;
          }

          // This cell was previously covered by an old merged tile (which shrank away).
          // Grow it in as a regular background cell.
          const distance = Math.abs(row + 0.5 - transitionOriginRow) + Math.abs(col + 0.5 - transitionOriginCol);
          maxDistance = Math.max(maxDistance, distance);

          // We explicitly reset the color to the global default so we DO NOT bleed the old merged tile's color.
          newCubes.push({
            row, col, rowSpan: 1, colSpan: 1,
            cx: centerX, cy: centerY, width: 2, height: 2,
            angle: defaultAngle, startAngle: defaultAngle, targetAngle: defaultAngle,
            animationStart: 0, animationDuration: 0, highlightUntil: 0,
            depthBias: (row / Math.max(1, rows - 1) - 0.5) * 10 + (col / Math.max(1, cols - 1) - 0.5) * 10,
            color: parsedGlobalColor, // FIX: never inherit previous color for a newly exposed grey sub-cell
            texture: parsedGlobalTexture,
            frontFacePath: undefined,
            startCx: centerX, startCy: centerY, startWidth: 2, startHeight: 2,
            targetCx: centerX, targetCy: centerY, targetWidth: size - GRID_GAP_SIZE, targetHeight: size - GRID_GAP_SIZE,
            posAnimStart: now + distance * LAYOUT_SHRINK_STAGGER,
            posAnimDuration: LAYOUT_GROW_DURATION,
          });
        }
      }

      // ── Custom / merged tiles ─────────────────────────────────────────────
      nextLayout.forEach(def => {
        const targetCx = def.col * size + def.colSpan * size / 2;
        const targetCy = def.row * size + def.rowSpan * size / 2;
        const targetW = def.colSpan * size;
        const targetH = def.rowSpan * size;
        const existing = previousByCell.get(`${def.row},${def.col}`);

        // Exact structural match → transfer unchanged (no animation).
        const isUnchanged = cubes.some(c =>
          c.row === def.row && c.col === def.col &&
          c.rowSpan === def.rowSpan && c.colSpan === def.colSpan
        );
        if (isUnchanged && existing) {
          newCubes.push({
            ...existing,
            content: def.content,
            color: def.color ? colorToRgb(def.color) : existing.color,
            texture: def.texture || existing.texture,
            onClick: def.onClick,
            nextLayout: def.nextLayout,
          });
          return;
        }

        // Changed tile: grow from 0 size up to full target size.
        const normalAngle = (((existing?.angle ?? defaultAngle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const distance = Math.abs(def.row + def.rowSpan / 2 - transitionOriginRow) +
          Math.abs(def.col + def.colSpan / 2 - transitionOriginCol);
        maxDistance = Math.max(maxDistance, distance);

        newCubes.push({
          row: def.row, col: def.col, rowSpan: def.rowSpan, colSpan: def.colSpan,
          cx: targetCx, cy: targetCy, width: 2, height: 2,
          angle: defaultAngle, startAngle: normalAngle, targetAngle: defaultAngle,
          animationStart: 0, animationDuration: 0, highlightUntil: 0,
          depthBias: (def.row / Math.max(1, rows - 1) - 0.5) * 10 + (def.col / Math.max(1, cols - 1) - 0.5) * 10,
          content: def.content,
          color: def.color ? colorToRgb(def.color) : parsedGlobalColor,
          texture: def.texture || parsedGlobalTexture,
          onClick: def.onClick,
          nextLayout: def.nextLayout,
          frontFacePath: undefined,
          startCx: targetCx, startCy: targetCy, startWidth: 2, startHeight: 2,
          targetCx: targetCx, targetCy: targetCy, targetWidth: targetW, targetHeight: targetH,
          posAnimStart: now + distance * LAYOUT_SHRINK_STAGGER,
          posAnimDuration: LAYOUT_GROW_DURATION,
        });
      });

      cubes = newCubes;
      phaseEndTime = now + maxDistance * LAYOUT_SHRINK_STAGGER + LAYOUT_GROW_DURATION + 20;
    }

    function introDelayForCube(cube: Cube): number {
      // Top-left wave keeps the reveal directional and deterministic.
      return (cube.row + cube.col) * INTRO_CELL_STAGGER;
    }

    function applyIntroPopAnimation(now: number): number {
      let maxDelay = 0;

      for (const cube of cubes) {
        const delay = introDelayForCube(cube);
        maxDelay = Math.max(maxDelay, delay);

        // Small random angular offset gives a subtle "panel alignment" feel.
        const angleOffset = (Math.random() - 0.5) * 0.34;
        const finalAngle = cube.angle;
        cube.angle = finalAngle + angleOffset;
        cube.startAngle = cube.angle;
        cube.targetAngle = finalAngle;
        cube.animationStart = now + delay;
        cube.animationDuration = 340;

        cube.startCx = cube.cx;
        cube.startCy = cube.cy;
        cube.targetCx = cube.cx;
        cube.targetCy = cube.cy;

        const finalWidth = cube.width;
        const finalHeight = cube.height;
        cube.startWidth = finalWidth * INTRO_CELL_POP_SCALE;
        cube.startHeight = finalHeight * INTRO_CELL_POP_SCALE;
        cube.targetWidth = finalWidth;
        cube.targetHeight = finalHeight;
        cube.width = cube.startWidth;
        cube.height = cube.startHeight;
        cube.posAnimStart = now + delay;
        cube.posAnimDuration = INTRO_CELL_POP_DURATION;
      }

      return maxDelay;
    }

    function startIntroAnimation() {
      hasPlayedIntro = true;
      introActive = true;
      const now = performance.now();
      introStartTime = now;

      // Keep intro on the current built layout only.
      // Do not decompose merged cuboids into individual cells during first-load animation.
      transitionPhase = 'idle';
      pendingLayout = null;

      const maxDelay = applyIntroPopAnimation(now);
      introOverlayRevealAt = now + maxDelay + INTRO_OVERLAY_DELAY;
      introEndTime = introOverlayRevealAt + INTRO_OVERLAY_FADE_DURATION + 220;
    }

    // ─────────────────────────────────────────────────────────────────────────

    function render(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      const delta = Math.min(0.05, (timestamp - lastTime) / 1000);
      lastTime = timestamp;

      const fadeAmount = 1 - Math.exp(-delta * 1.5);
      bgCurrent = mix(bgCurrent, bgTarget, fadeAmount);
      drawingContext.fillStyle = grayscale(bgCurrent);
      drawingContext.fillRect(0, 0, viewportWidth, viewportHeight);

      const halfWidth = Math.max(1, viewportWidth / 2);
      const halfHeight = Math.max(1, viewportHeight / 2);
      const contentRevealMix = introActive
        ? clamp((timestamp - introOverlayRevealAt) / INTRO_OVERLAY_FADE_DURATION, 0, 1)
        : 1;

      const newOverlays: ContentOverlay[] = [];

      for (const cube of cubes) {
        // ── Angle animation ──
        if (timestamp >= cube.animationStart) {
          const elapsed = timestamp - cube.animationStart;
          const progress = Math.min(1, elapsed / Math.max(1, cube.animationDuration));
          const eased = easeInOut(progress);
          cube.angle = cube.startAngle + (cube.targetAngle - cube.startAngle) * eased;
        }

        // ── Position / size animation ──
        if (cube.posAnimDuration > 0) {
          const elapsed = timestamp - cube.posAnimStart;
          const progress = clamp(elapsed / cube.posAnimDuration, 0, 1);
          const eased = easeInOut(progress);
          cube.cx = cube.startCx + (cube.targetCx - cube.startCx) * eased;
          cube.cy = cube.startCy + (cube.targetCy - cube.startCy) * eased;
          cube.width = cube.startWidth + (cube.targetWidth - cube.startWidth) * eased;
          cube.height = cube.startHeight + (cube.targetHeight - cube.startHeight) * eased;
        }

        const nx = clamp((cursorX - cube.cx) / halfWidth, -1, 1);
        const ny = clamp((cursorY - cube.cy) / halfHeight, -1, 1);
        // Scale down rotation sensitivity for larger cubes (using sqrt for gentler damping)
        const avgCubeSize = (cube.width + cube.height) / 2;
        const sizeDamping = Math.sqrt(size / Math.max(size, avgCubeSize));
        const cursorYaw = nx * maxCursorYaw * sizeDamping;
        const cursorPitch = -ny * maxCursorPitch * sizeDamping;

        const cubeModeMix = (Math.cos(cube.angle) + 1) / 2;
        const introDelay = introDelayForCube(cube);
        const introProgress = introActive
          ? clamp((timestamp - (introStartTime + introDelay)) / INTRO_CELL_POP_DURATION, 0, 1)
          : 1;
        const cubeOpacity = introActive
          ? mix(INTRO_CELL_MIN_OPACITY, 1, easeInOut(introProgress))
          : 1;

        // During a split transition, override opacity for the target cube
        let effectiveCubeOpacity = cubeOpacity;
        let effectiveContentMix = contentRevealMix;
        if (splitInfo && cube.row === splitInfo.targetRow && cube.col === splitInfo.targetCol) {
          effectiveCubeOpacity *= splitInfo.mainCubeOpacity;
          effectiveContentMix = splitInfo.contentOpacity;
        }
        const { overlay, frontFacePath } = drawCube(
          cube,
          cursorYaw,
          cursorPitch,
          cubeModeMix,
          effectiveCubeOpacity,
          effectiveContentMix,
        );
        if (overlay) {
          newOverlays.push(overlay);
        }
        cube.frontFacePath = frontFacePath || undefined;
      }

      // ── Split / page-swap animation state machine ──────────────────────────
      if (splitInfo) {
        const si = splitInfo;
        const elapsed = timestamp - si.phaseStart;

        // ── Update all sub-cube physics every frame ──
        for (const sc of si.subCubes) {
          if (sc.posAnimDuration > 0) {
            const e = timestamp - sc.posAnimStart;
            const t = easeInOut(clamp(e / sc.posAnimDuration, 0, 1));
            sc.cx = sc.startCx + (sc.targetCx - sc.startCx) * t;
            sc.cy = sc.startCy + (sc.targetCy - sc.startCy) * t;
            sc.width = sc.startWidth + (sc.targetWidth - sc.startWidth) * t;
            sc.height = sc.startHeight + (sc.targetHeight - sc.startHeight) * t;
          }
          if (sc.animationDuration > 0) {
            const e = timestamp - sc.animationStart;
            sc.angle = sc.startAngle + (sc.targetAngle - sc.startAngle) * easeInOut(clamp(e / sc.animationDuration, 0, 1));
          }
        }

        // ── Draw sub-cubes (no content overlay on them) ──
        for (const sc of si.subCubes) {
          const nx2 = clamp((cursorX - sc.cx) / halfWidth, -1, 1);
          const ny2 = clamp((cursorY - sc.cy) / halfHeight, -1, 1);
          const scMix = (Math.cos(sc.angle) + 1) / 2;
          drawCube(sc, nx2 * maxCursorYaw, -ny2 * maxCursorPitch, scMix, 1, 0);
        }

        // ── Phase transitions ──────────────────────────────────────────────
        if (si.phase === 'fadeContent') {
          // Fade content overlay to zero while keeping the cuboid visible
          si.contentOpacity = Math.max(0, 1 - elapsed / SPLIT_FADE_CONTENT_MS);
          si.mainCubeOpacity = 1;
          if (elapsed >= SPLIT_FADE_CONTENT_MS) {
            si.phase = 'split';
            si.phaseStart = timestamp;
            const mc = cubes.find(c => c.row === si.targetRow && c.col === si.targetCol);
            if (mc) si.subCubes = buildSplitCubes(mc, timestamp);
          }

        } else if (si.phase === 'split') {
          // Main cuboid fades out as unit cells pop in at grid positions
          si.mainCubeOpacity = Math.max(0, 1 - elapsed / 180);
          si.contentOpacity = 0;
          // Phase ends when the last (outermost) cell has fully grown
          const maxDistInt = (si.nRows - 1) + (si.nCols - 1);
          const phaseLen = maxDistInt * SPLIT_SPLIT_STAGGER + SPLIT_SPLIT_DURATION + 60;
          if (elapsed >= phaseLen) {
            si.phase = 'rotate';
            si.phaseStart = timestamp;
            si.mainCubeOpacity = 0;
            // Diagonal wave: stagger = (relRow + relCol) * SPLIT_ROTATE_STAGGER
            const baseRow = si.targetRow;
            const baseCol = si.targetCol;
            si.colorSwapped = Array(si.nRows * si.nCols).fill(false);
            si.subCubes.forEach((sc, i) => {
              const relR = sc.row - baseRow;
              const relC = sc.col - baseCol;
              const diagStep = relR + relC; // 0 … (nRows-1 + nCols-1)
              // Checkerboard pattern: alternate rotation direction
              const isEvenCell = (relR + relC) % 2 === 0;
              const rotationDirection = isEvenCell ? 1 : -1;
              sc.angle = 0; sc.startAngle = 0; sc.targetAngle = Math.PI * 2 * rotationDirection;
              sc.animationStart = timestamp + diagStep * SPLIT_ROTATE_STAGGER;
              sc.animationDuration = SPLIT_ROTATE_DURATION;
              si.colorSwapped[i] = false;
            });
          }

        } else if (si.phase === 'rotate') {
          si.mainCubeOpacity = 0;
          si.contentOpacity = 0;
          // Swap color at rotation midpoint
          si.subCubes.forEach((sc, i) => {
            if (!si.colorSwapped[i] && sc.animationDuration > 0) {
              const prog = (timestamp - sc.animationStart) / sc.animationDuration;
              if (prog >= 0.5) {
                sc.color = si.pendingColor;
                sc.texture = si.pendingTexture;
                si.colorSwapped[i] = true;
              }
            }
          });
          const maxDiag = (si.nRows - 1) + (si.nCols - 1);
          const phaseLen = maxDiag * SPLIT_ROTATE_STAGGER + SPLIT_ROTATE_DURATION + 60;
          if (elapsed >= phaseLen) {
            si.phase = 'implode';
            si.phaseStart = timestamp;
            // Ensure all cubes are on new color
            si.subCubes.forEach(sc => { sc.color = si.pendingColor; sc.texture = si.pendingTexture; sc.angle = 0; });
            // Schedule main cube to regrow after a short delay
            const mc = cubes.find(c => c.row === si.targetRow && c.col === si.targetCol);
            if (mc) {
              mc.color = si.pendingColor;
              mc.texture = si.pendingTexture;
              mc.content = si.pendingContent;
              mc.width = 2; mc.height = 2;
              mc.startWidth = 2; mc.startHeight = 2;
              mc.targetWidth = mc.colSpan * size - CUSTOM_CUBE_GAP_SIZE;
              mc.targetHeight = mc.rowSpan * size - CUSTOM_CUBE_GAP_SIZE;
              mc.posAnimStart = timestamp + SPLIT_REGROW_DELAY;
              mc.posAnimDuration = SPLIT_REGROW_DURATION;
              si.mainCubeOpacity = 1;
            }
            // Each sub-cube: scatter back outward then vanish, inner cells leave LAST
            // (reverse of the ripple so outer cells disappear first → focus pulls inward)
            const baseRow = si.targetRow;
            const baseCol = si.targetCol;
            const maxDiag2 = (si.nRows - 1) + (si.nCols - 1);
            si.subCubes.forEach(sc => {
              const relR = sc.row - baseRow;
              const relC = sc.col - baseCol;
              const diagStep = relR + relC;
              // Outer cells implode first (large diagStep = early departure)
              const delay = (maxDiag2 - diagStep) * SPLIT_IMPLODE_STAGGER;
              sc.startCx = sc.targetCx; sc.startCy = sc.targetCy;
              sc.startWidth = sc.width; sc.startHeight = sc.height;
              // Fly toward the center of the big cube
              const mc2 = cubes.find(c => c.row === si.targetRow && c.col === si.targetCol);
              sc.targetCx = mc2?.cx ?? sc.targetCx;
              sc.targetCy = mc2?.cy ?? sc.targetCy;
              sc.targetWidth = 2;
              sc.targetHeight = 2;
              sc.posAnimStart = timestamp + delay;
              sc.posAnimDuration = SPLIT_IMPLODE_DURATION;
            });
          }

        } else if (si.phase === 'implode') {
          si.contentOpacity = 0;
          const maxDiag2 = (si.nRows - 1) + (si.nCols - 1);
          const phaseLen = maxDiag2 * SPLIT_IMPLODE_STAGGER + SPLIT_IMPLODE_DURATION + 60;
          if (elapsed >= phaseLen) {
            si.subCubes = [];
            si.phase = 'fadeIn';
            si.phaseStart = timestamp;
          }

        } else if (si.phase === 'fadeIn') {
          si.mainCubeOpacity = 1;
          si.contentOpacity = Math.min(1, elapsed / SPLIT_FADEIN_MS);
          if (elapsed >= SPLIT_FADEIN_MS) {
            splitInfo = null;
          }
        }
      }
      // ─────────────────────────────────────────────────────────────────────────

      // ── Transition phase state machine ──
      if (transitionPhase === 'decombining' && timestamp >= phaseEndTime) {
        applyNewLayoutCubes();
        transitionPhase = 'recombining';
      } else if (transitionPhase === 'recombining' && timestamp >= phaseEndTime) {
        transitionPhase = 'idle';
        pendingLayout = null;
      }

      // End intro only after structural transitions have completed.
      if (introActive && transitionPhase === 'idle' && timestamp >= introEndTime) {
        introActive = false;
      }

      // Update overlays ref and trigger state update if changed
      const overlaysChanged =
        newOverlays.length !== overlaysRef.current.length ||
        newOverlays.some((overlay, i) => {
          const prev = overlaysRef.current[i];
          return !prev ||
            Math.abs(overlay.x - prev.x) > 0.5 ||
            Math.abs(overlay.y - prev.y) > 0.5 ||
            Math.abs(overlay.width - prev.width) > 0.5 ||
            Math.abs(overlay.height - prev.height) > 0.5 ||
            Math.abs(overlay.opacity - prev.opacity) > 0.01;
        });

      if (overlaysChanged) {
        overlaysRef.current = newOverlays;

        const shouldCommitNow =
          newOverlays.length !== committedOverlayCount ||
          timestamp - lastOverlayCommit >= OVERLAY_COMMIT_INTERVAL_MS;

        if (shouldCommitNow) {
          setContentOverlays(newOverlays);
          lastOverlayCommit = timestamp;
          committedOverlayCount = newOverlays.length;
        }
      }

      raf = window.requestAnimationFrame(render);
    }

    function startLoop() {
      if (isPaused) return;
      window.cancelAnimationFrame(raf);
      lastTime = 0;
      raf = window.requestAnimationFrame(render);
    }

    function handleVisibilityChange() {
      isPaused = document.hidden;

      if (isPaused) {
        window.cancelAnimationFrame(raf);
      } else {
        startLoop();
      }
    }

    // Pointer events unify mouse + touch + pen and avoid parallel event handlers.
    function handlePointerMove(e: PointerEvent) {
      const rect = canvasEl.getBoundingClientRect();
      cursorX = e.clientX - rect.left;
      cursorY = e.clientY - rect.top;
      // Path hit-testing uses canvas pixel space; convert CSS pixels for HiDPI canvases.
      const hitX = cursorX * devicePixelRatio;
      const hitY = cursorY * devicePixelRatio;

      // Change cursor to pointer when hovering an interactive cube
      if (e.pointerType !== 'mouse') return;
      if (transitionPhase !== 'idle') {
        canvasEl.style.cursor = 'wait';
        return;
      }
      const isInteractive = cubes.some(cube =>
        cube.frontFacePath &&
        drawingContext.isPointInPath(cube.frontFacePath, hitX, hitY) &&
        (cube.onClick || cube.nextLayout)
      );
      canvasEl.style.cursor = isInteractive ? 'pointer' : 'default';
    }

    function handlePointerDown(e: PointerEvent) {
      if (transitionPhase !== 'idle') return; // Ignore clicks during transition
      const rect = canvasEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Path hit-testing uses canvas pixel space; convert CSS pixels for HiDPI canvases.
      const hitX = x * devicePixelRatio;
      const hitY = y * devicePixelRatio;

      // Check all cubes for clicks on their front faces
      for (const cube of cubes) {
        if (cube.frontFacePath && drawingContext.isPointInPath(cube.frontFacePath, hitX, hitY)) {
          // nextLayout takes priority — triggers a full layout transition
          if (cube.nextLayout) {
            startLayoutTransition(cube.nextLayout, cube);
            return;
          }
          // Otherwise call the custom onClick handler
          if (cube.onClick) {
            cube.onClick();
            return;
          }
        }
      }

      // Fallback to original trigger cube behavior if no custom handler was found
      let triggerCube: Cube | null = null;
      let maxRight = -1;

      for (const cube of cubes) {
        if (cube.row === 0) {
          const rightEdge = cube.col + cube.colSpan;
          if (rightEdge > maxRight) {
            maxRight = rightEdge;
            triggerCube = cube;
          }
        }
      }

      if (!triggerCube) return;

      // Check if the trigger cube was clicked
      const triggerLeft = triggerCube.col * size;
      const triggerTop = triggerCube.row * size;
      const triggerRight = triggerLeft + triggerCube.width;
      const triggerBottom = triggerTop + triggerCube.height;

      const clickedTrigger = x >= triggerLeft && x < triggerRight && y >= triggerTop && y < triggerBottom;

      if (!clickedTrigger) return;

      isLightMode = !isLightMode;
      bgTarget = isLightMode ? 215 : 40;

      const now = performance.now();
      const triggerRow = triggerCube.row + triggerCube.rowSpan / 2;
      const triggerCol = triggerCube.col + triggerCube.colSpan / 2;

      for (const cube of cubes) {
        // Cubes with content must always face forward (angle=0) so their
        // overlay renders. Skip them during the global mode flip.
        if (cube.content) continue;

        const cubeRow = cube.row + cube.rowSpan / 2;
        const cubeCol = cube.col + cube.colSpan / 2;
        const distance = Math.abs(cubeRow - triggerRow) + Math.abs(cubeCol - triggerCol);

        cube.startAngle = cube.angle;

        // Trigger cube flips opposite to others
        const isTriggerCube = cube === triggerCube;
        const target = isLightMode ? 0 : Math.PI;
        cube.targetAngle = isTriggerCube ? (Math.PI - target) : target;

        cube.animationStart = now + distance * 28;
        cube.animationDuration = 420;
        cube.highlightUntil = cube.animationStart + 320;
      }
    }

    function handlePointerLeave() {
      cursorX = viewportWidth / 2;
      cursorY = viewportHeight / 2;
    }

    resizeCanvas();
    startLoop();

    transitionLayoutRef.current = (nextLayout) => {
      if (!nextLayout) return;
      if (transitionPhase !== 'idle') return;

      const visualOnlyPatches: Record<string, { color?: WaveTileColor; texture?: WaveTileTexture; content?: ReactNode }> = {};
      let visualOnlyCount = 0;
      let hasStructuralChange = false;

      for (const def of nextLayout) {
        const matchingCube = cubes.find(c => sameStructure(def, c));
        if (!matchingCube) {
          hasStructuralChange = true;
          break;
        }

        if (!sameVisual(def, matchingCube)) {
          visualOnlyPatches[`${def.row}-${def.col}`] = {
            color: def.color,
            texture: def.texture,
            content: def.content,
          };
          visualOnlyCount += 1;
        }
      }

      const customCubeCount = cubes.filter(c => c.rowSpan > 1 || c.colSpan > 1 || c.content).length;
      if (!hasStructuralChange && customCubeCount !== nextLayout.length) {
        hasStructuralChange = true;
      }

      if (!hasStructuralChange && visualOnlyCount > 0 && patchCubesRef.current) {
        patchCubesRef.current(visualOnlyPatches);
        return;
      }

      const sourceCube =
        cubes.find(c => c.row > 1 && cubeWillChange(c, nextLayout)) ||
        cubes.find(c => cubeWillChange(c, nextLayout)) ||
        cubes.find(c => c.row > 1) ||
        cubes[0];

      if (!sourceCube) return;
      startLayoutTransition(nextLayout, sourceCube);
    };

    // Register the patch function — triggers the split/rotate/merge animation instead of instant mutation
    let hasReceivedFirstPatch = false;
    patchCubesRef.current = (patches) => {
      for (const [key, patch] of Object.entries(patches)) {
        const [row, col] = key.split('-').map(Number);
        const cube = cubes.find(c => c.row === row && c.col === col);
        if (!cube) continue;
        // First patch on mount: apply instantly so the page starts fully populated
        if (!hasReceivedFirstPatch) {
          if (patch.content !== undefined) cube.content = patch.content;
          if (patch.color !== undefined) cube.color = colorToRgb(patch.color);
          if (patch.texture !== undefined) cube.texture = patch.texture;
          hasReceivedFirstPatch = true;
          continue;
        }
        // If a transition is already running for this cube, skip (debounce rapid clicks)
        if (splitInfo && splitInfo.targetRow === row && splitInfo.targetCol === col) continue;
        splitInfo = {
          phase: 'fadeContent',
          phaseStart: performance.now(),
          targetRow: row,
          targetCol: col,
          contentOpacity: 1,
          mainCubeOpacity: 1,
          pendingColor: patch.color !== undefined ? colorToRgb(patch.color) : (cube.color ?? null),
          pendingTexture: patch.texture !== undefined ? patch.texture : (cube.texture || 'jaali'),
          pendingContent: patch.content !== undefined ? patch.content : cube.content,
          subCubes: [],
          nRows: cube.rowSpan,
          nCols: cube.colSpan,
          colorSwapped: [],
        };
      }
    };

    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    canvasEl.addEventListener("pointerdown", handlePointerDown);
    canvasEl.addEventListener("pointermove", handlePointerMove);
    canvasEl.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvasEl.removeEventListener("pointerdown", handlePointerDown);
      canvasEl.removeEventListener("pointermove", handlePointerMove);
      canvasEl.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [globalColor, globalTexture]);

  useEffect(() => {
    if (!transitionLayoutRef.current) return;

    if (!hasSeenInitialLayoutRef.current) {
      hasSeenInitialLayoutRef.current = true;
      return;
    }

    transitionLayoutRef.current(cubeLayout);
  }, [cubeLayout]);

  // Second effect: applies patchLayout changes in-place without rebuilding the grid
  useEffect(() => {
    if (!patchLayout || !patchCubesRef.current) return;
    patchCubesRef.current(patchLayout);
  }, [patchLayout]);

  return (
    <div className={`w-screen h-screen overflow-hidden bg-neutral-900 relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
      />
      {contentOverlays.map((overlay) => (
        <div
          key={overlay.id}
          className="absolute overflow-hidden pointer-events-none"
          style={{
            left: `${overlay.x}px`,
            top: `${overlay.y}px`,
            width: `${overlay.width}px`,
            height: `${overlay.height}px`,
            opacity: overlay.opacity,
          }}
        >
          <div className="w-full h-full flex items-center justify-center pointer-events-none">
            {overlay.content}
          </div>
        </div>
      ))}
    </div>
  );
}
