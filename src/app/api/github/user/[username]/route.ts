import { auth } from "~/server/auth";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { username: string } },
) {
  const session = await auth();
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(
    `https://api.github.com/users/${params.username}`,
    {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: `GitHub API error: ${response.status}` },
      { status: response.status },
    );
  }

  const data: unknown = await response.json();
  return NextResponse.json(data);
}
