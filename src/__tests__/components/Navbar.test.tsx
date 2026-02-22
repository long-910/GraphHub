import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Session } from "next-auth";
import { Navbar } from "~/app/_components/Navbar";

// ---------------------------------------------------------------------------
// Hoist mocks so factory functions can reference them
// ---------------------------------------------------------------------------

const mockUseSession = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("next-auth/react", () => ({
  useSession: mockUseSession,
  signOut: mockSignOut,
}));

// next/image → lightweight substitute (avoids Next.js image optimisation)
vi.mock("next/image", () => ({
  default: function MockImage({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }) {
    return (
      <span
        role="img"
        aria-label={alt}
        data-src={src}
        data-width={width}
        data-height={height}
        className={className}
      />
    );
  },
}));

// next/link → plain <a> anchor
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// ---------------------------------------------------------------------------
// Fixtures — fictional users only, not based on any real person
// ---------------------------------------------------------------------------

const SESSION_WITH_IMAGE: Session = {
  user: {
    id: "1",
    name: "Test User",
    email: "testuser@example.com",
    image: "https://example.com/avatars/testuser.png",
  },
  expires: "2099-01-01",
};

const SESSION_WITHOUT_IMAGE: Session = {
  user: { id: "2", name: "Test User 2", email: null, image: null },
  expires: "2099-01-01",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Navbar", () => {
  beforeEach(() => {
    mockSignOut.mockClear();
    mockUseSession.mockClear();
  });

  it("renders nothing when there is no session", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: vi.fn(),
    });
    const { container } = render(<Navbar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the authenticated user's display name", () => {
    mockUseSession.mockReturnValue({
      data: SESSION_WITH_IMAGE,
      status: "authenticated",
      update: vi.fn(),
    });
    render(<Navbar />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("shows avatar image when session provides one", () => {
    mockUseSession.mockReturnValue({
      data: SESSION_WITH_IMAGE,
      status: "authenticated",
      update: vi.fn(),
    });
    render(<Navbar />);
    expect(
      screen.getByRole("img", { name: "Test User" }),
    ).toHaveAttribute("data-src", SESSION_WITH_IMAGE.user.image);
  });

  it("omits avatar image when session has no image", () => {
    mockUseSession.mockReturnValue({
      data: SESSION_WITHOUT_IMAGE,
      status: "authenticated",
      update: vi.fn(),
    });
    render(<Navbar />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders a link to the home page", () => {
    mockUseSession.mockReturnValue({
      data: SESSION_WITH_IMAGE,
      status: "authenticated",
      update: vi.fn(),
    });
    render(<Navbar />);
    // "Graph" + <span>Hub</span> → accessible name is "Graph Hub" (with space)
    expect(
      screen.getByRole("link", { name: /Graph\s*Hub/i }),
    ).toHaveAttribute("href", "/");
  });

  it("calls signOut when the logout button is clicked", async () => {
    const user = userEvent.setup();
    mockUseSession.mockReturnValue({
      data: SESSION_WITH_IMAGE,
      status: "authenticated",
      update: vi.fn(),
    });
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: "ログアウト" }));
    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});
