'use client'
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

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
  color?: {r: number, g: number, b: number} | null;
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
  color?: string;   // optional hex color for the cube
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
};

export function WaveTiles({ className = "", cubeLayout, globalColor }: WaveTilesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [contentOverlays, setContentOverlays] = useState<ContentOverlay[]>([]);
  const overlaysRef = useRef<ContentOverlay[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasEl: HTMLCanvasElement = canvas;
    const drawingContext: CanvasRenderingContext2D = ctx;

    const baseCells = 24;
    const perspective = 500;
    const viewYaw = 0;
    const viewPitch = 0;
    const maxCursorYaw = Math.PI / 6;
    const maxCursorPitch = Math.PI / 8;
    const maxVisibleCubes = 900;
    const minCubeSize = 16;
    const lightDir = normalize({ x: -0.35, y: -0.45, z: 1 });

    let size = 0;
    let rows = 0;
    let cols = 0;
    let cubes: Cube[] = [];
    let raf = 0;
    let lastTime = 0;
    let bgCurrent = 40;
    let bgTarget = 40;
    let isLightMode = false;
    let isPaused = false;
    let cursorX = 0;
    let cursorY = 0;

    // Layout transition state
    type TransitionPhase = 'idle' | 'decombining' | 'rotating' | 'recombining';
    let transitionPhase: TransitionPhase = 'idle';
    let pendingLayout: CubeDefinition[] | null = null;
    let phaseEndTime = 0;

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

    function getShadedColor(baseColor: {r: number, g: number, b: number} | null | undefined, brightness: number): string {
      if (!baseColor) return grayscale(brightness);
      
      const factor = brightness / 255;
      const r = Math.min(255, Math.max(0, Math.round(baseColor.r * factor)));
      const g = Math.min(255, Math.max(0, Math.round(baseColor.g * factor)));
      const b = Math.min(255, Math.max(0, Math.round(baseColor.b * factor)));
      return `rgb(${r}, ${g}, ${b})`;
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

    function hexToRgb(hex: string | undefined): {r: number, g: number, b: number} | null {
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

    function drawCube(cube: Cube, cursorYaw: number, cursorPitch: number, modeMix: number): { overlay: ContentOverlay | null; frontFacePath: Path2D | null } {
      const halfWidth = ((cube.width - 1) / 2) / Math.SQRT2;
      const halfHeight = ((cube.height - 1) / 2) / Math.SQRT2;
      // Use consistent depth for all cubes regardless of their width/height
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
      const minBrightness = mix(6, 200, modeMix);

      const faces = [
        { idx: [0, 1, 2, 3], lightBase: 255 - 42, darkBase: 42,  isBack: true },  // back
        { idx: [4, 5, 6, 7], lightBase: 255 - 8,  darkBase: 8,   isBack: false, isFront: true }, // front
        { idx: [0, 1, 5, 4], lightBase: 255 - 18, darkBase: 18,  isBack: false }, // bottom
        { idx: [2, 3, 7, 6], lightBase: 255 - 12, darkBase: 12,  isBack: false }, // top
        { idx: [1, 2, 6, 5], lightBase: 255 - 24, darkBase: 24,  isBack: false }, // right
        { idx: [0, 3, 7, 4], lightBase: 255 - 10, darkBase: 10,  isBack: false }, // left
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
        const brightness = face.isBack
          ? Math.round(face.base)
          : Math.round(Math.max(minBrightness, face.base * (ambient + light * diffuse) + highlight));

        tracePath();
        drawingContext.fillStyle = getShadedColor(cube.color, brightness);
        drawingContext.fill();

        drawingContext.save();
        tracePath();
        drawingContext.clip();
        const avgSize = (cube.width + cube.height) / 2;
        const step = Math.max(5, avgSize / 4);
        drawingContext.lineWidth = 0.5;
        drawingContext.strokeStyle = brightness > (120 + 80 * modeMix)
          ? `rgba(0,0,0,${mix(0.18, 0.08, modeMix).toFixed(3)})`
          : `rgba(255,255,255,${mix(0.04, 0.44, modeMix).toFixed(3)})`;
        const minX = Math.min(...pts.map((p) => cube.cx + p.x));
        const maxX = Math.max(...pts.map((p) => cube.cx + p.x));
        const minY = Math.min(...pts.map((p) => cube.cy + p.y));
        const maxY = Math.max(...pts.map((p) => cube.cy + p.y));
        for (let lx = Math.floor(minX / step) * step; lx <= maxX; lx += step) {
          drawingContext.beginPath();
          drawingContext.moveTo(lx, minY);
          drawingContext.lineTo(lx, maxY);
          drawingContext.stroke();
        }
        for (let ly = Math.floor(minY / step) * step; ly <= maxY; ly += step) {
          drawingContext.beginPath();
          drawingContext.moveTo(minX, ly);
          drawingContext.lineTo(maxX, ly);
          drawingContext.stroke();
        }
        drawingContext.restore();

        tracePath();
        drawingContext.strokeStyle = (modeMix > 0.5 ? brightness > 230 : brightness < 30)
          ? `rgba(0,0,0,${mix(0.35, 0.15, modeMix).toFixed(3)})`
          : `rgba(255,255,255,${mix(0.45, 0.75, modeMix).toFixed(3)})`;
        drawingContext.lineWidth = 1;
        drawingContext.stroke();

        // Store front face path for click detection
        if (face.isFront && orientedNormal.z > 0.3) {
          const path = new Path2D();
          path.moveTo(cube.cx + pts[0].x, cube.cy + pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            path.lineTo(cube.cx + pts[i].x, cube.cy + pts[i].y);
          }
          path.closePath();
          frontFacePath = path;
        }

        // Calculate content overlay for the front face if this cube has content
        if (cube.content && face.isFront && orientedNormal.z > 0.3) {
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
            opacity: Math.min(1, orientedNormal.z * 1.5),
          };
        }
      }

      return { overlay: contentOverlay, frontFacePath };
    }

    function buildGrid() {
      cubes = [];

      const parsedGlobalColor = hexToRgb(globalColor);

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
            width: size,
            height: size,
            angle: Math.PI,  // Default dark, will be corrected for trigger
            startAngle: Math.PI,
            targetAngle: Math.PI,
            animationStart: 0,
            animationDuration: 0,
            highlightUntil: 0,
            depthBias: (row / Math.max(1, rows - 1) - 0.5) * 10 + (col / Math.max(1, cols - 1) - 0.5) * 10,
            color: parsedGlobalColor,
            frontFacePath: undefined,
            startCx: _cx1, startCy: _cy1, startWidth: size, startHeight: size,
            targetCx: _cx1, targetCy: _cy1, targetWidth: size, targetHeight: size,
            posAnimStart: 0, posAnimDuration: 0,
          });
        }
      }

      // Add custom cubes
      if (cubeLayout && cubeLayout.length > 0) {
        cubeLayout.forEach((def) => {
          const cubeWidth = def.colSpan * size;
          const cubeHeight = def.rowSpan * size;
          const centerX = def.col * size + cubeWidth / 2;
          const centerY = def.row * size + cubeHeight / 2;

          cubes.push({
            row: def.row,
            col: def.col,
            rowSpan: def.rowSpan,
            colSpan: def.colSpan,
            cx: centerX,
            cy: centerY,
            width: cubeWidth,
            height: cubeHeight,
            angle: Math.PI,  // Default dark, will be corrected for trigger
            startAngle: Math.PI,
            targetAngle: Math.PI,
            animationStart: 0,
            animationDuration: 0,
            highlightUntil: 0,
            depthBias: (def.row / Math.max(1, rows - 1) - 0.5) * 10 + (def.col / Math.max(1, cols - 1) - 0.5) * 10,
            content: def.content,
            color: def.color ? hexToRgb(def.color) : parsedGlobalColor,
            onClick: def.onClick,
            nextLayout: def.nextLayout,
            frontFacePath: undefined,
            startCx: centerX, startCy: centerY, startWidth: cubeWidth, startHeight: cubeHeight,
            targetCx: centerX, targetCy: centerY, targetWidth: cubeWidth, targetHeight: cubeHeight,
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

      // Set trigger cube to light mode (angle 0)
      if (triggerCube) {
        triggerCube.angle = 0;
        triggerCube.startAngle = 0;
        triggerCube.targetAngle = 0;
      }
    }

    function resizeCanvas() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvasEl.width = width;
      canvasEl.height = height;
      cursorX = width / 2;
      cursorY = height / 2;

      size = Math.max(minCubeSize, Math.floor(Math.min(width, height) / baseCells));

      while (Math.ceil(width / size) * Math.ceil(height / size) > maxVisibleCubes) {
        size += 1;
      }

      cols = Math.max(1, Math.ceil(width / size));
      rows = Math.max(1, Math.ceil(height / size));

      buildGrid();
    }

    // ── LAYOUT TRANSITION HELPERS ─────────────────────────────────────────

    /** Called when a cube with `nextLayout` is clicked — starts the 3-phase transition */
    function startLayoutTransition(newLayout: CubeDefinition[]) {
      if (transitionPhase !== 'idle') return; // Ignore clicks while transitioning
      transitionPhase = 'decombining';
      pendingLayout = newLayout;
      const now = performance.now();

      for (const cube of cubes) {
        if (cube.colSpan > 1 || cube.rowSpan > 1) {
          // Animate multi-cell cube to shrink to 1×1 at its top-left corner
          const tlCx = cube.col * size + size / 2;
          const tlCy = cube.row * size + size / 2;
          cube.startCx = cube.cx;
          cube.startCy = cube.cy;
          cube.startWidth = cube.width;
          cube.startHeight = cube.height;
          cube.targetCx = tlCx;
          cube.targetCy = tlCy;
          cube.targetWidth = size;
          cube.targetHeight = size;
          cube.posAnimStart = now;
          cube.posAnimDuration = 420;
        }
      }

      phaseEndTime = now + 480;
    }

    /** Phase 1 → 2: replace shrunken multi-cell cubes with their constituent 1×1 cells,
     *  then kick off a wave rotation from the canvas centre. */
    function flushDecombine() {
      const now = performance.now();
      const newCubes: Cube[] = [];

      for (const cube of cubes) {
        if (cube.colSpan === 1 && cube.rowSpan === 1) {
          // Already a single cell — reset pos animation and keep
          cube.startCx = cube.cx; cube.startCy = cube.cy;
          cube.startWidth = cube.width; cube.startHeight = cube.height;
          cube.targetCx = cube.cx; cube.targetCy = cube.cy;
          cube.targetWidth = cube.width; cube.targetHeight = cube.height;
          cube.posAnimStart = 0; cube.posAnimDuration = 0;
          newCubes.push(cube);
        } else {
          // Explode into constituent 1×1 cells at their actual grid positions
          for (let r = cube.row; r < cube.row + cube.rowSpan; r++) {
            for (let c = cube.col; c < cube.col + cube.colSpan; c++) {
              const cellCx = c * size + size / 2;
              const cellCy = r * size + size / 2;
              newCubes.push({
                row: r, col: c, rowSpan: 1, colSpan: 1,
                cx: cellCx, cy: cellCy, width: size, height: size,
                angle: cube.angle, startAngle: cube.angle, targetAngle: cube.angle,
                animationStart: 0, animationDuration: 0, highlightUntil: 0,
                depthBias: (r / Math.max(1, rows - 1) - 0.5) * 10 + (c / Math.max(1, cols - 1) - 0.5) * 10,
                color: cube.color,
                startCx: cellCx, startCy: cellCy, startWidth: size, startHeight: size,
                targetCx: cellCx, targetCy: cellCy, targetWidth: size, targetHeight: size,
                posAnimStart: 0, posAnimDuration: 0,
              });
            }
          }
        }
      }

      cubes = newCubes;

      // Trigger wave rotation from the canvas centre
      const centerRow = rows / 2;
      const centerCol = cols / 2;
      const maxDist = centerRow + centerCol;

      for (const cube of cubes) {
        const cubeRow = cube.row + 0.5;
        const cubeCol = cube.col + 0.5;
        const distance = Math.abs(cubeRow - centerRow) + Math.abs(cubeCol - centerCol);
        cube.startAngle = cube.angle;
        cube.targetAngle = cube.angle + Math.PI * 2; // full spin — ends at same visual state, no mode flip
        cube.animationStart = now + distance * 18;
        cube.animationDuration = 380;
        cube.highlightUntil = cube.animationStart + 280;
      }

      // Phase ends after the wave has fully passed through all cells
      phaseEndTime = now + maxDist * 18 + 420;
    }

    /** Phase 2 → 3: rebuild the cube array using the pending layout,
     *  with new multi-cell cubes starting at 1×1 and expanding to full size. */
    function applyNewLayoutCubes() {
      if (!pendingLayout) return;
      const now = performance.now();
      const parsedGlobalColor = hexToRgb(globalColor);

      // Cells covered by new multi-cell definitions
      const coveredCells = new Set<string>();
      pendingLayout.forEach(def => {
        for (let r = def.row; r < def.row + def.rowSpan; r++) {
          for (let c = def.col; c < def.col + def.colSpan; c++) {
            coveredCells.add(`${r},${c}`);
          }
        }
      });

      // Keep 1×1 grid cells not occupied by the new layout
      const newCubes: Cube[] = cubes.filter(c => !coveredCells.has(`${c.row},${c.col}`));

      // Add new layout cubes — start at 1×1 and animate to full merged size
      pendingLayout.forEach(def => {
        const startCx   = def.col * size + size / 2;
        const startCy   = def.row * size + size / 2;
        const targetCx  = def.col * size + def.colSpan * size / 2;
        const targetCy  = def.row * size + def.rowSpan * size / 2;
        const targetW   = def.colSpan * size;
        const targetH   = def.rowSpan * size;
        const existing  = cubes.find(c => c.row === def.row && c.col === def.col);
        // Normalise to [0, 2π) to strip accumulated full-rotation drift from the morph spin
        const rawAngle = existing?.angle ?? (isLightMode ? 0 : Math.PI);
        const inheritedAngle = ((rawAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

        newCubes.push({
          row: def.row, col: def.col,
          rowSpan: def.rowSpan, colSpan: def.colSpan,
          cx: startCx, cy: startCy,
          width: size, height: size,
          angle: inheritedAngle, startAngle: inheritedAngle, targetAngle: inheritedAngle,
          animationStart: 0, animationDuration: 0, highlightUntil: 0,
          depthBias: (def.row / Math.max(1, rows - 1) - 0.5) * 10 + (def.col / Math.max(1, cols - 1) - 0.5) * 10,
          content: def.content,
          color: def.color ? hexToRgb(def.color) : parsedGlobalColor,
          onClick: def.onClick,
          nextLayout: def.nextLayout,
          startCx, startCy, startWidth: size, startHeight: size,
          targetCx, targetCy, targetWidth: targetW, targetHeight: targetH,
          posAnimStart: now, posAnimDuration: 450,
        });
      });

      cubes = newCubes;
    }

    // ─────────────────────────────────────────────────────────────────────────

    function render(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      const delta = Math.min(0.05, (timestamp - lastTime) / 1000);
      lastTime = timestamp;

      const fadeAmount = 1 - Math.exp(-delta * 1.5);
      bgCurrent = mix(bgCurrent, bgTarget, fadeAmount);
      drawingContext.fillStyle = grayscale(bgCurrent);
      drawingContext.fillRect(0, 0, canvasEl.width, canvasEl.height);

      const halfWidth = Math.max(1, canvasEl.width / 2);
      const halfHeight = Math.max(1, canvasEl.height / 2);

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
          cube.cx     = cube.startCx     + (cube.targetCx     - cube.startCx)     * eased;
          cube.cy     = cube.startCy     + (cube.targetCy     - cube.startCy)     * eased;
          cube.width  = cube.startWidth  + (cube.targetWidth  - cube.startWidth)  * eased;
          cube.height = cube.startHeight + (cube.targetHeight - cube.startHeight) * eased;
        }

        const nx = clamp((cursorX - cube.cx) / halfWidth, -1, 1);
        const ny = clamp((cursorY - cube.cy) / halfHeight, -1, 1);
        const cursorYaw = nx * maxCursorYaw;
        const cursorPitch = -ny * maxCursorPitch;

        const cubeModeMix = (Math.cos(cube.angle) + 1) / 2;

        const { overlay, frontFacePath } = drawCube(cube, cursorYaw, cursorPitch, cubeModeMix);
        if (overlay) {
          newOverlays.push(overlay);
        }
        cube.frontFacePath = frontFacePath || undefined;
      }

      // ── Transition phase state machine ──
      if (transitionPhase === 'decombining' && timestamp >= phaseEndTime) {
        flushDecombine();
        transitionPhase = 'rotating';
      } else if (transitionPhase === 'rotating' && timestamp >= phaseEndTime) {
        applyNewLayoutCubes();
        transitionPhase = 'recombining';
        phaseEndTime = performance.now() + 500;
      } else if (transitionPhase === 'recombining' && timestamp >= phaseEndTime) {
        transitionPhase = 'idle';
        pendingLayout = null;
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
        setContentOverlays(newOverlays);
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

    function handleMouseMove(e: MouseEvent) {
      const rect = canvasEl.getBoundingClientRect();
      cursorX = e.clientX - rect.left;
      cursorY = e.clientY - rect.top;

      // Change cursor to pointer when hovering an interactive cube
      if (transitionPhase !== 'idle') {
        canvasEl.style.cursor = 'wait';
        return;
      }
      const isInteractive = cubes.some(cube =>
        cube.frontFacePath &&
        drawingContext.isPointInPath(cube.frontFacePath, cursorX, cursorY) &&
        (cube.onClick || cube.nextLayout)
      );
      canvasEl.style.cursor = isInteractive ? 'pointer' : 'default';
    }

    function handleClick(e: MouseEvent) {
      if (transitionPhase !== 'idle') return; // Ignore clicks during transition
      const rect = canvasEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check all cubes for clicks on their front faces
      for (const cube of cubes) {
        if (cube.frontFacePath && drawingContext.isPointInPath(cube.frontFacePath, x, y)) {
          // nextLayout takes priority — triggers a full layout transition
          if (cube.nextLayout) {
            startLayoutTransition(cube.nextLayout);
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

    function handleMouseLeave() {
      cursorX = canvasEl.width / 2;
      cursorY = canvasEl.height / 2;
    }

    resizeCanvas();
    startLoop();

    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    canvasEl.addEventListener("click", handleClick);
    canvasEl.addEventListener("mousemove", handleMouseMove);
    canvasEl.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvasEl.removeEventListener("click", handleClick);
      canvasEl.removeEventListener("mousemove", handleMouseMove);
      canvasEl.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [cubeLayout, globalColor]);

  return (
    <div className={`w-screen h-screen overflow-hidden bg-neutral-900 relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
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
