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

export default function WaveTiles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseCells = 24;
    const perspective = 500;
    const viewYaw = Math.PI / 4;
    const viewPitch = -Math.atan(1 / Math.SQRT2);
    const maxVisibleCubes = 900;
    const minCubeSize = 16;
    const lightDir = normalize({ x: -0.35, y: -0.45, z: 1 });

    let size = 0;
    let rows = 0;
    let cols = 0;
    let cubes: Cube[] = [];
    let raf = 0;
    let lastTime = 0;
    let transitionToBlack = false;
    let isPaused = false;

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

    function drawCube(cube: Cube) {
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
        const rotated = rotateX(rotateY(point, viewYaw + cube.angle), viewPitch);
        return {
          x: rotated.x,
          y: rotated.y,
          z: rotated.z + cube.depthBias,
        };
      });
      const projected = transformed.map(project);
      const highlight = cube.highlightUntil > performance.now() ? 16 : 0;

      const faces = [
        { idx: [0, 1, 2, 3], base: 16 },
        { idx: [4, 5, 6, 7], base: 240 },
        { idx: [0, 1, 5, 4], base: 178 },
        { idx: [2, 3, 7, 6], base: 150 },
        { idx: [1, 2, 6, 5], base: 188 },
        { idx: [0, 3, 7, 4], base: 140 },
      ].map((face) => ({
        ...face,
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
        if (face.normal.z <= 0) continue;

        ctx.beginPath();

        const first = projected[face.idx[0]];
        ctx.moveTo(cube.cx + first.x, cube.cy + first.y);

        for (let i = 1; i < face.idx.length; i++) {
          const p = projected[face.idx[i]];
          ctx.lineTo(cube.cx + p.x, cube.cy + p.y);
        }

        ctx.closePath();
        const light = Math.max(0, dot(face.normal, lightDir));
        const shaded = face.base * (0.7 + light * 0.5) + highlight;
        ctx.fillStyle = grayscale(shaded);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    function buildGrid() {
      cubes = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const isTopRight = row === 0 && col === cols - 1;
          const initialAngle = isTopRight ? Math.PI : 0;

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

      transitionToBlack = false;
    }

    function triggerTransition() {
      transitionToBlack = !transitionToBlack;
      const now = performance.now();

      for (const cube of cubes) {
        const distance = Math.abs(cube.row - 0) + Math.abs(cube.col - (cols - 1));
        cube.startAngle = cube.angle;
        cube.targetAngle = transitionToBlack ? Math.PI : 0;
        cube.animationStart = now + distance * 28;
        cube.animationDuration = 420;
        cube.highlightUntil = cube.animationStart + 320;
      }
    }

    function resizeCanvas() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;

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
      const delta = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const cube of cubes) {
        if (timestamp >= cube.animationStart) {
          const elapsed = timestamp - cube.animationStart;
          const progress = Math.min(1, elapsed / Math.max(1, cube.animationDuration));
          const eased = easeInOut(progress);
          cube.angle = cube.startAngle + (cube.targetAngle - cube.startAngle) * eased;
        }
        drawCube(cube);
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

    function handleClick(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = Math.floor(x / size);
      const row = Math.floor(y / size);

      if (row === 0 && col === cols - 1) {
        triggerTransition();
      }
    }

    resizeCanvas();
    startLoop();

    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    canvas.addEventListener("click", handleClick);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-neutral-900">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}