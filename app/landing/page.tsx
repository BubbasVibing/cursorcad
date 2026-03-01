"use client";

/**
 * LandingPage -- Marketing / splash page for CadOnCrack.
 *
 * Light white/violet theme with glass-morphism island navbar,
 * hero section with product screenshot, features section,
 * founders grid, and colorful footer.
 *
 * Route: /landing
 */

import Image from "next/image";
import Link from "next/link";

/* ==========================================================================
   Inline SVG Icon Components
   Using Heroicons paths -- avoids any icon-library dependency.
   ========================================================================== */

function SparkleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ==========================================================================
   Feature & Founder Data
   ========================================================================== */

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    title: "Natural Language to CAD",
    description:
      "Simply describe the part you need in plain English. CadBot understands dimensions, shapes, and mechanical intent to generate precise 3D models.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-2.995a3.81 3.81 0 0 1-.924-.163 3.183 3.183 0 0 1-2.163-2.909c-.025-.424-.05-.853-.05-1.283V6.385c0-1.866 1.368-3.477 3.29-3.727ZM15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
      </svg>
    ),
  },
  {
    title: "Instant 3D Preview",
    description:
      "Watch your model come to life in a real-time 3D viewport. Rotate, zoom, and inspect from every angle before exporting.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" />
      </svg>
    ),
  },
  {
    title: "Export to STL & 3MF",
    description:
      "Download print-ready files in STL or 3MF format. Compatible with all major 3D printers and slicing software.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: "Multi-Part Models",
    description:
      "Generate complex assemblies with multiple parts, each with its own color. Build anything from simple brackets to intricate mechanisms.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z" />
        <path d="m3.265 10.602 7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.13 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.71 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.738Z" />
        <path d="m10.933 19.231-7.668-4.13-1.37.739a.75.75 0 0 0 0 1.32l9.75 5.25a.75.75 0 0 0 .71 0l9.75-5.25a.75.75 0 0 0 0-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 0 1-2.134-.001Z" />
      </svg>
    ),
  },
  {
    title: "Iterative Refinement",
    description:
      "Chat back and forth with CadBot to tweak dimensions, add features, or change materials. Your AI co-designer remembers the full conversation context.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 0 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: "Engineering Tools",
    description:
      "Built-in measurement, cross-section, and transform tools. Inspect your model like a real CAD professional.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 0 1 6.775-5.025.75.75 0 0 1 .313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 0 1 1.248.313 5.25 5.25 0 0 1-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 1 1 2.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0 1 12 6.75ZM4.117 19.125a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

interface Founder {
  name: string;
  role: string;
  initials: string;
}

const FOUNDERS: Founder[] = [
  { name: "Ame Shajid", role: "Co-Founder", initials: "AS" },
  { name: "Yassine Mijane", role: "Co-Founder", initials: "YM" },
  { name: "Rafah Ajmayin", role: "Co-Founder", initials: "RA" },
  { name: "Niyaz Abdin", role: "Co-Founder", initials: "NA" },
];

/* ==========================================================================
   Page Component
   ========================================================================== */

export default function LandingPage() {
  const scrollTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb]">
      {/* ================================================================
          Island Navbar -- Compact, logo + login + get started only
          ================================================================ */}
      <nav className="fixed top-4 left-6 right-6 z-50">
        <div className="max-w-3xl mx-auto px-5 py-2 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-md shadow-gray-200/30">
          <div className="flex items-center justify-between">
            <Link href="/landing" className="flex-shrink-0">
              <Image
                src="/logo/platformlogo/cadoncracklogo-cropped.png"
                alt="CadOnCrack"
                width={180}
                height={44}
                className="h-10 w-auto"
                priority
              />
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/"
                className="bg-violet-500 hover:bg-violet-600 text-white text-xs font-semibold rounded-lg px-3.5 py-1.5 transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ================================================================
          Hero Section -- pushed down with more top padding
          ================================================================ */}
      <section className="relative flex flex-col items-center pt-44 sm:pt-52 pb-16 px-6">
        {/* Tagline badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200/60">
          <SparkleIcon className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium text-violet-600">
            More than a CAD tool
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1] text-center">
          Describe it.
          <br />
          <span className="text-violet-500">We&apos;ll build it.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto text-center leading-relaxed">
          Turn natural language into production-ready 3D models. Just describe
          the part you need, and CadBot generates print-ready STL files in
          seconds.
        </p>

        {/* Single CTA */}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-xl px-8 py-3.5 text-base transition-colors duration-200 shadow-lg shadow-violet-500/25"
          >
            Start Designing
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* Product screenshot with violet glow */}
        <div className="relative mt-16 sm:mt-20 w-full max-w-5xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-400/20 via-violet-300/10 to-violet-400/20 rounded-3xl blur-2xl" />
          <div className="relative rounded-2xl border border-gray-200/60 shadow-2xl shadow-gray-300/40 overflow-hidden bg-white">
            <Image
              src="/softwareimage/softwareimage.png"
              alt="CadOnCrack application interface"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* ================================================================
          Features Section
          ================================================================ */}
      <section id="features" className="py-24 sm:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Everything you need to design
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              From natural language input to print-ready files, CadBot gives
              you a complete AI-powered CAD workflow.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:shadow-violet-100/50 hover:border-violet-200/50 transition-all duration-300"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          Founders Section
          ================================================================ */}
      <section id="founders" className="py-24 sm:py-32 bg-[#f7f7fb]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Meet the Founders
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              The team behind CadOnCrack, building the future of accessible CAD
              design.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FOUNDERS.map((founder) => (
              <div
                key={founder.initials}
                className="flex flex-col items-center p-8 bg-white rounded-2xl border border-gray-100 shadow-md shadow-gray-200/50 hover:shadow-lg hover:shadow-violet-200/30 hover:border-violet-200/60 transition-all duration-300"
              >
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                  <span className="text-xl font-bold text-violet-600">
                    {founder.initials}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {founder.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{founder.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          Footer -- Colorful violet gradient
          ================================================================ */}
      <footer className="bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 text-white">
        <div className="max-w-5xl mx-auto px-6 py-14">
          {/* Top row: CTA banner */}
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold">
              Ready to start designing?
            </h3>
            <p className="mt-3 text-violet-200 text-base max-w-lg mx-auto">
              Join CadOnCrack and turn your ideas into 3D-printable reality.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-6 bg-white text-violet-700 font-semibold rounded-xl px-6 py-3 text-sm hover:bg-violet-50 transition-colors duration-200 shadow-lg shadow-black/10"
            >
              Get Started Free
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-white/20" />

          {/* Bottom row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/landing" className="flex-shrink-0">
              <Image
                src="/logo/platformlogo/cadoncracklogo-cropped.png"
                alt="CadOnCrack"
                width={120}
                height={28}
                className="h-7 w-auto brightness-0 invert opacity-80"
              />
            </Link>

            <div className="flex items-center gap-6 text-sm text-violet-200">
              <a
                href="#features"
                onClick={scrollTo("features")}
                className="hover:text-white transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#founders"
                onClick={scrollTo("founders")}
                className="hover:text-white transition-colors duration-200"
              >
                Founders
              </a>
              <Link
                href="/auth/signin"
                className="hover:text-white transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/"
                className="hover:text-white transition-colors duration-200"
              >
                App
              </Link>
            </div>

            <p className="text-sm text-violet-300">
              &copy; {new Date().getFullYear()} CadOnCrack
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
