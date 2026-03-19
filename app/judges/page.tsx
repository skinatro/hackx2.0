"use client";

import { useTheme } from "@/app/providers/theme-provider";
import { motion } from "framer-motion";
import { Clock, Star, Users } from "lucide-react";
import Link from "next/link";

const JudgesIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="m22 21-3-3m-3-3a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
  </svg>
);

const MentorsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <path d="M12 14l-3 3h6l-3-3Z" />
  </svg>
);

export default function JudgesPage() {
  const { isLightMode } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 120,
      },
    },
  };

  return (
    <div
      className={`relative min-h-screen font-sans selection:bg-[#ff00a0] selection:text-white transition-colors duration-500 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"
        }`}
    >
      {/* Background Pattern */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-16">
            <p
              className={`cursor-target text-[10px] font-black uppercase tracking-[0.4em] mb-6 ${isLightMode ? "text-black/55" : "text-white/50"
                }`}
            >
              HackX 2.0
            </p>
            <h1
              className={`cursor-target font-black uppercase tracking-tighter text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-8 ${isLightMode ? "text-black" : "text-white"
                }`}
            >
              Judges & Mentors
            </h1>
            <div
              className={`inline-block border-[3px] px-6 py-3 text-sm font-black uppercase tracking-widest ${isLightMode
                  ? "border-black bg-[#ff6b35] text-white shadow-[6px_6px_0_#000]"
                  : "border-white bg-[#ff6b35] text-white shadow-[6px_6px_0_#fff]"
                }`}
            >
              Revealing Soon
            </div>
          </motion.div>

          {/* Coming Soon Content */}
          <motion.div
            variants={itemVariants}
            className={`mx-auto max-w-4xl border-[3px] p-8 sm:p-12 ${isLightMode
                ? "border-black bg-white shadow-[12px_12px_0_#000]"
                : "border-white/30 bg-[#111] shadow-[12px_12px_0_#fff]"
              }`}
          >
            {/* Clock Icon */}
            <div
              className={`mx-auto mb-8 flex h-20 w-20 items-center justify-center border-[3px] ${isLightMode ? "border-black bg-[#ff6b35]" : "border-white bg-[#ff6b35]"
                } shadow-[6px_6px_0_#000]`}
            >
              <Clock className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>

            <h2
              className={`mb-6 text-3xl sm:text-5xl font-black uppercase tracking-tighter ${isLightMode ? "text-black" : "text-white"
                }`}
            >
              Curating Excellence
            </h2>

            <p
              className={`mb-8 text-lg sm:text-xl font-bold leading-relaxed ${isLightMode ? "text-black/70" : "text-white/70"
                }`}
            >
              We're assembling an incredible panel of industry leaders, tech visionaries,
              and experienced mentors who will guide you through the 24-hour innovation journey.
              Stay tuned for the big reveal!
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <motion.div
                variants={itemVariants}
                className={`p-6 border-[3px] ${isLightMode
                    ? "border-black/15 bg-black/5"
                    : "border-white/20 bg-white/5"
                  }`}
              >
                <JudgesIcon
                  className={`mx-auto mb-4 h-8 w-8 ${isLightMode ? "text-[#ff6b35]" : "text-[#ff6b35]"
                    }`}
                />
                <h3
                  className={`mb-2 text-lg font-black uppercase tracking-widest ${isLightMode ? "text-black" : "text-white"
                    }`}
                >
                  Expert Judges
                </h3>
                <p
                  className={`text-sm font-semibold leading-relaxed ${isLightMode ? "text-black/60" : "text-white/60"
                    }`}
                >
                  Top industry professionals evaluating your innovations
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className={`p-6 border-[3px] ${isLightMode
                    ? "border-black/15 bg-black/5"
                    : "border-white/20 bg-white/5"
                  }`}
              >
                <MentorsIcon
                  className={`mx-auto mb-4 h-8 w-8 ${isLightMode ? "text-[#00f0ff]" : "text-[#00f0ff]"
                    }`}
                />
                <h3
                  className={`mb-2 text-lg font-black uppercase tracking-widest ${isLightMode ? "text-black" : "text-white"
                    }`}
                >
                  Dedicated Mentors
                </h3>
                <p
                  className={`text-sm font-semibold leading-relaxed ${isLightMode ? "text-black/60" : "text-white/60"
                    }`}
                >
                  Experienced guides supporting your development journey
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className={`p-6 border-[3px] ${isLightMode
                    ? "border-black/15 bg-black/5"
                    : "border-white/20 bg-white/5"
                  }`}
              >
                <Star
                  className={`mx-auto mb-4 h-8 w-8 ${isLightMode ? "text-[#c0ff00]" : "text-[#c0ff00]"
                    }`}
                  strokeWidth={2.5}
                />
                <h3
                  className={`mb-2 text-lg font-black uppercase tracking-widest ${isLightMode ? "text-black" : "text-white"
                    }`}
                >
                  Quality Guaranteed
                </h3>
                <p
                  className={`text-sm font-semibold leading-relaxed ${isLightMode ? "text-black/60" : "text-white/60"
                    }`}
                >
                  Carefully selected for their expertise and passion
                </p>
              </motion.div>
            </div>

            <div
              className={`inline-flex items-center gap-2 border-[3px] px-6 py-3 text-xs font-black uppercase tracking-widest transition-transform hover:-translate-y-1 ${isLightMode
                  ? "border-black bg-[#c0ff00] text-black shadow-[4px_4px_0_#000]"
                  : "border-white/30 bg-[#c0ff00] text-black shadow-[4px_4px_0_#fff]"
                }`}
            >
              <Users className="h-4 w-4" strokeWidth={2.5} />
              Announcement Coming Soon
            </div>
          </motion.div>

          {/* Bottom Navigation */}
          <motion.div variants={itemVariants} className="mt-16">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                href="/timeline"
                className={`group inline-flex items-center gap-2 border-[3px] px-6 py-3 text-sm font-black uppercase tracking-widest transition-all hover:-translate-y-1 ${isLightMode
                    ? "border-black bg-white text-black shadow-[6px_6px_0_#000] hover:bg-[#f0f0f0]"
                    : "border-white/30 bg-black text-white shadow-[6px_6px_0_#fff] hover:bg-[#111]"
                  }`}
              >
                View Timeline
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/about"
                className={`group inline-flex items-center gap-2 border-[3px] px-6 py-3 text-sm font-black uppercase tracking-widest transition-all hover:-translate-y-1 ${isLightMode
                    ? "border-black bg-[#ffd23f] text-black shadow-[6px_6px_0_#000]"
                    : "border-white bg-[#ffd23f] text-black shadow-[6px_6px_0_#fff]"
                  }`}
              >
                Learn More
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}