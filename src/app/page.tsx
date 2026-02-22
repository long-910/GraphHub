import { UsernameForm } from "./_components/UsernameForm";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[480px] w-[480px] translate-x-1/2 translate-y-1/2 rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="container relative flex max-w-lg flex-col items-center gap-10">
        {/* Hero text */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            <span className="gradient-text">Graph</span>
            <span style={{ color: "#4ade80" }}>Hub</span>
          </h1>
          <p style={{ color: "#8b949e" }} className="text-base">
            GitHub ユーザー名を入力して、フォロワー関係を可視化
          </p>
        </div>

        {/* Form card */}
        <div
          className="w-full rounded-2xl p-6"
          style={{
            background: "#161b22",
            border: "1px solid #21262d",
            boxShadow: "0 0 40px rgba(0,0,0,0.4)",
          }}
        >
          <UsernameForm />
        </div>
      </div>
    </main>
  );
}
