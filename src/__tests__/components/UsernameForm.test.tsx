import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsernameForm } from "~/app/_components/UsernameForm";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("UsernameForm", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders the username label, input, and submit button", () => {
    render(<UsernameForm />);
    expect(screen.getByLabelText("ユーザー名")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "相関図を表示" }),
    ).toBeInTheDocument();
  });

  it("navigates to /graph/:username on valid submit", async () => {
    const user = userEvent.setup();
    render(<UsernameForm />);

    await user.type(screen.getByLabelText("ユーザー名"), "torvalds");
    await user.click(screen.getByRole("button", { name: "相関図を表示" }));

    expect(mockPush).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith("/graph/torvalds");
  });

  it("trims surrounding whitespace before navigating", async () => {
    const user = userEvent.setup();
    render(<UsernameForm />);

    await user.type(screen.getByLabelText("ユーザー名"), "  octocat  ");
    await user.click(screen.getByRole("button", { name: "相関図を表示" }));

    expect(mockPush).toHaveBeenCalledWith("/graph/octocat");
  });

  it("does not navigate when the input is empty", async () => {
    const user = userEvent.setup();
    render(<UsernameForm />);

    await user.click(screen.getByRole("button", { name: "相関図を表示" }));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("updates the input value as the user types", async () => {
    const user = userEvent.setup();
    render(<UsernameForm />);

    const input = screen.getByLabelText("ユーザー名");
    await user.type(input, "linus");

    expect(input).toHaveValue("linus");
  });
});
