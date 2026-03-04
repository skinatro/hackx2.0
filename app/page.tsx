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
    let transitionToBlack = false;
    let isDarkMode = true;
    let bgCurrent = 10;
    let bgTarget = 10;
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

    function drawCube(cube: Cube, cursorYaw: number, cursorPitch: number) {
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

      // face base brightness
      const faces = [
        { idx: [0, 1, 2, 3], base: 0, isBack: true },   // back (pure black)
        { idx: [4, 5, 6, 7], base: 255, isBack: false }, // front (pure white)
        { idx: [0, 1, 5, 4], base: 145, isBack: false }, // bottom
        { idx: [2, 3, 7, 6], base: 115, isBack: false }, // top
        { idx: [1, 2, 6, 5], base: 195, isBack: false }, // right
        { idx: [0, 3, 7, 4], base: 100, isBack: false }, // left
      ].map((face) => ({
        ...face,
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

        // build path once, reuse via clip
        const tracePath = () => {
          ctx.beginPath();
          ctx.moveTo(cube.cx + pts[0].x, cube.cy + pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(cube.cx + pts[i].x, cube.cy + pts[i].y);
          }
          ctx.closePath();
        };

        const light = Math.max(0, dot(orientedNormal, lightDir));
        const brightness = face.isBack
          ? 0
          : Math.round(Math.max(70, face.base * (0.55 + light * 0.45) + highlight));

        tracePath();
        ctx.fillStyle = grayscale(brightness);
        ctx.fill();

        // subtle grid texture clipped to this face
        ctx.save();
        tracePath();
        ctx.clip();
        const step = Math.max(5, size / 4);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = brightness > 120
          ? "rgba(0,0,0,0.10)"
          : "rgba(255,255,255,0.07)";
        const minX = Math.min(...pts.map((p) => cube.cx + p.x));
        const maxX = Math.max(...pts.map((p) => cube.cx + p.x));
        const minY = Math.min(...pts.map((p) => cube.cy + p.y));
        const maxY = Math.max(...pts.map((p) => cube.cy + p.y));
        for (let lx = Math.floor(minX / step) * step; lx <= maxX; lx += step) {
          ctx.beginPath();
          ctx.moveTo(lx, minY);
          ctx.lineTo(lx, maxY);
          ctx.stroke();
        }
        for (let ly = Math.floor(minY / step) * step; ly <= maxY; ly += step) {
          ctx.beginPath();
          ctx.moveTo(minX, ly);
          ctx.lineTo(maxX, ly);
          ctx.stroke();
        }
        ctx.restore();

        // adaptive edge stroke: light on dark faces, dark on bright faces
        tracePath();
        ctx.strokeStyle = brightness > 130
          ? "rgba(0,0,0,0.55)"
          : "rgba(255,255,255,0.50)";
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
      bgTarget = 255 - bgCurrent;
      isDarkMode = bgTarget < 128;
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

      const fadeAmount = 1 - Math.exp(-delta * 8);
      bgCurrent = mix(bgCurrent, bgTarget, fadeAmount);
      ctx.fillStyle = grayscale(bgCurrent);
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const halfWidth = Math.max(1, canvas.width / 2);
      const halfHeight = Math.max(1, canvas.height / 2);

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

        drawCube(cube, cursorYaw, cursorPitch);
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

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      cursorX = e.clientX - rect.left;
      cursorY = e.clientY - rect.top;
    }

    function handleMouseLeave() {
      cursorX = canvas.width / 2;
      cursorY = canvas.height / 2;
    }

    resizeCanvas();
    startLoop();

    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
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