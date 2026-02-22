import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";

// ---------------------------------------------------------------------------
// Hoist mocks so they're available inside vi.mock() factory functions
// ---------------------------------------------------------------------------

const mockAuth = vi.hoisted(() => vi.fn());

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("~/server/auth", () => ({
  auth: mockAuth,
}));

// Replace NextResponse with a minimal Web-API-compatible implementation so
// route handlers can run outside the Next.js runtime.
vi.mock("next/server", () => ({
  NextResponse: {
    json(body: unknown, init?: { status?: number }) {
      return new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  },
}));

// ---------------------------------------------------------------------------
// Import route handlers after mocks are declared
// ---------------------------------------------------------------------------

import { GET as getUserGET } from "~/app/api/github/user/[username]/route";
import { GET as followersGET } from "~/app/api/github/followers/[username]/route";
import { GET as followingGET } from "~/app/api/github/following/[username]/route";

// ---------------------------------------------------------------------------
// Fixtures — fictional users only, not based on any real person
// ---------------------------------------------------------------------------

const AUTHED_SESSION: Session = {
  user: {
    id: "1",
    accessToken: "gh-test-token",
    name: "Test User",
    email: null,
    image: null,
  },
  expires: "2099-01-01",
};

const MOCK_GITHUB_USER = {
  login: "testuser",
  avatar_url: "https://example.com/avatars/testuser.png",
  name: "Test User",
};

const MOCK_FOLLOWERS = [
  { login: "user-a", avatar_url: "https://example.com/avatars/user-a.png" },
];

type RouteParams = { params: { username: string } };
const makeParams = (username: string): RouteParams => ({
  params: { username },
});
const makeRequest = (url: string) => new Request(url);

// ---------------------------------------------------------------------------
// /api/github/user/:username
// ---------------------------------------------------------------------------

describe("GET /api/github/user/:username", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await getUserGET(
      makeRequest("http://localhost/api/github/user/testuser"),
      makeParams("testuser"),
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("proxies GitHub user data when authenticated", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_GITHUB_USER,
    });

    const res = await getUserGET(
      makeRequest("http://localhost/api/github/user/testuser"),
      makeParams("testuser"),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.login).toBe("testuser");
  });

  it("sends the access token as Bearer auth to GitHub", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_GITHUB_USER,
    });
    global.fetch = fetchMock;

    await getUserGET(
      makeRequest("http://localhost/api/github/user/testuser"),
      makeParams("testuser"),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/users/testuser",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer gh-test-token",
        }),
      }),
    );
  });

  it("forwards non-200 status codes from GitHub", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION);
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    const res = await getUserGET(
      makeRequest("http://localhost/api/github/user/nonexistent"),
      makeParams("nonexistent"),
    );

    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// /api/github/followers/:username
// ---------------------------------------------------------------------------

describe("GET /api/github/followers/:username", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await followersGET(
      makeRequest("http://localhost/api/github/followers/testuser"),
      makeParams("testuser"),
    );

    expect(res.status).toBe(401);
  });

  it("requests per_page=100 from GitHub", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_FOLLOWERS,
    });
    global.fetch = fetchMock;

    await followersGET(
      makeRequest("http://localhost/api/github/followers/testuser"),
      makeParams("testuser"),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("per_page=100"),
      expect.any(Object),
    );
  });

  it("returns follower array from GitHub", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_FOLLOWERS,
    });

    const res = await followersGET(
      makeRequest("http://localhost/api/github/followers/testuser"),
      makeParams("testuser"),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].login).toBe("user-a");
  });
});

// ---------------------------------------------------------------------------
// /api/github/following/:username
// ---------------------------------------------------------------------------

describe("GET /api/github/following/:username", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await followingGET(
      makeRequest("http://localhost/api/github/following/testuser"),
      makeParams("testuser"),
    );

    expect(res.status).toBe(401);
  });

  it("requests per_page=100 from GitHub", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    global.fetch = fetchMock;

    await followingGET(
      makeRequest("http://localhost/api/github/following/testuser"),
      makeParams("testuser"),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("per_page=100"),
      expect.any(Object),
    );
  });

  it("forwards GitHub errors (e.g. rate limit 403)", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION);
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 });

    const res = await followingGET(
      makeRequest("http://localhost/api/github/following/testuser"),
      makeParams("testuser"),
    );

    expect(res.status).toBe(403);
  });
});
