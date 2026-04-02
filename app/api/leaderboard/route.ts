import { NextResponse } from "next/server";

import { readStore } from "@/lib/store";
import { attachSets, calculateLeaderboard } from "@/lib/scoring";

export async function GET() {
  const store = await readStore();
  const leaderboard = calculateLeaderboard(store.players, attachSets(store.matches, store.matchSets));
  return NextResponse.json({ leaderboard });
}
