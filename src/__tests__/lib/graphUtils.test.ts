import { describe, it, expect } from "vitest";
import { buildEdges, buildNodes } from "~/lib/graphUtils";
import type { GitHubUser } from "~/lib/graphUtils";

// Vibrant accent palette used by graphUtils (Tailwind 400-level shades)
const COLOR = {
  mutual:    "#c084fc", // purple-400
  follower:  "#60a5fa", // blue-400
  following: "#4ade80", // green-400
} as const;

const target: GitHubUser = {
  login: "torvalds",
  avatar_url: "https://avatars.githubusercontent.com/u/1024025",
};
const alice: GitHubUser = {
  login: "alice",
  avatar_url: "https://avatars.githubusercontent.com/u/1",
};
const bob: GitHubUser = {
  login: "bob",
  avatar_url: "https://avatars.githubusercontent.com/u/2",
};
const carol: GitHubUser = {
  login: "carol",
  avatar_url: "https://avatars.githubusercontent.com/u/3",
};

// ---------------------------------------------------------------------------
// buildEdges
// ---------------------------------------------------------------------------
describe("buildEdges", () => {
  it("mutual follow → purple bidirectional arrows with type=mutual", () => {
    const edges = buildEdges("torvalds", [alice], [alice]);
    expect(edges).toHaveLength(1);
    const [edge] = edges;
    expect(edge?.arrows).toBe("to;from");
    expect(edge?.color.color).toBe(COLOR.mutual);
    expect(edge?.type).toBe("mutual");
  });

  it("follower only → blue arrow from follower to target with type=follower", () => {
    const edges = buildEdges("torvalds", [bob], []);
    expect(edges).toHaveLength(1);
    const [edge] = edges;
    expect(edge?.from).toBe("bob");
    expect(edge?.to).toBe("torvalds");
    expect(edge?.arrows).toBe("to");
    expect(edge?.color.color).toBe(COLOR.follower);
    expect(edge?.type).toBe("follower");
  });

  it("following only → green arrow from target to followed user with type=following", () => {
    const edges = buildEdges("torvalds", [], [carol]);
    expect(edges).toHaveLength(1);
    const [edge] = edges;
    expect(edge?.from).toBe("torvalds");
    expect(edge?.to).toBe("carol");
    expect(edge?.arrows).toBe("to");
    expect(edge?.color.color).toBe(COLOR.following);
    expect(edge?.type).toBe("following");
  });

  it("mixed: alice=mutual, bob=follower, carol=following → 3 edges", () => {
    const edges = buildEdges("torvalds", [alice, bob], [alice, carol]);
    expect(edges).toHaveLength(3);

    const mutualEdge = edges.find((e) => e.to === "alice");
    expect(mutualEdge?.color.color).toBe(COLOR.mutual);
    expect(mutualEdge?.arrows).toBe("to;from");
    expect(mutualEdge?.type).toBe("mutual");

    const followerEdge = edges.find((e) => e.from === "bob");
    expect(followerEdge?.color.color).toBe(COLOR.follower);
    expect(followerEdge?.type).toBe("follower");

    const followingEdge = edges.find((e) => e.to === "carol");
    expect(followingEdge?.color.color).toBe(COLOR.following);
    expect(followingEdge?.type).toBe("following");
  });

  it("no followers and no following → empty edges", () => {
    expect(buildEdges("torvalds", [], [])).toHaveLength(0);
  });

  it("mutual edges have greater width than one-way edges", () => {
    const edges = buildEdges("torvalds", [alice, bob], [alice]);
    const mutualEdge = edges.find((e) => e.to === "alice")!;
    const followerEdge = edges.find((e) => e.from === "bob")!;
    expect(mutualEdge.width).toBeGreaterThan(followerEdge.width);
  });
});

// ---------------------------------------------------------------------------
// buildNodes
// ---------------------------------------------------------------------------
describe("buildNodes", () => {
  it("target node has larger size and purple border", () => {
    const nodes = buildNodes("torvalds", target, [], []);
    const node = nodes.find((n) => n.id === "torvalds");
    expect(node?.size).toBe(40);
    expect(node?.color.border).toBe(COLOR.mutual);
    expect(node?.borderWidth).toBe(4);
  });

  it("mutual user has purple border", () => {
    const nodes = buildNodes("torvalds", target, [alice], [alice]);
    const node = nodes.find((n) => n.id === "alice");
    expect(node?.color.border).toBe(COLOR.mutual);
  });

  it("follower-only node has blue border", () => {
    const nodes = buildNodes("torvalds", target, [bob], []);
    const node = nodes.find((n) => n.id === "bob");
    expect(node?.color.border).toBe(COLOR.follower);
  });

  it("following-only node has green border", () => {
    const nodes = buildNodes("torvalds", target, [], [carol]);
    const node = nodes.find((n) => n.id === "carol");
    expect(node?.color.border).toBe(COLOR.following);
  });

  it("user appearing in both lists is deduplicated to one node", () => {
    const nodes = buildNodes("torvalds", target, [alice], [alice]);
    const aliceNodes = nodes.filter((n) => n.id === "alice");
    expect(aliceNodes).toHaveLength(1);
  });

  it("nodes use circularImage shape with avatar URL", () => {
    const nodes = buildNodes("torvalds", target, [alice], []);
    const node = nodes.find((n) => n.id === "alice");
    expect(node?.shape).toBe("circularImage");
    expect(node?.image).toBe(alice.avatar_url);
  });

  it("target node label equals username", () => {
    const nodes = buildNodes("torvalds", target, [], []);
    const node = nodes.find((n) => n.id === "torvalds");
    expect(node?.label).toBe("torvalds");
  });

  it("all users (target + followers + following) appear as nodes", () => {
    const nodes = buildNodes("torvalds", target, [alice, bob], [carol]);
    const ids = nodes.map((n) => n.id);
    expect(ids).toContain("torvalds");
    expect(ids).toContain("alice");
    expect(ids).toContain("bob");
    expect(ids).toContain("carol");
  });
});
