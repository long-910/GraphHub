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
        <label htmlFor="username" className="text-sm font-medium text-foreground">
          ユーザー名
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="GitHubのユーザー名を入力"
          className="rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        相関図を表示
      </button>
    </form>
  );
} 
