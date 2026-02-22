export interface GitHubUser {
  login: string;
  avatar_url: string;
}

export interface NodeData {
  id: string;
  label: string;
  shape: string;
  image: string;
  size: number;
  font: { color: string; size: number };
  borderWidth: number;
  color: {
    border: string;
    highlight: { border: string };
    hover: { border: string };
  };
}

export type RelationshipType = "mutual" | "following" | "follower";

export interface EdgeData {
  from: string;
  to: string;
  arrows: string;
  color: { color: string; highlight: string };
  width: number;
  type: RelationshipType;
}

// Vibrant accent colours — chosen for legibility on #0d1117 dark background.
// These correspond to Tailwind's 400-level shades (bright but not harsh).
const GH = {
  purple: { edge: "#c084fc", highlight: "#d8b4fe" }, // purple-400 / purple-300
  green:  { edge: "#4ade80", highlight: "#86efac" }, // green-400  / green-300
  blue:   { edge: "#60a5fa", highlight: "#93c5fd" }, // blue-400   / blue-300
  amber: "#fb923c",                                  // orange-400 — hover ring
  text: "#f0f6fc",
} as const;

export function buildNodes(
  username: string,
  userData: GitHubUser,
  followers: GitHubUser[],
  following: GitHubUser[],
): NodeData[] {
  const followerSet = new Set(followers.map((f) => f.login));
  const followingSet = new Set(following.map((f) => f.login));

  const userMap = new Map<string, GitHubUser>();
  userMap.set(userData.login, userData);
  followers.forEach((u) => userMap.set(u.login, u));
  following.forEach((u) => userMap.set(u.login, u));

  return Array.from(userMap.values()).map((u) => {
    const isMutual = followerSet.has(u.login) && followingSet.has(u.login);
    const isFollower = followerSet.has(u.login) && !followingSet.has(u.login);
    const isTarget = u.login === username;

    const borderColor = isTarget
      ? GH.purple.edge
      : isMutual
        ? GH.purple.edge
        : isFollower
          ? GH.blue.edge
          : GH.green.edge;

    return {
      id: u.login,
      label: u.login,
      shape: "circularImage",
      image: u.avatar_url,
      size: isTarget ? 40 : 25,
      font: { color: GH.text, size: isTarget ? 16 : 12 },
      borderWidth: isTarget ? 4 : 2,
      color: {
        border: borderColor,
        highlight: { border: GH.amber },
        hover: { border: GH.amber },
      },
    };
  });
}

export function buildEdges(
  username: string,
  followers: GitHubUser[],
  following: GitHubUser[],
): EdgeData[] {
  const followerSet = new Set(followers.map((f) => f.login));
  const followingSet = new Set(following.map((f) => f.login));
  const edges: EdgeData[] = [];

  // Mutual follow — GitHub purple, bidirectional ⇔
  followers
    .filter((f) => followingSet.has(f.login))
    .forEach((f) => {
      edges.push({
        from: username,
        to: f.login,
        arrows: "to;from",
        color: { color: GH.purple.edge, highlight: GH.purple.highlight },
        width: 2,
        type: "mutual",
      });
    });

  // Follower only — GitHub blue, arrow pointing toward target ←
  followers
    .filter((f) => !followingSet.has(f.login))
    .forEach((f) => {
      edges.push({
        from: f.login,
        to: username,
        arrows: "to",
        color: { color: GH.blue.edge, highlight: GH.blue.highlight },
        width: 1,
        type: "follower",
      });
    });

  // Following only — GitHub green, arrow pointing away from target →
  following
    .filter((f) => !followerSet.has(f.login))
    .forEach((f) => {
      edges.push({
        from: username,
        to: f.login,
        arrows: "to",
        color: { color: GH.green.edge, highlight: GH.green.highlight },
        width: 1,
        type: "following",
      });
    });

  return edges;
}
