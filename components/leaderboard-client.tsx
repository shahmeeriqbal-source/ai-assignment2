"use client";

import { SiteShell } from "@/components/site-shell";
import type { LeaderboardRow } from "@/lib/types";

export function LeaderboardClient({ leaderboard }: { leaderboard: LeaderboardRow[] }) {
  return (
    <SiteShell
      title="Reward consistency across the local ladder."
      subtitle="Three points for a win, one for a completed loss, then tie-break by win percentage and set differential."
    >
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Played</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Points</th>
              <th>Win %</th>
              <th>Set diff</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, index) => (
              <tr key={row.playerId}>
                <td>{index + 1}</td>
                <td>{row.playerName}</td>
                <td>{row.matchesPlayed}</td>
                <td>{row.wins}</td>
                <td>{row.losses}</td>
                <td>{row.points}</td>
                <td>{(row.winPercentage * 100).toFixed(0)}%</td>
                <td>{row.setDifferential}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SiteShell>
  );
}
