import { readStore } from "@/lib/store";
import { attachSets, calculateLeaderboard } from "@/lib/scoring";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const store = await readStore();
  const matches = attachSets(store.matches, store.matchSets);
  const leaderboard = calculateLeaderboard(store.players, matches).slice(0, 3);

  return <DashboardClient players={store.players} matches={matches} leaderboard={leaderboard} />;
}
