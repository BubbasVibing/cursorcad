"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(
          mode === "signin"
            ? "Invalid email or password"
            : "Account created but sign-in failed. Try signing in.",
        );
        if (mode === "signup") setMode("signin");
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7fb]">
      {/* Subtle violet radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.08),transparent_60%)]" />

      <div className="relative w-full max-w-sm mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-8 shadow-2xl">
          {/* Logo + Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 mb-4 overflow-hidden">
              <img
                src="/logo/logofavicon/cadoncrackfavicon.png"
                alt="CadOnCrack logo"
                className="h-12 w-12 object-cover scale-[1.6]"
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">CadOnCrack</h1>
            <p className="text-sm text-gray-400 mt-1">
              {mode === "signin"
                ? "Sign in to save your designs"
                : "Create an account to get started"}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="mb-5">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(""); }}
                className={`
                  flex-1 py-2 text-xs font-medium rounded-md
                  transition-all duration-150
                  ${mode === "signin"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className={`
                  flex-1 py-2 text-xs font-medium rounded-md
                  transition-all duration-150
                  ${mode === "signup"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name field — only in signup mode */}
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-500 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="
                    w-full h-10 px-3 rounded-xl
                    border border-gray-200 bg-white/80
                    text-sm text-gray-800 placeholder:text-gray-400
                    focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20
                    transition-all duration-150
                  "
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="
                  w-full h-10 px-3 rounded-xl
                  border border-gray-200 bg-white/80
                  text-sm text-gray-800 placeholder:text-gray-400
                  focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20
                  transition-all duration-150
                "
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-500 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                className="
                  w-full h-10 px-3 rounded-xl
                  border border-gray-200 bg-white/80
                  text-sm text-gray-800 placeholder:text-gray-400
                  focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20
                  transition-all duration-150
                "
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-red-500 text-center py-1">{error}</p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="
                flex w-full items-center justify-center
                bg-violet-500 text-white rounded-xl h-11
                text-sm font-medium
                hover:bg-violet-600 active:scale-[0.98]
                disabled:opacity-50 disabled:pointer-events-none
                transition-all duration-150
                cursor-pointer
              "
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google sign-in button */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="
              flex w-full items-center justify-center gap-3
              bg-white text-gray-700 rounded-xl h-11
              text-sm font-medium
              border border-gray-200 shadow-sm
              hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]
              transition-all duration-150
              cursor-pointer
            "
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Skip option */}
          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-xs text-gray-400 hover:text-violet-500 transition-colors"
            >
              Continue without signing in
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Natural language to 3D print file
        </p>
      </div>
    </div>
  );
}
