import { NextRequest, NextResponse } from "next/server";

import { readStore } from "@/lib/store";
import { attachSets, calculateHeadToHead } from "@/lib/scoring";

export async function GET(request: NextRequest) {
  const playerAId = request.nextUrl.searchParams.get("playerAId");
  const playerBId = request.nextUrl.searchParams.get("playerBId");

  if (!playerAId || !playerBId) {
    return NextResponse.json({ message: "Both player IDs are required." }, { status: 400 });
  }

  const store = await readStore();
  const summary = calculateHeadToHead(
    store.players,
    attachSets(store.matches, store.matchSets),
    playerAId,
    playerBId
  );

  if (!summary) {
    return NextResponse.json({ message: "Players not found." }, { status: 404 });
  }

  return NextResponse.json(summary);
}
