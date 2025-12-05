"use client";
import MotionWrapper from "../../src/components/MotionWrapper";
import Link from "next/link";

export default function AboutPage() {
  return (
    <MotionWrapper>
      {/* container stays wide */}
      <section className="w-full max-w-[90rem] mx-auto px-10 py-28">

        <h1 className="text-6xl font-extrabold mb-16 leading-tight text-center">
          About{" "}
          <span
            style={{
              background: "linear-gradient(90deg,#06b6d4,#7c3aed)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            ReferralApp
          </span>
        </h1>

        {/* card is relative so we can absolutely position buttons at edges */}
        <div className="bg-white p-20 rounded-3xl shadow-2xl w-full relative">

          {/* content */}
          <h2 className="text-4xl font-semibold mb-12">Our Mission</h2>

          <p className="text-gray-600 leading-relaxed mb-12 text-2xl max-w-5xl">
            ReferralApp demonstrates how a clean, modern referral-credit system works.
            Users can create accounts, share referral codes, track conversions, and
            earn credits when referred users complete purchases.
          </p>

          <p className="text-gray-600 leading-relaxed mb-20 text-2xl max-w-5xl">
            The project blends a spacious UI, smooth animations, a solid backend,
            and intuitive UX patterns widely used in professional referral and customer
            reward systems.
          </p>

          <h2 className="text-3xl font-semibold mb-8">Tech Stack</h2>

          <ul className="list-disc ml-10 text-gray-700 text-2xl space-y-5 mb-28">
            <li>Next.js + React</li>
            <li>Global Tailwind Styling</li>
            <li>Express Backend</li>
            <li>MongoDB + Mongoose</li>
            <li>JWT Authentication</li>
          </ul>

          {/* ---------------------------
              DESKTOP: absolute buttons
              --------------------------- */}

          {/* ---------------------------
              MOBILE: stacked centered buttons
              --------------------------- */}
          <div className="md:hidden flex flex-col gap-4 items-center">
            <Link href="/" className="btn btn-primary px-8 py-3 text-lg w-11/12 text-center">
              ← Back to Home
            </Link>
            <Link href="/dashboard" className="btn btn-primary px-8 py-3 text-lg w-11/12 text-center">
              View Dashboard →
            </Link>
          </div>
        </div>
      </section>
    </MotionWrapper>
  );
}
