"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { buildNodes, buildEdges } from "~/lib/graphUtils";
import type { GitHubUser, EdgeData, RelationshipType } from "~/lib/graphUtils";

interface NetworkGraphProps {
  username: string;
}

type FilterType = "all" | RelationshipType;

interface FilterMeta {
  label: string;
  value: FilterType;
  color: string;
  glow: string;
}

const FILTER_META: FilterMeta[] = [
  { label: "すべて",        value: "all",      color: "#8b949e", glow: "rgba(139,148,158,0.25)" },
  { label: "相互 ⇔",        value: "mutual",   color: "#c084fc", glow: "rgba(192,132,252,0.3)"  },
  { label: "フォロー中 →",  value: "following", color: "#4ade80", glow: "rgba(74,222,128,0.3)"   },
  { label: "フォロワー ←",  value: "follower",  color: "#60a5fa", glow: "rgba(96,165,250,0.3)"   },
];

// SWR fetcher — return type is inferred from useSWR<T> generics at call sites
const fetcher = (url: string): Promise<any> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

export function NetworkGraph({ username }: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<{ destroy: () => void } | null>(null);
  const edgesDataSetRef = useRef<{
    clear: () => void;
    add: (items: any[]) => void;
  } | null>(null);
  const allEdgesRef = useRef<EdgeData[]>([]);
  const router = useRouter();

  const [filter, setFilter] = useState<FilterType>("all");

  const { data: userData, error: userError } = useSWR<GitHubUser>(
    `/api/github/user/${username}`,
    fetcher,
  );
  const { data: followers, error: followersError } = useSWR<GitHubUser[]>(
    `/api/github/followers/${username}`,
    fetcher,
  );
  const { data: following, error: followingError } = useSWR<GitHubUser[]>(
    `/api/github/following/${username}`,
    fetcher,
  );

  // Initialise vis-network once all data arrives
  useEffect(() => {
    if (!containerRef.current || !userData || !followers || !following) return;

    const container = containerRef.current;

    const initNetwork = async () => {
      const { Network, DataSet } = await import("vis-network/standalone");

      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }

      const nodesArray = buildNodes(username, userData, followers, following);
      const edgesArray = buildEdges(username, followers, following);
      allEdgesRef.current = edgesArray;

      const nodesDS = new DataSet(nodesArray);
      // Cast: EdgeData has a custom `type` field not in vis-network's Edge type
      const edgesDS = new DataSet(edgesArray as any[]);
      edgesDataSetRef.current = edgesDS;

      const network = new Network(
        container,
        { nodes: nodesDS, edges: edgesDS as any },
        {
          physics: {
            enabled: true,
            stabilization: { iterations: 200, updateInterval: 20 },
            barnesHut: {
              gravitationalConstant: -10000,
              springLength: 140,
              springConstant: 0.04,
              damping: 0.12,
            },
          },
          interaction: { hover: true, zoomView: true, dragView: true, tooltipDelay: 200 },
          nodes: {
            shape: "circularImage",
            shadow: { enabled: true, color: "rgba(0,0,0,0.6)", size: 14, x: 3, y: 4 },
          },
          edges: {
            smooth: { enabled: true, type: "dynamic", roundness: 0.4 },
            shadow: { enabled: true, color: "rgba(0,0,0,0.35)", size: 6, x: 2, y: 2 },
          },
        },
      );

      network.on("click", (params: { nodes: string[] }) => {
        const clicked = params.nodes[0];
        if (clicked && clicked !== username) {
          router.push(`/graph/${clicked}`);
        }
      });

      networkRef.current = { destroy: () => network.destroy() };
    };

    void initNetwork();

    return () => {
      networkRef.current?.destroy();
      networkRef.current = null;
    };
  }, [userData, followers, following, username, router]);

  // Re-filter edges whenever the user toggles a filter
  useEffect(() => {
    if (!edgesDataSetRef.current) return;
    const filtered =
      filter === "all"
        ? allEdgesRef.current
        : allEdgesRef.current.filter((e) => e.type === filter);
    edgesDataSetRef.current.clear();
    edgesDataSetRef.current.add(filtered);
  }, [filter]);

  // --- Export helpers ---

  const exportPNG = useCallback(() => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = (canvas as HTMLCanvasElement).toDataURL("image/png");
    triggerDownload(url, `graphhub-${username}.png`);
  }, [username]);

  const exportJSON = useCallback(() => {
    if (!userData || !followers || !following) return;
    const report = {
      user: username,
      generated: new Date().toISOString(),
      summary: {
        total_nodes: new Set([
          username,
          ...followers.map((f) => f.login),
          ...following.map((f) => f.login),
        ]).size,
        mutual: allEdgesRef.current.filter((e) => e.type === "mutual").length,
        followers_only: allEdgesRef.current.filter((e) => e.type === "follower").length,
        following_only: allEdgesRef.current.filter((e) => e.type === "following").length,
      },
      edges: allEdgesRef.current.map((e) => ({
        from: e.from,
        to: e.to,
        relationship: e.type,
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    triggerBlobDownload(blob, `graphhub-${username}.json`);
  }, [username, userData, followers, following]);

  const exportCSV = useCallback(() => {
    if (!allEdgesRef.current.length) return;
    const rows = [
      "from,to,relationship",
      ...allEdgesRef.current.map((e) => `${e.from},${e.to},${e.type}`),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    triggerBlobDownload(blob, `graphhub-${username}.csv`);
  }, [username]);

  // --- Derived counts for legend ---
  const mutualCount = allEdgesRef.current.filter((e) => e.type === "mutual").length;
  const followingCount = allEdgesRef.current.filter((e) => e.type === "following").length;
  const followerCount = allEdgesRef.current.filter((e) => e.type === "follower").length;

  const error = userError ?? followersError ?? followingError;
  const isLoading = !userData || !followers || !following;

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: "#f85149" }}>
          {error instanceof Error ? error.message : "データの取得に失敗しました"}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* ---- Top toolbar: filters + export ---- */}
      {!isLoading && (
        <div className="absolute left-2 right-2 top-2 z-10 flex flex-wrap items-center justify-between gap-2">
          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_META.map(({ label, value, color, glow }) => {
              const isActive = filter === value;
              return (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className="rounded-full px-3 py-1 text-xs font-medium transition-all duration-150"
                  style={
                    isActive
                      ? {
                          background: `${color}18`,
                          color,
                          border: `1px solid ${color}70`,
                          boxShadow: `0 0 14px ${glow}`,
                        }
                      : {
                          background: "rgba(22,27,34,0.8)",
                          color: "#8b949e",
                          border: "1px solid #30363d",
                        }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Export buttons */}
          <div className="flex gap-1.5">
            {(
              [
                { label: "PNG",  fn: exportPNG },
                { label: "JSON", fn: exportJSON },
                { label: "CSV",  fn: exportCSV },
              ] as const
            ).map(({ label, fn }) => (
              <button
                key={label}
                onClick={fn}
                className="rounded-md px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background: "rgba(22,27,34,0.8)",
                  color: "#8b949e",
                  border: "1px solid #30363d",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#e6edf3";
                  e.currentTarget.style.borderColor = "#58a6ff60";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8b949e";
                  e.currentTarget.style.borderColor = "#30363d";
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Legend (bottom-right) ---- */}
      {!isLoading && (
        <div
          className="absolute bottom-4 right-4 z-10 rounded-xl p-3.5 text-xs backdrop-blur-md"
          style={{
            background: "rgba(13,17,23,0.85)",
            border: "1px solid #21262d",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          <p className="mb-2.5 text-xs font-semibold" style={{ color: "#f0f6fc" }}>
            凡例
          </p>
          <div className="flex flex-col gap-2">
            <GlowRow color="#c084fc" label="相互フォロー ⇔" count={mutualCount} />
            <GlowRow color="#4ade80" label="フォロー中 →"   count={followingCount} />
            <GlowRow color="#60a5fa" label="フォロワー ←"   count={followerCount} />
          </div>
        </div>
      )}

      {/* ---- Loading state ---- */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            {/* Dual-ring spinner */}
            <div className="relative h-12 w-12">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: "2px solid #21262d",
                  borderTopColor: "#c084fc",
                  animation: "spin-smooth 1s linear infinite",
                }}
              />
              <div
                className="absolute inset-1.5 rounded-full"
                style={{
                  border: "2px solid #21262d",
                  borderTopColor: "#4ade80",
                  animation: "spin-smooth 0.7s linear infinite reverse",
                }}
              />
            </div>
            <p className="text-sm" style={{ color: "#8b949e" }}>
              データを読み込み中…
            </p>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="h-full w-full rounded-lg"
        style={{ background: "#0d1117" }}
      />
    </div>
  );
}

// Glowing dot row used in the legend
function GlowRow({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="shrink-0 rounded-full"
        style={{
          width: 8,
          height: 8,
          background: color,
          boxShadow: `0 0 6px ${color}, 0 0 12px ${color}60`,
        }}
      />
      <span style={{ color: "#8b949e" }} className="whitespace-nowrap">
        {label}
      </span>
      <span
        className="ml-1 rounded-full px-1.5 text-[10px] font-medium tabular-nums"
        style={{ background: "#21262d", color: "#8b949e" }}
      >
        {count}
      </span>
    </div>
  );
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}
