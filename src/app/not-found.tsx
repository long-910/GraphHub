"use client";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950">
      <div className="text-center">
        <h1 className="mb-4 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-6xl font-bold text-transparent">
          404
        </h1>
        <p className="mb-8 text-xl text-indigo-200/70">
          ページが見つかりませんでした
        </p>
        <a
          href="/"
          className="rounded-lg bg-indigo-500 px-6 py-3 text-white transition hover:bg-indigo-600"
        >
          ホームに戻る
        </a>
      </div>
    </div>
  );
}
