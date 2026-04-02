import { NextRequest, NextResponse } from "next/server";

import { searchPlayers } from "@/lib/store";

export async function GET(request: NextRequest) {
  const players = await searchPlayers(request.nextUrl.searchParams.get("q") ?? undefined);
  return NextResponse.json({ players });
}
