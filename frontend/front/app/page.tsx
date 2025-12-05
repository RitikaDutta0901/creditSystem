"use client";
import React from "react";
import MotionWrapper from "../src/components/MotionWrapper";
import Link from "next/link";

export default function Home() {
  return (
    <MotionWrapper>
      <section className="home-hero app-container">

        {/* LEFT SIDE */}
        <div className="home-left">
          <h1 className="home-title">
            Refer friends.{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#06b6d4,#7c3aed)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Earn credits.
            </span>{" "}
            Repeat.
          </h1>

          <p className="home-desc">
            Share your personal referral link and get rewarded when friends make
            their first purchase. Track everything from your dashboard and
            redeem credits instantly.
          </p>

          <div className="home-buttons">
            <Link href="/register" className="btn btn-primary">
              Get started
            </Link>

            <Link href="/dashboard" className="btn-secondary">
              View Dashboard
            </Link>
          </div>

          <p className="pro-tip">
            <strong>Pro tip:</strong> copy your referral link from the dashboard
            and paste it in your socials.
          </p>
        </div>

        {/* RIGHT SIDE EXAMPLE CARD */}
        <div className="home-example-card right-card-bg">
          <div className="mb-3 text-sm text-gray-500">Example</div>

          <div className="text-lg font-semibold mb-1">
            ReferralCode: <span className="font-mono">ABC123XY</span>
          </div>

          <div className="text-gray-700 mb-4">
            Referred: <strong>4</strong> • Converted: <strong>2</strong> •
            Credits: <strong>6</strong>
          </div>

          <div className="flex gap-3">
            <button className="btn btn-primary px-5">Copy link</button>
            <Link
              href="/dashboard"
              className="btn-secondary px-5"
              style={{ display: "flex", alignItems: "center" }}
            >
              Open dashboard
            </Link>
          </div>
        </div>

      </section>
    </MotionWrapper>
  );
}
