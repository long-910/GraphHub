import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "~/server/auth";
import { NetworkGraph } from "./_components/NetworkGraph";

export default async function GraphPage({
  params,
}: {
  params: { username: string };
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="flex min-h-screen flex-col bg-background pt-12">
      <div className="flex flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-bold" style={{ color: "#f0f6fc" }}>
              <span className="gradient-text">{params.username}</span>
              <span style={{ color: "#8b949e" }} className="ml-2 text-base font-normal">
                のフォロワー関係
              </span>
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
            style={{ border: "1px solid #30363d", color: "#8b949e" }}
          >
            ← 戻る
          </Link>
        </div>

        {/* Graph card */}
        <div
          className="h-[calc(100vh-7rem)] w-full rounded-2xl"
          style={{
            border: "1px solid #21262d",
            background: "#161b22",
            boxShadow: "0 0 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
            overflow: "hidden",
          }}
        >
          <NetworkGraph username={params.username} />
        </div>
      </div>
    </main>
  );
}
