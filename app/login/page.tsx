"use client";

import { createClient } from "@/libs/supabase/client";
import { useTheme } from "@/app/providers/theme-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isLightMode } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/profile";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Logged in successfully!");
    router.push(redirect);
    router.refresh();
  };

  return (
    <div
      className={`relative min-h-screen font-sans transition-colors duration-500 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
    >
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 py-20 relative z-20">
        <div className="w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <p
              className={`text-[10px] font-black uppercase tracking-[0.4em] ${isLightMode ? "text-black/55" : "text-white/50"}`}
            >
              HackX 2.0
            </p>
            <h1
              className={`mt-3 font-black uppercase tracking-tighter text-5xl sm:text-6xl ${isLightMode ? "text-black" : "text-white"}`}
            >
              Login
            </h1>
            <div
              className={`mx-auto mt-4 w-fit border-[3px] px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] ${isLightMode ? "border-black bg-[#c0ff00] text-black" : "border-[#c0ff00] bg-black text-[#c0ff00]"}`}
            >
              Portal Access
            </div>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleLogin}
            className={`border-[3px] p-8 ${isLightMode ? "border-black bg-white shadow-[8px_8px_0_#000]" : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"}`}
          >
            <div className="flex flex-col gap-6">
              <div>
                <label
                  htmlFor="email"
                  className={`block text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isLightMode ? "text-black/70" : "text-white/50"}`}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full border-[3px] px-4 py-3 text-sm font-bold outline-none transition-all focus:translate-y-[-1px] ${
                    isLightMode
                      ? "border-black bg-white text-black placeholder:text-black/30 focus:shadow-[4px_4px_0_#c0ff00]"
                      : "border-white/30 bg-black text-white placeholder:text-white/30 focus:border-white/60 focus:shadow-[4px_4px_0_#c0ff00]"
                  }`}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={`block text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isLightMode ? "text-black/70" : "text-white/50"}`}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full border-[3px] px-4 py-3 text-sm font-bold outline-none transition-all focus:translate-y-[-1px] ${
                    isLightMode
                      ? "border-black bg-white text-black placeholder:text-black/30 focus:shadow-[4px_4px_0_#c0ff00]"
                      : "border-white/30 bg-black text-white placeholder:text-white/30 focus:border-white/60 focus:shadow-[4px_4px_0_#c0ff00]"
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`relative flex items-center justify-center gap-3 border-[3px] px-6 py-4 text-sm font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isLightMode
                    ? "border-black bg-[#ff00a0] text-white shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000]"
                    : "border-white bg-[#ff00a0] text-white shadow-[6px_6px_0_#fff] hover:shadow-[8px_8px_0_#c0ff00]"
                }`}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Signing In...
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>
            </div>
          </form>

          {/* <p
            className={`mt-6 text-center text-xs font-bold ${isLightMode ? "text-black/40" : "text-white/30"}`}
          >
            Credentials are provided by the organizers.
          </p> */}
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
