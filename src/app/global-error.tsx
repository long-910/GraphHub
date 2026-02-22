"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950">
          <div className="text-center">
            <h1 className="mb-4 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-6xl font-bold text-transparent">
              エラーが発生しました
            </h1>
            <p className="mb-8 text-xl text-indigo-200/70">
              {error.message}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => reset()}
                className="rounded-lg bg-indigo-500 px-6 py-3 text-white transition hover:bg-indigo-600"
              >
                再試行
              </button>
              <Link
                href="/"
                className="rounded-lg bg-indigo-500 px-6 py-3 text-white transition hover:bg-indigo-600"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 
