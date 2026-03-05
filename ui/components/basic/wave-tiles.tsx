'use client'
import { useEffect, useRef } from "react";

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
  cx: number;
  cy: number;
  angle: number;
  startAngle: number;
  targetAngle: number;
  animationStart: number;
  animationDuration: number;
  highlightUntil: number;
  depthBias: number;
};

type WaveTilesProps = {
  className?: string;
};

export function WaveTiles({ className = "" }: WaveTilesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    function easeInOut(t: number): number {
      return t * t * (3 - 2 * t);
    }

    function clamp(value: number, min: number, max: number): number {
      return Math.max(min, Math.min(max, value));
    }

    function mix(from: number, to: number, amount: number): number {
      return from + (to - from) * amount;
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

    function drawCube(cube: Cube, cursorYaw: number, cursorPitch: number, modeMix: number) {
      const half = ((size - 1) / 2) / Math.SQRT2;
      const points: Point3D[] = [
        { x: -half, y: -half, z: -half },
        { x: half, y: -half, z: -half },
        { x: half, y: half, z: -half },
        { x: -half, y: half, z: -half },
        { x: -half, y: -half, z: half },
        { x: half, y: -half, z: half },
        { x: half, y: half, z: half },
        { x: -half, y: half, z: half },
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
        { idx: [4, 5, 6, 7], lightBase: 255 - 8,  darkBase: 8,   isBack: false }, // front
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
        drawingContext.fillStyle = grayscale(brightness);
        drawingContext.fill();

        drawingContext.save();
        tracePath();
        drawingContext.clip();
        const step = Math.max(5, size / 4);
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
      }
    }

    function buildGrid() {
      cubes = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const isTopRight = row === 0 && col === cols - 1;
          const initialAngle = isTopRight ? 0 : Math.PI;

          cubes.push({
            row,
            col,
            cx: col * size + size / 2,
            cy: row * size + size / 2,
            angle: initialAngle,
            startAngle: initialAngle,
            targetAngle: initialAngle,
            animationStart: 0,
            animationDuration: 0,
            highlightUntil: 0,
            depthBias: (row / Math.max(1, rows - 1) - 0.5) * 10 + (col / Math.max(1, cols - 1) - 0.5) * 10,
          });
        }
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

      for (const cube of cubes) {
        if (timestamp >= cube.animationStart) {
          const elapsed = timestamp - cube.animationStart;
          const progress = Math.min(1, elapsed / Math.max(1, cube.animationDuration));
          const eased = easeInOut(progress);
          cube.angle = cube.startAngle + (cube.targetAngle - cube.startAngle) * eased;
        }

        const nx = clamp((cursorX - cube.cx) / halfWidth, -1, 1);
        const ny = clamp((cursorY - cube.cy) / halfHeight, -1, 1);
        const cursorYaw = nx * maxCursorYaw;
        const cursorPitch = -ny * maxCursorPitch;

        const cubeModeMix = (Math.cos(cube.angle) + 1) / 2;

        drawCube(cube, cursorYaw, cursorPitch, cubeModeMix);
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
    }

    function handleClick(e: MouseEvent) {
      const rect = canvasEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.floor(x / size);
      const row = Math.floor(y / size);

      if (row !== 0 || col !== cols - 1) return;

      isLightMode = !isLightMode;
      bgTarget = isLightMode ? 215 : 40;

      const now = performance.now();
      for (const cube of cubes) {
        const distance = Math.abs(cube.row - 0) + Math.abs(cube.col - (cols - 1));
        cube.startAngle = cube.angle;

        const isTopRight = cube.row === 0 && cube.col === cols - 1;
        const target = isLightMode ? 0 : Math.PI;
        cube.targetAngle = isTopRight ? (Math.PI - target) : target;

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
  }, []);

  return (
    <div className={`w-screen h-screen overflow-hidden bg-neutral-900 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
