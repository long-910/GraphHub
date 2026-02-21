"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 backdrop-blur-md"
      style={{
        background: "rgba(13, 17, 23, 0.85)",
        borderBottom: "1px solid #21262d",
      }}
    >
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">
          {/* Gradient logo */}
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            <span className="gradient-text">Graph</span>
            <span style={{ color: "#4ade80" }}>Hub</span>
          </Link>

          <div className="flex items-center gap-3">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User avatar"}
                width={28}
                height={28}
                className="rounded-full"
                style={{ outline: "1.5px solid #30363d", outlineOffset: "1px" }}
              />
            )}
            <span className="text-sm" style={{ color: "#e6edf3" }}>
              {session.user.name}
            </span>
            <button
              onClick={() => void signOut()}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              style={{ border: "1px solid #30363d", color: "#8b949e" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(248,81,73,0.4)";
                e.currentTarget.style.color = "#f85149";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#30363d";
                e.currentTarget.style.color = "#8b949e";
              }}
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
