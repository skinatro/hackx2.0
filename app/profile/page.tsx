"use client";

import { useAuth } from "@/app/providers/auth-provider";
import { useTheme } from "@/app/providers/theme-provider";
import { FullPageLoader, LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";

function RoleBadge({
  role,
  isLightMode,
}: {
  role: string;
  isLightMode: boolean;
}) {
  const colors: Record<string, string> = {
    admin: "#ff00a0",
    leader: "#c0ff00",
    member: "#00f0ff",
  };
  const bg = colors[role] || "#ffd23f";

  return (
    <span
      className={`inline-flex border-[3px] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${isLightMode ? "border-black text-black" : "border-black text-black"}`}
      style={{ backgroundColor: bg }}
    >
      {role}
    </span>
  );
}

function DomainBadge({
  domain,
  isLightMode,
}: {
  domain: string;
  isLightMode: boolean;
}) {
  return (
    <span
      className={`inline-flex border-[3px] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${isLightMode
        ? "border-black bg-[#ffd23f] text-black"
        : "border-[#ffd23f] bg-black text-[#ffd23f]"
        }`}
    >
      {domain}
    </span>
  );
}

export default function ProfilePage() {
  const { profile, isLoading } = useAuth();
  const { isLightMode } = useTheme();
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = useCallback(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 512;
    canvas.width = size;
    canvas.height = size;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement("a");
      link.download = `hackx-qr-${profile?.name?.replace(/\s+/g, "-").toLowerCase() || "code"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("QR code downloaded!");
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [profile]);

  return (
    <div
      className={`relative min-h-screen font-sans transition-colors duration-500 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
    >
      <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-20 sm:px-6 lg:px-8 relative z-20">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className={`text-[10px] font-black uppercase tracking-[0.4em] ${isLightMode ? "text-black/55" : "text-white/50"}`}
          >
            HackX 2.0
          </p>
          <h1
            className={`mt-3 font-black uppercase tracking-tighter text-5xl sm:text-7xl ${isLightMode ? "text-black" : "text-white"}`}
          >
            Profile
          </h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className={`mt-4 text-[10px] font-black uppercase tracking-widest ${isLightMode ? "text-black/50" : "text-white/40"}`}>
              Loading your identity...
            </p>
          </div>
        ) : !profile ? (
          <div className="flex flex-col items-center justify-center py-20 border-[3px] border-dashed border-white/20">
            <p className="text-white/50 text-sm font-bold uppercase tracking-widest">
              Profile not found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
          {/* Info Card */}
          <div
            className={`border-[3px] p-8 ${isLightMode
              ? "border-black bg-white shadow-[8px_8px_0_#000]"
              : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"
              }`}
          >
            <div className="flex flex-col gap-6">
              <div>
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${isLightMode ? "text-black/50" : "text-white/40"}`}
                >
                  Full Name
                </p>
                <p
                  className={`text-2xl font-black uppercase tracking-wide ${isLightMode ? "text-black" : "text-white"}`}
                >
                  {profile.name}
                </p>
              </div>

              <div>
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${isLightMode ? "text-black/50" : "text-white/40"}`}
                >
                  Team
                </p>
                <p
                  className={`text-xl font-black uppercase tracking-wide ${isLightMode ? "text-black" : "text-white"}`}
                >
                  {profile.team_name}
                </p>
              </div>

              <div>
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isLightMode ? "text-black/50" : "text-white/40"}`}
                >
                  Role & Domain
                </p>
                <div className="flex flex-wrap gap-2">
                  <RoleBadge role={profile.role} isLightMode={isLightMode} />
                  <DomainBadge
                    domain={profile.domain}
                    isLightMode={isLightMode}
                  />
                </div>
              </div>

              <div>
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${isLightMode ? "text-black/50" : "text-white/40"}`}
                >
                  Email
                </p>
                <p
                  className={`text-sm font-bold ${isLightMode ? "text-black/70" : "text-white/70"}`}
                >
                  {profile.email}
                </p>
              </div>

              {profile.phone && (
                <div>
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${isLightMode ? "text-black/50" : "text-white/40"}`}
                  >
                    Phone
                  </p>
                  <p
                    className={`text-sm font-bold ${isLightMode ? "text-black/70" : "text-white/70"}`}
                  >
                    {profile.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Card */}
          <div
            className={`border-[3px] p-8 flex flex-col items-center gap-6 ${isLightMode
              ? "border-black bg-white shadow-[8px_8px_0_#000]"
              : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"
              }`}
          >
            <p
              className={`text-[10px] font-black uppercase tracking-[0.3em] ${isLightMode ? "text-black/50" : "text-white/40"}`}
            >
              Your QR Code (Food Scan)
            </p>

            <div
              ref={qrRef}
              className="border-[3px] border-black bg-white p-4"
            >
              <QRCodeSVG
                value={profile.user_id}
                size={200}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>

            <p
              className={`text-center text-[10px] font-bold ${isLightMode ? "text-black/40" : "text-white/30"}`}
            >
              Show this QR code during meals for scanning
            </p>

            <button
              type="button"
              onClick={downloadQR}
              className={`w-full border-[3px] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 ${isLightMode
                ? "border-black bg-[#c0ff00] text-black shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000]"
                : "border-white bg-[#c0ff00] text-black shadow-[4px_4px_0_#fff] hover:shadow-[6px_6px_0_#fff]"
                }`}
            >
              Download QR Code ↓
            </button>
          </div>
        </div>
      )}
    </main>
  </div>
  );
}
