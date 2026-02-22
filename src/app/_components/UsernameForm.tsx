"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UsernameForm() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      router.push(`/graph/${encodeURIComponent(username.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-medium" style={{ color: "#c9d1d9" }}>
          ユーザー名
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="GitHubのユーザー名を入力"
          className="rounded-md px-3 py-2 outline-none transition-colors placeholder:[color:#6e7681]"
          style={{
            background: "#0d1117",
            border: "1px solid #30363d",
            color: "#e6edf3",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#58a6ff")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#30363d")}
          required
        />
      </div>
      <button
        type="submit"
        className="rounded-md px-4 py-2 font-medium transition-colors"
        style={{ background: "#238636", color: "#ffffff" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#2ea043")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#238636")}
      >
        相関図を表示
      </button>
    </form>
  );
} 
