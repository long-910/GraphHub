import { describe, it, expect } from "vitest";
import { buildEdges, buildNodes } from "~/lib/graphUtils";
import type { GitHubUser } from "~/lib/graphUtils";

// Vibrant accent palette used by graphUtils (Tailwind 400-level shades)
const COLOR = {
  mutual:    "#c084fc", // purple-400
  follower:  "#60a5fa", // blue-400
  following: "#4ade80", // green-400
} as const;

// Fictional test fixtures — not based on any real person
const target: GitHubUser = {
  login: "testuser",
  avatar_url: "https://example.com/avatars/testuser.png",
};
const userA: GitHubUser = {
  login: "user-a",
  avatar_url: "https://example.com/avatars/user-a.png",
};
const userB: GitHubUser = {
  login: "user-b",
  avatar_url: "https://example.com/avatars/user-b.png",
};
const userC: GitHubUser = {
  login: "user-c",
  avatar_url: "https://example.com/avatars/user-c.png",
};

// ---------------------------------------------------------------------------
// buildEdges
// ---------------------------------------------------------------------------
describe("buildEdges", () => {
  it("mutual follow → purple bidirectional arrows with type=mutual", () => {
    const edges = buildEdges("testuser", [userA], [userA]);
    expect(edges).toHaveLength(1);
    const [edge] = edges;
    expect(edge?.arrows).toBe("to;from");
    expect(edge?.color.color).toBe(COLOR.mutual);
    expect(edge?.type).toBe("mutual");
  });

  it("follower only → blue arrow from follower to target with type=follower", () => {
    const edges = buildEdges("testuser", [userB], []);
    expect(edges).toHaveLength(1);
    const [edge] = edges;
    expect(edge?.from).toBe("user-b");
    expect(edge?.to).toBe("testuser");
    expect(edge?.arrows).toBe("to");
    expect(edge?.color.color).toBe(COLOR.follower);
    expect(edge?.type).toBe("follower");
  });

  it("following only → green arrow from target to followed user with type=following", () => {
    const edges = buildEdges("testuser", [], [userC]);
    expect(edges).toHaveLength(1);
    const [edge] = edges;
    expect(edge?.from).toBe("testuser");
    expect(edge?.to).toBe("user-c");
    expect(edge?.arrows).toBe("to");
    expect(edge?.color.color).toBe(COLOR.following);
    expect(edge?.type).toBe("following");
  });

  it("mixed: user-a=mutual, user-b=follower, user-c=following → 3 edges", () => {
    const edges = buildEdges("testuser", [userA, userB], [userA, userC]);
    expect(edges).toHaveLength(3);

    const mutualEdge = edges.find((e) => e.to === "user-a");
    expect(mutualEdge?.color.color).toBe(COLOR.mutual);
    expect(mutualEdge?.arrows).toBe("to;from");
    expect(mutualEdge?.type).toBe("mutual");

    const followerEdge = edges.find((e) => e.from === "user-b");
    expect(followerEdge?.color.color).toBe(COLOR.follower);
    expect(followerEdge?.type).toBe("follower");

    const followingEdge = edges.find((e) => e.to === "user-c");
    expect(followingEdge?.color.color).toBe(COLOR.following);
    expect(followingEdge?.type).toBe("following");
  });

  it("no followers and no following → empty edges", () => {
    expect(buildEdges("testuser", [], [])).toHaveLength(0);
  });

  it("mutual edges have greater width than one-way edges", () => {
    const edges = buildEdges("testuser", [userA, userB], [userA]);
    const mutualEdge = edges.find((e) => e.to === "user-a")!;
    const followerEdge = edges.find((e) => e.from === "user-b")!;
    expect(mutualEdge.width).toBeGreaterThan(followerEdge.width);
  });
});

// ---------------------------------------------------------------------------
// buildNodes
// ---------------------------------------------------------------------------
describe("buildNodes", () => {
  it("target node has larger size and purple border", () => {
    const nodes = buildNodes("testuser", target, [], []);
    const node = nodes.find((n) => n.id === "testuser");
    expect(node?.size).toBe(40);
    expect(node?.color.border).toBe(COLOR.mutual);
    expect(node?.borderWidth).toBe(4);
  });

  it("mutual user has purple border", () => {
    const nodes = buildNodes("testuser", target, [userA], [userA]);
    const node = nodes.find((n) => n.id === "user-a");
    expect(node?.color.border).toBe(COLOR.mutual);
  });

  it("follower-only node has blue border", () => {
    const nodes = buildNodes("testuser", target, [userB], []);
    const node = nodes.find((n) => n.id === "user-b");
    expect(node?.color.border).toBe(COLOR.follower);
  });

  it("following-only node has green border", () => {
    const nodes = buildNodes("testuser", target, [], [userC]);
    const node = nodes.find((n) => n.id === "user-c");
    expect(node?.color.border).toBe(COLOR.following);
  });

  it("user appearing in both lists is deduplicated to one node", () => {
    const nodes = buildNodes("testuser", target, [userA], [userA]);
    const dupes = nodes.filter((n) => n.id === "user-a");
    expect(dupes).toHaveLength(1);
  });

  it("nodes use circularImage shape with avatar URL", () => {
    const nodes = buildNodes("testuser", target, [userA], []);
    const node = nodes.find((n) => n.id === "user-a");
    expect(node?.shape).toBe("circularImage");
    expect(node?.image).toBe(userA.avatar_url);
  });

  it("target node label equals username", () => {
    const nodes = buildNodes("testuser", target, [], []);
    const node = nodes.find((n) => n.id === "testuser");
    expect(node?.label).toBe("testuser");
  });

  it("all users (target + followers + following) appear as nodes", () => {
    const nodes = buildNodes("testuser", target, [userA, userB], [userC]);
    const ids = nodes.map((n) => n.id);
    expect(ids).toContain("testuser");
    expect(ids).toContain("user-a");
    expect(ids).toContain("user-b");
    expect(ids).toContain("user-c");
  });
});
