import React from "react";
import "../styles/global.css";
import AuthProvider from "../src/components/AuthProvider";
import NavBar from "../src/components/Navbar";

export const metadata = {
  title: "Referral & Credits",
  description: "Referral & credit demo app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg-from)]">
        <AuthProvider>
          <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-sm">
            <div className="app-container">
              <div className="py-4">
                <NavBar />
              </div>
            </div>
          </header>

          <main className="app-container pt-12">
            {children}
          </main>

          <footer className="app-container py-10 text-sm text-gray-500">
            © {new Date().getFullYear()} ReferralApp — Built with ❤️
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
