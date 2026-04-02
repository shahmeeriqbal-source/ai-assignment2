import { readStore } from "@/lib/store";
import { attachSets, calculateLeaderboard } from "@/lib/scoring";
import { LeaderboardClient } from "@/components/leaderboard-client";

export default async function LeaderboardPage() {
  const store = await readStore();
  const matches = attachSets(store.matches, store.matchSets);
  const leaderboard = calculateLeaderboard(store.players, matches);

  return <LeaderboardClient leaderboard={leaderboard} />;
}
