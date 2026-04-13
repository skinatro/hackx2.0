"use client";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "w-5 h-5 border-[2px]",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-[3px]",
  };

  return (
    <div
      className={`${sizeMap[size]} border-white/30 border-t-[#c0ff00] animate-spin`}
      style={{ borderRadius: 0 }}
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6">
        <LoadingSpinner size="lg" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-white/50">
          Loading...
        </p>
      </div>
    </div>
  );
}
