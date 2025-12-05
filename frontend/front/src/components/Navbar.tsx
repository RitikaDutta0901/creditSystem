"use client";

import Link from "next/link";
import { useUserStore } from "../store/useUserStore";

export default function NavBar() {
  const user = useUserStore((s) => s.user);

  return (
    <nav className="flex items-center justify-between">
      {/* LOGO */}
      <Link href="/" className="flex items-center gap-2 font-bold text-lg">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 grid place-items-center text-white">
          R
        </span>
        <div>
          <div>ReferralApp</div>
          <div className="text-[11px] text-blue-600 font-medium">Refer friends • Earn credits</div>
        </div>
      </Link>

      {/* NAV LINKS */}
      <div className="flex items-center gap-6">
        <Link href="/" className="nav-link">Home</Link>
        <Link href="/dashboard" className="nav-link">Dashboard</Link>
        <Link href="/about" className="nav-link">About</Link>

        {/* USER SECTION */}
        {user ? (
          // NOTE: this goes to /profile (different from /dashboard)
          <Link href="/profile" className="nav-cta">
            Hi, {user.name ?? "User"}
          </Link>
        ) : (
          <>
            <Link href="/login" className="nav-link">Login</Link>
            <Link href="/register" className="nav-cta">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
